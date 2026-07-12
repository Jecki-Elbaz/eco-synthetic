// @aps/shared-types -- Arc session continuity types (S5 Track B)
// ArcSessionContext: loaded by arc-loader.service at session N start from the N-1 summary.
// Used by TurnPipeline (context-builder) to inject prior-session state into the patient prompt.

/**
 * Context carried from a completed session into the next session.
 * Loaded by ArcLoaderService; injected into TurnPipelineInput.arcContext.
 * Session 3 loads only the session-2 summary. Session-1 formulation anchors
 * not recoverable in session 3 if session-2 summary omitted them.
 * Known pilot-1 limitation; accepted. Ref: feasibility Section 4.
 */
export interface ArcSessionContext {
  /** Session number of the PREVIOUS session this context came from. */
  sessionNumber: number;
  /** Final trust level after the previous session (post-clamp). */
  trustLevel: number;
  /** Final openness level after the previous session (post-clamp). */
  opennessLevel: number;
  /** Final therapeutic alliance score after the previous session (post-clamp). */
  allianceScore: number;
  /** Symptom markers unlocked by the end of the previous session. */
  symptomMarkerState: Record<string, unknown>;
  /** Rolling summary of notable moments from the previous session. */
  notableMomentsSummary: string;
}
