// preview-client.ts -- typed client for AUTHOR_PREVIEW endpoints.
// Wires to:
//   POST /assignments/:assignmentId/preview  (PreviewController -- TEACHER/SYSTEM_ADMIN only)
//   GET  /courses                            (OrgController -- actor-scoped)
//
// No mock mode: preview is always real-API. NEXT_PUBLIC_USE_MOCK has no effect here.

import { authedGet, authedPost } from "./http";

export type BotProfile = "COMPETENT" | "WEAK" | "TYPICAL";

export interface AssignmentSummary {
  id: string;
  courseId: string;
  courseName: string;
  simulationTemplateId: string;
}

interface CourseFromApi {
  id: string;
  name: string;
  assignments: Array<{
    id: string;
    courseId: string;
    simulationTemplateId: string;
  }>;
}

/**
 * GET /courses -> flatten all assignments -> filter by simulationTemplateId.
 * Returns assignments the authenticated teacher can see that are linked to the
 * given template. Empty array when none exist.
 */
export async function fetchAssignmentsForTemplate(
  templateId: string,
): Promise<AssignmentSummary[]> {
  const courses = await authedGet<CourseFromApi[]>("courses");
  const result: AssignmentSummary[] = [];
  for (const course of courses) {
    for (const asgn of course.assignments ?? []) {
      if (asgn.simulationTemplateId === templateId) {
        result.push({
          id: asgn.id,
          courseId: asgn.courseId,
          courseName: course.name,
          simulationTemplateId: asgn.simulationTemplateId,
        });
      }
    }
  }
  return result;
}

/**
 * POST /assignments/:assignmentId/preview { profile } -> { attemptId }.
 * Synchronous: the full bot run + evaluation completes within this single call.
 * May take several seconds; caller should show a loading state.
 * Throws ApiError on non-2xx (403 if caller is not TEACHER/SYSTEM_ADMIN).
 */
export async function runPreview(
  assignmentId: string,
  profile: BotProfile,
): Promise<{ attemptId: string }> {
  return authedPost<{ attemptId: string }>(
    `assignments/${encodeURIComponent(assignmentId)}/preview`,
    { profile },
  );
}
