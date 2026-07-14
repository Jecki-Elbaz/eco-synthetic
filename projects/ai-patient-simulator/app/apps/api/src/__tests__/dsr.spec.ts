// dsr.spec.ts -- S7-GAL-DSR unit tests
// SimulationService.deleteStudentData(userId): DSR delete function.
//
// Test items:
//   D1: arcSessionSummary.deleteMany called with { where: { userId: targetId } }
//   D2: attempt.deleteMany called with { where: { userId: targetId } }
//   D3: no deleteMany call uses a where clause containing a different userId (data isolation)
//   D4: $transaction wraps all deletes (callback form -- all calls run within the tx)
//   D5: all non-cascading Attempt children are deleted before Attempt rows
//       (Message, PatientStateLog, Evaluation, DebriefChat, UsageLog, SupportTicket)
//   D6 (Oren S7 MAJOR-1): supportTicket delete is userId-scoped, so tickets with
//       attemptId = null are covered; linked DiagnosticLog rows swept

import { SimulationService } from "../simulation/simulation.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TARGET_USER = "user-dsr-target-001";
const OTHER_USER = "user-dsr-other-002";
const ATTEMPT_ID_1 = "attempt-dsr-001";
const ATTEMPT_ID_2 = "attempt-dsr-002";

/** Build a mock tx object that records all deleteMany/findMany calls. */
function makeTx() {
  return {
    arcSessionSummary: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    attempt: {
      findMany: jest.fn().mockResolvedValue([
        { id: ATTEMPT_ID_1 },
        { id: ATTEMPT_ID_2 },
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    debriefChat: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    evaluation: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    usageLog: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    supportTicket: {
      findMany: jest.fn().mockResolvedValue([
        { diagnosticLogId: "diag-dsr-001" },
        { diagnosticLogId: null },
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    diagnosticLog: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    patientStateLog: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    message: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };
}

/** Build a minimal SimulationService instance with mocked Prisma. */
function makeService() {
  const tx = makeTx();
  // prisma.$transaction receives the async callback and calls it with tx
  const prisma = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: jest.fn().mockImplementation((fn: (tx: any) => Promise<void>) => fn(tx)),
    // Expose tx for inspection
    __tx: tx,
  };

  const stub = {} as never;
  const service = new SimulationService(
    prisma as never,
    stub,
    stub,
    stub,
    stub,
  );

  return { service, prisma, tx };
}

// ---------------------------------------------------------------------------
// D-series: DSR delete tests
// ---------------------------------------------------------------------------

describe("S7-GAL-DSR: SimulationService.deleteStudentData", () => {
  it("D1: arcSessionSummary.deleteMany called with { where: { userId: targetId } }", async () => {
    const { service, tx } = makeService();
    await service.deleteStudentData(TARGET_USER);

    expect(tx.arcSessionSummary.deleteMany).toHaveBeenCalledWith({
      where: { userId: TARGET_USER },
    });
  });

  it("D2: attempt.deleteMany called with { where: { userId: targetId } }", async () => {
    const { service, tx } = makeService();
    await service.deleteStudentData(TARGET_USER);

    expect(tx.attempt.deleteMany).toHaveBeenCalledWith({
      where: { userId: TARGET_USER },
    });
  });

  it("D3: data isolation -- no deleteMany uses a where clause tied to a different userId", async () => {
    const { service, tx } = makeService();
    await service.deleteStudentData(TARGET_USER);

    // Collect all deleteMany calls across all tables
    const allCalls = [
      tx.arcSessionSummary.deleteMany,
      tx.attempt.deleteMany,
      tx.debriefChat.deleteMany,
      tx.evaluation.deleteMany,
      tx.usageLog.deleteMany,
      tx.supportTicket.deleteMany,
      tx.patientStateLog.deleteMany,
      tx.message.deleteMany,
    ].flatMap((mock) => (mock as jest.Mock).mock.calls);

    // No call should reference OTHER_USER
    const otherUserLeak = allCalls.some((callArgs) =>
      JSON.stringify(callArgs).includes(OTHER_USER),
    );
    expect(otherUserLeak).toBe(false);
  });

  it("D4: $transaction wraps all deletes (callback invoked with tx, all deletes inside)", async () => {
    const { service, prisma, tx } = makeService();
    await service.deleteStudentData(TARGET_USER);

    // $transaction must have been called exactly once
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // All table deletes happen inside the transaction (tx has been called)
    expect(tx.arcSessionSummary.deleteMany).toHaveBeenCalled();
    expect(tx.attempt.deleteMany).toHaveBeenCalled();
    expect(tx.message.deleteMany).toHaveBeenCalled();
    expect(tx.patientStateLog.deleteMany).toHaveBeenCalled();
    expect(tx.evaluation.deleteMany).toHaveBeenCalled();
    expect(tx.debriefChat.deleteMany).toHaveBeenCalled();
    expect(tx.usageLog.deleteMany).toHaveBeenCalled();
    expect(tx.supportTicket.deleteMany).toHaveBeenCalled();
  });

  it("D5: all non-cascading Attempt children deleted before Attempt rows", async () => {
    const { service, tx } = makeService();

    // Track call order using a shared counter
    const callOrder: string[] = [];
    (tx.arcSessionSummary.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("arcSessionSummary");
      return Promise.resolve({ count: 0 });
    });
    (tx.debriefChat.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("debriefChat");
      return Promise.resolve({ count: 0 });
    });
    (tx.evaluation.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("evaluation");
      return Promise.resolve({ count: 0 });
    });
    (tx.usageLog.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("usageLog");
      return Promise.resolve({ count: 0 });
    });
    (tx.supportTicket.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("supportTicket");
      return Promise.resolve({ count: 0 });
    });
    (tx.patientStateLog.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("patientStateLog");
      return Promise.resolve({ count: 0 });
    });
    (tx.message.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("message");
      return Promise.resolve({ count: 0 });
    });
    (tx.attempt.deleteMany as jest.Mock).mockImplementation(() => {
      callOrder.push("attempt");
      return Promise.resolve({ count: 2 });
    });

    await service.deleteStudentData(TARGET_USER);

    // Attempt must be last
    expect(callOrder[callOrder.length - 1]).toBe("attempt");
    // All children must appear before attempt
    const attemptIndex = callOrder.indexOf("attempt");
    const childTables = ["debriefChat", "evaluation", "usageLog", "supportTicket", "patientStateLog", "message"];
    for (const table of childTables) {
      const idx = callOrder.indexOf(table);
      expect(idx).toBeGreaterThanOrEqual(0); // must be present
      expect(idx).toBeLessThan(attemptIndex); // must come before attempt
    }
  });

  it("D6: supportTicket delete is userId-scoped (covers attemptId=null tickets) and sweeps linked DiagnosticLog rows", async () => {
    const { service, tx } = makeService();
    await service.deleteStudentData(TARGET_USER);

    // userId-scoped, NOT attemptId-scoped (Oren S7 MAJOR-1)
    expect(tx.supportTicket.deleteMany).toHaveBeenCalledWith({
      where: { userId: TARGET_USER },
    });
    // DiagnosticLog rows referenced by the deleted tickets are swept (null ids filtered)
    expect(tx.diagnosticLog.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["diag-dsr-001"] } },
    });
  });

  it("D7: no DiagnosticLog delete when the student's tickets have no diagnostic logs", async () => {
    const { service, tx } = makeService();
    (tx.supportTicket.findMany as jest.Mock).mockResolvedValue([{ diagnosticLogId: null }]);
    await service.deleteStudentData(TARGET_USER);

    expect(tx.diagnosticLog.deleteMany).not.toHaveBeenCalled();
  });
});
