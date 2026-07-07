// Diagnostic log redaction (APS-REQ-106)
// Strips tokens, transcript text, and student notes from a raw diagnostic payload
// before the DiagnosticLog row is persisted.
//
// Pure function: no DB, no LLM, no external deps.

// ---------------------------------------------------------------------------
// Fields that must be scrubbed from any diagnostic payload
// ---------------------------------------------------------------------------

/** Top-level string keys whose values are redacted unconditionally. */
const SENSITIVE_TOP_LEVEL_KEYS = new Set([
  "token",
  "accessToken",
  "refreshToken",
  "jwt",
  "authorization",
  "password",
  "secret",
  "apiKey",
  "api_key",
  "transcriptText",
  "studentNotes",
  "teacherNotes",
  "originalText",
  "contextSummary",
  "personaPrompt",
]);

const REDACTED_MARKER = "[REDACTED]";

/** Deep-clone and redact a payload object. */
export function redactDiagnosticPayload(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  return redactValue(raw) as Record<string, unknown>;
}

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    // Redact values that look like JWT tokens (three base64 segments)
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
      return REDACTED_MARKER;
    }
    return value;
  }

  if (Array.isArray(value)) {
    // Arrays: redact element-by-element (e.g. messages array)
    // If the array elements look like transcript message objects, redact their text
    return value.map((item) => {
      if (isTranscriptMessage(item)) {
        return redactTranscriptMessage(item as Record<string, unknown>);
      }
      return redactValue(item);
    });
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lk = k.toLowerCase();
      if (
        SENSITIVE_TOP_LEVEL_KEYS.has(k) ||
        lk.includes("token") ||
        lk.includes("transcript") ||
        lk.includes("notes") ||
        lk.includes("password") ||
        lk.includes("secret") ||
        lk.includes("prompt")
      ) {
        result[k] = REDACTED_MARKER;
      } else {
        result[k] = redactValue(v);
      }
    }
    return result;
  }

  // Numbers, booleans: pass through
  return value;
}

function isTranscriptMessage(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj["role"] === "string" &&
    (obj["role"] === "STUDENT" || obj["role"] === "PATIENT") &&
    typeof obj["originalText"] === "string"
  );
}

function redactTranscriptMessage(
  msg: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...msg,
    originalText: REDACTED_MARKER,
    ...(msg["nonVerbalCues"] !== undefined ? { nonVerbalCues: REDACTED_MARKER } : {}),
  };
}
