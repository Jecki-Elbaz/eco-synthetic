/**
 * DebriefService -- question-cap + RBAC unit tests (APS-REQ-073, Inc 4)
 *
 * Mocks Prisma -- no live DB required.
 * Mirrors the mocking pattern from teacher-review-rbac.spec.ts.
 *
 * Cases:
 *   (a) Student (own attempt, PUBLISHED eval) can post a debrief message.
 *   (b) Student who does NOT own the attempt is forbidden.
 *   (c) Debrief rejected when no PUBLISHED evaluation exists.
 *   (d) Debrief question count is enforced: at cap -> neutral cap message returned, no LLM call.
 *   (e) Below cap -> supervisor is called, rows persisted.
 *   (f) Attempt not found -> NotFoundException.
 */

import { DebriefService } from "../debrief/debrief.service.js";
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";
import type { DebriefSupervisorOutput } from "@aps/engine";

// ---------------------------------------------------------------------------
// Fixture constants
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-debrief-unit-001";
const COURSE_A_ID = "course-debrief-a-001";
const STUDENT_ID = "student-debrief-001";
const OTHER_STUDENT_ID = "other-student-003";

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

const FAKE_ATTEMPT_PUBLISHED_EVAL = {
  id: ATTEMPT_ID,
  userId: STUDENT_ID,
  status: "COMPLETED",
  assignment: {
    courseId: COURSE_A_ID,
    rubricVersion: {
      id: "rubric-v1-001",
      criteria: [
        { id: "crit-001", labelKey: "empathy", weight: 0.5 },
      ],
    },
  },
  messages: [
    { role: "STUDENT", turnNumber: 1, originalText: "How are you?" },
    { role: "PATIENT", turnNumber: 1, originalText: "Not great." },
  ],
  evaluation: {
    id: "eval-001",
    attemptId: ATTEMPT_ID,
    status: "PUBLISHED",
    overallSummary: "Good session.",
    structuredScores: {
      "crit-001": { score: 7, maxScore: 10, evidence: [], notes: "", requiresTeacherReview: false },
    },
    transcriptHighlights: [],
  },
  debriefMessages: [],
};

const FAKE_ATTEMPT_NO_EVAL = {
  ...FAKE_ATTEMPT_PUBLISHED_EVAL,
  evaluation: null,
};

const FAKE_ATTEMPT_DRAFT_EVAL = {
  ...FAKE_ATTEMPT_PUBLISHED_EVAL,
  evaluation: {
    ...FAKE_ATTEMPT_PUBLISHED_EVAL.evaluation,
    status: "DRAFT",
  },
};

/** Build an attempt with N prior STUDENT debrief messages already in the DB. */
function makeAttemptWithDebriefMessages(count: number) {
  const msgs = [];
  for (let i = 0; i < count; i++) {
    msgs.push({ role: "STUDENT", turnNumber: i * 2 + 1, text: `Student question ${i}`, citedTurns: [] });
    msgs.push({ role: "SUPERVISOR", turnNumber: i * 2 + 2, text: `Supervisor response ${i}`, citedTurns: [1] });
  }
  return {
    ...FAKE_ATTEMPT_PUBLISHED_EVAL,
    debriefMessages: msgs,
  };
}

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function makePrisma(attempt: object | null) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(attempt),
    },
    debriefChat: {
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
}

const STUB_SUPERVISOR_OUTPUT: DebriefSupervisorOutput = {
  supervisorText: "Good observation! At turn 1, you could have probed further.",
  citedTurns: [1],
  inputTokensUsed: 10,
  outputTokensUsed: 10,
};

