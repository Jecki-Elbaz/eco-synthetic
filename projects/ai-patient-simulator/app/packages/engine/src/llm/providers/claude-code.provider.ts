// ClaudeCodeProvider -- DEV-ONLY provider backed by the local Claude Code CLI.
//
// WHY THIS EXISTS
// The owner holds a Claude MAX subscription, not API billing. A Max subscription
// is not reachable over the Anthropic API; the only supported programmatic surface
// is the Claude Code CLI in headless mode (`claude -p`), which authenticates with
// the subscription the machine is already signed into. This provider shells out to
// that binary so local development can see real patient responses instead of
// StubProvider's fixed string.
//
// SCOPE -- READ BEFORE PROMOTING
//   * DEV / LOCAL ONLY. Selected only when LLM_PROVIDER=claude-code.
//     The default remains "stub"; nothing changes unless that var is set.
//   * This is NOT the APS-004 production path. A hosted deployment cannot depend
//     on a developer's desktop CLI or personal subscription. Shipping to the pilot
//     still requires a real API-billed provider behind the APS-004 gate.
//   * Every call consumes the owner's personal Max usage allowance, shared with
//     their own interactive Claude Code usage.
//
// KNOWN FIDELITY GAPS vs a direct API provider (the CLI exposes no flag for these):
//   * temperature is IGNORED. Guard/analyser calls that ask for 0.0 are not
//     deterministic here; patient calls asking for 0.7 are not tuned.
//   * maxOutputTokens is IGNORED (passed as guidance in the system prompt only).
//   * `cached` is derived from cache_read_input_tokens and is approximate.
// Treat engine behaviour observed under this provider as indicative, not exact.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMMessage,
} from "../provider.interface.js";
import { ModelHint } from "../provider.interface.js";

/** Shape of `claude -p --output-format json` on success. */
interface ClaudeCliResult {
  is_error: boolean;
  subtype?: string;
  result?: string;
  api_error_status?: string | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
  };
  modelUsage?: Record<string, { canonicalModel?: string }>;
}

export interface ClaudeCodeProviderOptions {
  /** Absolute path to the claude binary. Defaults to CLAUDE_CODE_BIN or "claude". */
  binPath?: string;
  /** Per-call timeout in ms. Default 120000 -- CLI startup alone is ~5s. */
  timeoutMs?: number;
  /** Model alias for the patient-facing generation. Default "sonnet". */
  patientModel?: string;
  /**
   * Model alias for guard/analyser/summariser. Default "sonnet".
   *
   * COUNTER-INTUITIVE, MEASURED 2026-07-26: haiku is NOT the fast choice here.
   * On an identical patient-turn prompt through this CLI path:
   *   sonnet -> 5.9s inference,    50 output tokens
   *   haiku  -> 45.4s inference, 4157 output tokens (runaway generation)
   * haiku does not respect the terse output contract and rambles, so it loses
   * badly on wall-clock despite being the "lighter" tier. Benchmark before
   * changing this; do not assume the cheap model is the quick one.
   */
  lightModel?: string;
  /** Working directory for the spawned CLI. Defaults to the OS temp dir. */
  cwd?: string;
}

/**
 * Model per intent. Mirrors the tiering the production comments describe:
 * premium for patient generation, lighter tier for the mechanical passes.
 */
function modelForHint(hint: ModelHint, opts: Required<Pick<ClaudeCodeProviderOptions, "patientModel" | "lightModel">>): string {
  switch (hint) {
    case ModelHint.PATIENT_RESPONSE:
    case ModelHint.EVALUATOR:
    case ModelHint.DEBRIEF:
      return opts.patientModel;
    case ModelHint.GUARD_PASS:
    case ModelHint.ANALYSER:
    case ModelHint.SUMMARISER:
      return opts.lightModel;
    default:
      return opts.lightModel;
  }
}

/**
 * Claude Code is a coding agent by default and will happily add preamble
 * ("Here is the response:") or wrap output in fences. The engine's own prompts
 * define the output contract, so this only enforces "emit the artefact, nothing
 * else" -- it deliberately does NOT inject task semantics of its own.
 */
const OUTPUT_DISCIPLINE = [
  "You are being used as a raw text-completion endpoint by an application.",
  "Follow the instructions in the message you receive exactly.",
  "Output ONLY the requested content and nothing else.",
  "Never add preamble, explanation, apology, or commentary.",
  "Never wrap the output in markdown code fences unless explicitly asked to.",
  "If asked for JSON, emit bare JSON only, starting with { or [.",
].join(" ");

