// arc-cache.spec.ts -- S7-GAL-M5 unit tests
// SimulationService.getCachedArcContext: memoize arc context per attemptId.
//
// Test items:
//   M1: same attemptId called twice -> arcLoader called exactly once (cache hit)
//   M2: two distinct attemptIds -> arcLoader called once per id (2 total)
//   M3: after eviction (finishAttempt / COMPLETED), cache empty; next call re-queries DB
//   M4: cache returns null for session 1 (arcLoader returns null; stays null on re-call)

import { SimulationService } from "../simulation/simulation.service.js";
import type { ArcSessionContext } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ATTEMPT_ID_A = "attempt-cache-A";
const ATTEMPT_ID_B = "attempt-cache-B";
const USER_ID = "user-cache-001";
const TEMPLATE_ID = "template-cache-001";

const MOCK_ARC_CTX: ArcSessionContext = {
  sessionNumber: 1,
  trustLevel: 0.45,
  opennessLevel: 0.38,
  allianceScore: 0.52,
  symptomMarkerState: { unlockedFactIds: ["fact-01"] },
  notableMomentsSummary: "Good session.",
};

function makeArcLoaderMock(returnValue: ArcSessionContext | null = MOCK_ARC_CTX) {
  return {
    loadArcContext: jest.fn().mockResolvedValue(returnValue),
  };
}

/**
 * Build a minimal SimulationService instance for cache tests.
 * Only arcLoaderService and the cache field are exercised.
 */
function makeService(arcLoader: { loadArcContext: jest.Mock }) {
  // Provide stub no-ops for all other constructor dependencies.
  const stub = {} as never;
  return new SimulationService(
    stub, // prisma
    stub, // pipeline
    stub, // evaluationService
    arcLoader as never,
    stub, // arcWriterService
  );
}

// ---------------------------------------------------------------------------
// M-series: arc context cache tests
// ---------------------------------------------------------------------------

describe("S7-GAL-M5: SimulationService arc context cache", () => {
  it("M1: same attemptId called twice -> arcLoader.loadArcContext called exactly once", async () => {
    const arcLoader = makeArcLoaderMock();
    const service = makeService(arcLoader);

    // Call getCachedArcContext twice for same attemptId
    const r1 = await (service as never as {
      getCachedArcContext(a: string, b: string, c: string, d: number): Promise<ArcSessionContext | null>;
    }).getCachedArcContext(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);

    const r2 = await (service as never as {
      getCachedArcContext(a: string, b: string, c: string, d: number): Promise<ArcSessionContext | null>;
    }).getCachedArcContext(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);

    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(MOCK_ARC_CTX);
    expect(r2).toEqual(MOCK_ARC_CTX);
  });

  it("M2: two distinct attemptIds -> arcLoader called once per id (2 total)", async () => {
    const arcLoader = makeArcLoaderMock();
    const service = makeService(arcLoader);

    type CacheMethod = (a: string, b: string, c: string, d: number) => Promise<ArcSessionContext | null>;
    const getCached = (service as never as { getCachedArcContext: CacheMethod }).getCachedArcContext.bind(service);

    await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);
    await getCached(ATTEMPT_ID_B, USER_ID, TEMPLATE_ID, 2);

    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(2);
    // Each attempt id called loadArcContext exactly once
    expect(arcLoader.loadArcContext).toHaveBeenNthCalledWith(1, USER_ID, TEMPLATE_ID, 2);
    expect(arcLoader.loadArcContext).toHaveBeenNthCalledWith(2, USER_ID, TEMPLATE_ID, 2);
  });

  it("M3: after eviction (delete from cache), next call re-queries arcLoader", async () => {
    const arcLoader = makeArcLoaderMock();
    const service = makeService(arcLoader);

    type CacheMethod = (a: string, b: string, c: string, d: number) => Promise<ArcSessionContext | null>;
    const getCached = (service as never as { getCachedArcContext: CacheMethod }).getCachedArcContext.bind(service);
    const cache = (service as never as { arcContextCache: Map<string, ArcSessionContext | null> }).arcContextCache;

    // Prime the cache
    await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);
    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(1);

    // Evict (simulates COMPLETED transition)
    cache.delete(ATTEMPT_ID_A);

    // Next call must re-query arcLoader
    await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);
    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(2);
  });

  it("M4: arcLoader returns null (session 1) -> null cached; re-call also returns null without re-query", async () => {
    const arcLoader = makeArcLoaderMock(null);
    const service = makeService(arcLoader);

    type CacheMethod = (a: string, b: string, c: string, d: number) => Promise<ArcSessionContext | null>;
    const getCached = (service as never as { getCachedArcContext: CacheMethod }).getCachedArcContext.bind(service);

    const r1 = await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 1);
    const r2 = await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 1);

    expect(r1).toBeNull();
    expect(r2).toBeNull();
    // arcLoader only queried once despite two calls
    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(1);
  });

  it("M5 (Oren S7 MINOR-4 / Adi FLAG-3): finishAttempt itself evicts the cache entry", async () => {
    const arcLoader = makeArcLoaderMock();
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({ id: ATTEMPT_ID_A, userId: USER_ID }),
        update: jest.fn().mockResolvedValue({ id: ATTEMPT_ID_A, status: "COMPLETED" }),
      },
    };
    const arcWriter = { writeSessionSummary: jest.fn().mockResolvedValue(undefined) };
    const stub = {} as never;
    const service = new SimulationService(
      prisma as never,
      stub, // pipeline
      stub, // evaluationService
      arcLoader as never,
      arcWriter as never,
    );

    type CacheMethod = (a: string, b: string, c: string, d: number) => Promise<ArcSessionContext | null>;
    const getCached = (service as never as { getCachedArcContext: CacheMethod }).getCachedArcContext.bind(service);
    const cache = (service as never as { arcContextCache: Map<string, ArcSessionContext | null> }).arcContextCache;

    // Prime the cache, prove the entry exists
    await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);
    expect(cache.has(ATTEMPT_ID_A)).toBe(true);

    // Real eviction path: finishAttempt -> COMPLETED -> cache.delete
    await service.finishAttempt(ATTEMPT_ID_A, USER_ID);
    expect(cache.has(ATTEMPT_ID_A)).toBe(false);

    // Regression guard: a removed eviction line would leave the entry and fail here
    await getCached(ATTEMPT_ID_A, USER_ID, TEMPLATE_ID, 2);
    expect(arcLoader.loadArcContext).toHaveBeenCalledTimes(2);
  });
});