function makeSupervisorStub(output: DebriefSupervisorOutput = STUB_SUPERVISOR_OUTPUT) {
  return {
    respond: jest.fn().mockResolvedValue(output),
  };
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

function studentScopes(): UserScope[] {
  return [{ role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_A_ID }];
}

// ---------------------------------------------------------------------------
// (a) Happy path
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- happy path (unit, mocked Prisma)", () => {
  it("(a) student (own attempt, PUBLISHED eval) receives supervisor response", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    const result = await service.postMessage(
      ATTEMPT_ID,
      { message: "Why did I miss the risk cue?" },
      STUDENT_ID,
      studentScopes(),
    );

    expect(result.supervisorText).toBeDefined();
    expect(typeof result.supervisorText).toBe("string");
    expect(result.supervisorText.length).toBeGreaterThan(0);
  });

  it("(a) supervisor.respond is called once on valid request", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await service.postMessage(ATTEMPT_ID, { message: "Help?" }, STUDENT_ID, studentScopes());

    expect(supervisor.respond).toHaveBeenCalledTimes(1);
  });

  it("(a) debriefChat.createMany is called to persist STUDENT + SUPERVISOR rows", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await service.postMessage(ATTEMPT_ID, { message: "Help?" }, STUDENT_ID, studentScopes());

    expect(prisma.debriefChat.createMany).toHaveBeenCalledTimes(1);
    const createCall = (prisma.debriefChat.createMany as jest.Mock).mock.calls[0] as [{ data: Array<{ role: string }> }];
    const roles = createCall[0].data.map((r) => r.role);
    expect(roles).toContain("STUDENT");
    expect(roles).toContain("SUPERVISOR");
  });

  it("(a) citedTurns are returned in response", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    const result = await service.postMessage(
      ATTEMPT_ID,
      { message: "Help?" },
      STUDENT_ID,
      studentScopes(),
    );

    expect(Array.isArray(result.citedTurns)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// (b) Not own attempt
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- not own attempt", () => {
  it("(b) student with OTHER attempt ID is forbidden", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL); // attempt belongs to STUDENT_ID
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage(ATTEMPT_ID, { message: "?" }, OTHER_STUDENT_ID, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(b) supervisor is NOT called when forbidden", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    try {
      await service.postMessage(ATTEMPT_ID, { message: "?" }, OTHER_STUDENT_ID, studentScopes());
    } catch {
      // expected
    }

    expect(supervisor.respond).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (c) No published evaluation
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- no published evaluation", () => {
  it("(c) rejects with UnprocessableEntityException when evaluation is null", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_NO_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage(ATTEMPT_ID, { message: "?" }, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it("(c) rejects with UnprocessableEntityException when evaluation is DRAFT", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_DRAFT_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage(ATTEMPT_ID, { message: "?" }, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});

// ---------------------------------------------------------------------------
// (d) Question cap enforcement
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- question cap enforcement", () => {
  const MAX_QUESTIONS = 10;

  it("(d) at cap (10 prior STUDENT questions), returns neutral cap message", async () => {
    const attempt = makeAttemptWithDebriefMessages(MAX_QUESTIONS);
    const prisma = makePrisma(attempt);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never, MAX_QUESTIONS);

    const result = await service.postMessage(
      ATTEMPT_ID,
      { message: "One more question?" },
      STUDENT_ID,
      studentScopes(),
    );

    expect(result.capped).toBe(true);
    expect(result.supervisorText).toContain("maximum number of debrief questions");
  });

  it("(d) supervisor is NOT called when cap is reached", async () => {
    const attempt = makeAttemptWithDebriefMessages(MAX_QUESTIONS);
    const prisma = makePrisma(attempt);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never, MAX_QUESTIONS);

    await service.postMessage(
      ATTEMPT_ID,
      { message: "?" },
      STUDENT_ID,
      studentScopes(),
    );

    expect(supervisor.respond).not.toHaveBeenCalled();
  });

  it("(d) debriefChat.createMany is NOT called when cap is reached", async () => {
    const attempt = makeAttemptWithDebriefMessages(MAX_QUESTIONS);
    const prisma = makePrisma(attempt);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never, MAX_QUESTIONS);

    await service.postMessage(ATTEMPT_ID, { message: "?" }, STUDENT_ID, studentScopes());

    expect(prisma.debriefChat.createMany).not.toHaveBeenCalled();
  });

  it("(e) below cap (9 prior STUDENT questions), supervisor is called", async () => {
    const attempt = makeAttemptWithDebriefMessages(MAX_QUESTIONS - 1);
    const prisma = makePrisma(attempt);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never, MAX_QUESTIONS);

    const result = await service.postMessage(
      ATTEMPT_ID,
      { message: "Question 10?" },
      STUDENT_ID,
      studentScopes(),
    );

    expect(supervisor.respond).toHaveBeenCalledTimes(1);
    expect(result.capped).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// (f) Attempt not found
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- attempt not found", () => {
  it("(f) non-existent attemptId throws NotFoundException", async () => {
    const prisma = makePrisma(null);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage("nonexistent-id", { message: "?" }, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// (g) Empty message validation (MINOR-2)
// ---------------------------------------------------------------------------

describe("DebriefService.postMessage -- empty message rejected", () => {
  it("(g) empty string message throws BadRequestException", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage(ATTEMPT_ID, { message: "" }, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(BadRequestException);
  });

  it("(g) whitespace-only message throws BadRequestException", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    await expect(
      service.postMessage(ATTEMPT_ID, { message: "   " }, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(BadRequestException);
  });

  it("(g) supervisor is NOT called when message is empty", async () => {
    const prisma = makePrisma(FAKE_ATTEMPT_PUBLISHED_EVAL);
    const supervisor = makeSupervisorStub();
    const service = new DebriefService(prisma as never, supervisor as never);

    try {
      await service.postMessage(ATTEMPT_ID, { message: "" }, STUDENT_ID, studentScopes());
    } catch {
      // expected
    }

    expect(supervisor.respond).not.toHaveBeenCalled();
  });
});