/**
 * Strip markdown fences the CLI sometimes adds despite instructions.
 * Only unwraps when the ENTIRE payload is one fenced block, so legitimate
 * prose containing a fence is left untouched.
 */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)\n?```$/;
  const m = fence.exec(trimmed);
  return m?.[1] !== undefined ? m[1].trim() : trimmed;
}

/**
 * Render the message array into a single prompt delivered over stdin.
 * System messages are hoisted into --system-prompt; the rest becomes a labelled
 * transcript. stdin is used (not argv) because Hebrew transcripts routinely
 * exceed the Windows ~32k command-line limit.
 */
function renderMessages(messages: LLMMessage[]): { system: string; prompt: string } {
  const systemParts: string[] = [];
  const turns: string[] = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(m.content);
      continue;
    }
    turns.push(`${m.role === "user" ? "User" : "Assistant"}: ${m.content}`);
  }

  const system = [OUTPUT_DISCIPLINE, ...systemParts].join("\n\n");
  // A single user message needs no role labelling -- keep the prompt clean.
  const prompt =
    turns.length === 1 && messages.filter((m) => m.role !== "system").length === 1
      ? turns[0]!.replace(/^User: /, "")
      : turns.join("\n\n");

  return { system, prompt };
}

export class ClaudeCodeProvider implements LLMProvider {
  private readonly binPath: string;
  private readonly timeoutMs: number;
  private readonly patientModel: string;
  private readonly lightModel: string;
  private readonly cwd: string;

  constructor(opts: ClaudeCodeProviderOptions = {}) {
    this.binPath = opts.binPath ?? process.env.CLAUDE_CODE_BIN ?? "claude";
    this.timeoutMs = opts.timeoutMs ?? 120_000;
    this.patientModel = opts.patientModel ?? process.env.CLAUDE_CODE_PATIENT_MODEL ?? "sonnet";
    // Default sonnet, not haiku -- see ClaudeCodeProviderOptions.lightModel.
    this.lightModel = opts.lightModel ?? process.env.CLAUDE_CODE_LIGHT_MODEL ?? "sonnet";
    // Neutral cwd: keeps the CLI away from the repo so no project CLAUDE.md,
    // settings, or git state can leak into a patient-response prompt.
    this.cwd = opts.cwd ?? tmpdir();
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const model = modelForHint(req.modelHint, {
      patientModel: this.patientModel,
      lightModel: this.lightModel,
    });
    const { system, prompt } = renderMessages(req.messages);

    // maxOutputTokens has no CLI flag -- surface it as guidance so long-form
    // hints (patient turns, debrief) do not run away.
    const systemWithBudget = `${system}\n\nKeep the response under roughly ${req.maxOutputTokens} tokens.`;

    const args = [
      "-p",
      "--model", model,
      "--output-format", "json",
      // Hard-isolate the session: no tools, no MCP, no CLAUDE.md/skills/hooks,
      // no slash commands, no session files written per turn.
      "--tools", "",
      "--safe-mode",
      "--strict-mcp-config",
      "--disable-slash-commands",
      "--no-session-persistence",
      "--system-prompt", systemWithBudget,
    ];

    const raw = await this.spawnCli(args, prompt);

    let parsed: ClaudeCliResult;
    try {
      parsed = JSON.parse(raw) as ClaudeCliResult;
    } catch {
      throw new Error(
        `ClaudeCodeProvider: could not parse CLI output as JSON. First 300 chars: ${raw.slice(0, 300)}`,
      );
    }

    if (parsed.is_error) {
      throw new Error(
        `ClaudeCodeProvider: CLI reported an error (subtype=${parsed.subtype ?? "unknown"}, api_status=${parsed.api_error_status ?? "none"}).`,
      );
    }
    if (typeof parsed.result !== "string") {
      throw new Error("ClaudeCodeProvider: CLI returned no result field.");
    }

    const cacheRead = parsed.usage?.cache_read_input_tokens ?? 0;
    const canonical = Object.values(parsed.modelUsage ?? {})[0]?.canonicalModel;

    return {
      text: stripCodeFence(parsed.result),
      inputTokens: parsed.usage?.input_tokens ?? 0,
      outputTokens: parsed.usage?.output_tokens ?? 0,
      modelId: `claude-code:${canonical ?? model}`,
      cached: cacheRead > 0,
    };
  }

  /**
   * Marginal cost is zero: a Max subscription is a flat fee, not per-token
   * billing. The CLI does report a notional total_cost_usd, but charging it to
   * the CreditLedger would invent spend that never occurs. Returning 0 keeps
   * dev ledgers honest -- and is another reason this provider is not the
   * production path, where real cost accounting matters.
   */
  estimateCost(_inputTokens: number, _outputTokens: number, _hint: ModelHint): number {
    return 0;
  }

  private spawnCli(args: string[], stdinPayload: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const child = spawn(this.binPath, args, {
        cwd: this.cwd,
        windowsHide: true,
        // No shell: binPath is a real executable, so argv is passed through
        // verbatim. This avoids shell quoting entirely -- important because
        // the system prompt contains newlines and non-ASCII text.
        shell: false,
        env: {
          ...process.env,
          // Ensure the CLI never tries to render interactive UI.
          CI: "1",
        },
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill("SIGKILL");
        reject(new Error(`ClaudeCodeProvider: CLI timed out after ${this.timeoutMs}ms.`));
      }, this.timeoutMs);

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (d: string) => { stdout += d; });
      child.stderr.on("data", (d: string) => { stderr += d; });

      child.on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(
          new Error(
            `ClaudeCodeProvider: failed to spawn "${this.binPath}". Is Claude Code installed and on PATH? Underlying: ${err.message}`,
          ),
        );
      });

      child.on("close", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (code !== 0) {
          reject(
            new Error(
              `ClaudeCodeProvider: CLI exited ${code}. stderr: ${stderr.slice(0, 500)}`,
            ),
          );
          return;
        }
        resolve(stdout);
      });

      child.stdin.end(stdinPayload, "utf8");
    });
  }
}
