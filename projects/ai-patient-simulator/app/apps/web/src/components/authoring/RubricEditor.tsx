"use client";

// RubricEditor -- Step 4 of the case-authoring flow.
// Teacher triggers DRAFT generation, edits each criterion, then publishes.
// After publish, the rubric version is shown as LOCKED/immutable.
// risk_awareness criterion is always marked formativeOnly (weight 0) -- shown with badge.
// APS-REQ-039/040/041

import { useState } from "react";
import type {
  RubricVersionResponse,
  RubricCriterionResponse,
  UpdateCriterionRequest,
  ScoringAnchor,
  CriterionLabels,
} from "@aps/shared-types";

interface Props {
  templateId: string;
  onGenerate: () => Promise<RubricVersionResponse>;
  onUpdateCriterion: (
    rubricVersionId: string,
    criterionId: string,
    req: UpdateCriterionRequest,
  ) => Promise<void>;
  onPublish: (rubricVersionId: string) => Promise<RubricVersionResponse>;
}

// Local editable state per criterion (mirrors UpdateCriterionRequest)
interface CriterionEdit {
  labels: CriterionLabels;
  weight: number;
  maxScore: number;
  scoringAnchors: ScoringAnchor[];
  competencyId: string;
  formativeOnly: boolean;
  dirty: boolean;
  saving: boolean;
}

function initEdits(
  criteria: RubricCriterionResponse[],
): Record<string, CriterionEdit> {
  const map: Record<string, CriterionEdit> = {};
  for (const c of criteria) {
    map[c.id] = {
      labels: { ...c.labels },
      weight: c.weight,
      maxScore: c.maxScore,
      scoringAnchors: c.scoringAnchors.map((a) => ({ ...a })),
      competencyId: c.competencyId ?? "",
      formativeOnly: c.formativeOnly,
      dirty: false,
      saving: false,
    };
  }
  return map;
}

interface CriterionCardProps {
  criterion: RubricCriterionResponse;
  edit: CriterionEdit;
  published: boolean;
  onEdit: (update: Partial<CriterionEdit>) => void;
  onSave: () => Promise<void>;
}

function CriterionCard({
  criterion,
  edit,
  published,
  onEdit,
  onSave,
}: CriterionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    setSaveError(null);
    try {
      await onSave();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "שגיאה בשמירה.");
    }
  }

  function updateAnchor(idx: number, field: keyof ScoringAnchor, value: string | number) {
    const next = edit.scoringAnchors.map((a, i) =>
      i === idx ? { ...a, [field]: field === "score" ? Number(value) : value } : a,
    );
    onEdit({ scoringAnchors: next, dirty: true });
  }

  function addAnchor() {
    onEdit({
      scoringAnchors: [...edit.scoringAnchors, { score: 0, label: "" }],
      dirty: true,
    });
  }

  function removeAnchor(idx: number) {
    onEdit({
      scoringAnchors: edit.scoringAnchors.filter((_, i) => i !== idx),
      dirty: true,
    });
  }

  const headerId = `criterion-header-${criterion.id}`;
  const bodyId = `criterion-body-${criterion.id}`;

  return (
    <div
      className={
        "auth-criterion-card" +
        (edit.formativeOnly ? " auth-criterion-card--formative" : "")
      }
    >
      <button
        type="button"
        className="auth-criterion-card__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
        id={headerId}
      >
        <span className="auth-criterion-card__key">
          {criterion.labelKey}
        </span>
        <span className="auth-criterion-card__title">
          {edit.labels.he}
        </span>
        {edit.formativeOnly && (
          <span className="auth-formative-badge">פורמטיבי בלבד | weight 0</span>
        )}
        <span
          className="auth-criterion-card__meta"
          aria-label={`ניקוד מקסימלי ${edit.maxScore}, משקל ${edit.weight}`}
        >
          {edit.maxScore} נק' | {edit.formativeOnly ? "0 (פורמטיבי)" : `${edit.weight}`}
        </span>
        {edit.dirty && !published && (
          <span style={{ fontSize: "0.7rem", color: "var(--color-warn-amber)", flexShrink: 0 }}>
            לא נשמר
          </span>
        )}
        <span
          className={
            "auth-criterion-card__chevron" +
            (expanded ? " auth-criterion-card__chevron--open" : "")
          }
          aria-hidden="true"
        >
          {expanded ? "v" : ">"}
        </span>
      </button>

      {expanded && (
        <div
          className="auth-criterion-card__body"
          id={bodyId}
          role="region"
          aria-labelledby={headerId}
        >
          {saveError && (
            <div className="auth-error" role="alert">
              {saveError}
            </div>
          )}

          {/* Labels */}
          <div className="auth-field--row">
            <div className="auth-field">
              <label
                htmlFor={`crit-label-he-${criterion.id}`}
                className="auth-label auth-label--required"
              >
                שם (עברית)
              </label>
              <input
                id={`crit-label-he-${criterion.id}`}
                type="text"
                className="auth-input"
                value={edit.labels.he}
                disabled={published}
                onChange={(e) =>
                  onEdit({
                    labels: { ...edit.labels, he: e.target.value },
                    dirty: true,
                  })
                }
              />
            </div>
            <div className="auth-field">
              <label
                htmlFor={`crit-label-en-${criterion.id}`}
                className="auth-label auth-label--required"
              >
                Name (English)
              </label>
              <input
                id={`crit-label-en-${criterion.id}`}
                type="text"
                className="auth-input"
                value={edit.labels.en}
                disabled={published}
                style={{ direction: "ltr", unicodeBidi: "embed" }}
                onChange={(e) =>
                  onEdit({
                    labels: { ...edit.labels, en: e.target.value },
                    dirty: true,
                  })
                }
              />
            </div>
          </div>

          {/* Weight / maxScore */}
          <div className="auth-field--row">
            <div className="auth-field">
              <label
                htmlFor={`crit-weight-${criterion.id}`}
                className="auth-label"
              >
                משקל (0-1)
              </label>
              <input
                id={`crit-weight-${criterion.id}`}
                type="number"
                className="auth-input"
                min={0}
                max={1}
                step={0.05}
                value={edit.weight}
                disabled={published || edit.formativeOnly}
                style={{ direction: "ltr", unicodeBidi: "embed" }}
                onChange={(e) =>
                  onEdit({ weight: parseFloat(e.target.value) || 0, dirty: true })
                }
              />
              {edit.formativeOnly && (
                <span className="auth-hint">קריטריון פורמטיבי -- משקל נעול על 0.</span>
              )}
            </div>
            <div className="auth-field">
              <label
                htmlFor={`crit-maxscore-${criterion.id}`}
                className="auth-label auth-label--required"
              >
                ניקוד מקסימלי
              </label>
              <input
                id={`crit-maxscore-${criterion.id}`}
                type="number"
                className="auth-input"
                min={1}
                max={100}
                value={edit.maxScore}
                disabled={published}
                style={{ direction: "ltr", unicodeBidi: "embed" }}
                onChange={(e) =>
                  onEdit({ maxScore: parseInt(e.target.value, 10) || 10, dirty: true })
                }
              />
            </div>
          </div>

          {/* Competency */}
          <div className="auth-field">
            <label
              htmlFor={`crit-comp-${criterion.id}`}
              className="auth-label"
            >
              מזהה כשירות (competency)
            </label>
            <input
              id={`crit-comp-${criterion.id}`}
              type="text"
              className="auth-input"
              value={edit.competencyId}
              disabled={published}
              placeholder="לדוגמה: COMP_ALLIANCE"
              style={{ direction: "ltr", unicodeBidi: "embed" }}
              onChange={(e) =>
                onEdit({ competencyId: e.target.value, dirty: true })
              }
            />
          </div>

          {/* Formative toggle (disabled when the key is risk_awareness) */}
          <div className="auth-field">
            <label
              className="auth-checkbox-label"
              style={{ display: "inline-flex", borderRadius: "6px" }}
            >
              <input
                type="checkbox"
                checked={edit.formativeOnly}
                disabled={published || criterion.labelKey === "risk_awareness"}
                onChange={(e) =>
                  onEdit({
                    formativeOnly: e.target.checked,
                    weight: e.target.checked ? 0 : edit.weight,
                    dirty: true,
                  })
                }
              />
              פורמטיבי בלבד (אינו נכנס לציון הסופי)
            </label>
            {criterion.labelKey === "risk_awareness" && (
              <span className="auth-hint">
                קריטריון מודעות לסיכון נקבע תמיד כפורמטיבי -- לא ניתן לשינוי.
              </span>
            )}
          </div>

          {/* Scoring anchors */}
          <div className="auth-field">
            <span className="auth-label">עוגני ניקוד</span>
            <div className="auth-anchors" style={{ marginBlockStart: "8px" }}>
              {edit.scoringAnchors.map((anchor, idx) => (
                <div key={idx} className="auth-anchor-row">
                  <div className="auth-anchor-row__score">
                    <input
                      type="number"
                      className="auth-input"
                      value={anchor.score}
                      min={0}
                      max={edit.maxScore}
                      disabled={published}
                      aria-label={`ניקוד עוגן ${idx + 1}`}
                      style={{ direction: "ltr", unicodeBidi: "embed", padding: "6px" }}
                      onChange={(e) => updateAnchor(idx, "score", e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                    <input
                      type="text"
                      className="auth-input"
                      value={anchor.label}
                      disabled={published}
                      aria-label={`תיאור עוגן ${idx + 1}`}
                      placeholder="תיאור התנהגות ברמה זו..."
                      onChange={(e) => updateAnchor(idx, "label", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {!published && edit.scoringAnchors.length > 1 && (
                      <button
                        type="button"
                        className="auth-list-item__remove"
                        onClick={() => removeAnchor(idx)}
                        aria-label={`הסר עוגן ${idx + 1}`}
                        style={{ marginBlockStart: 0 }}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!published && (
              <button
                type="button"
                className="auth-add-btn"
                onClick={addAnchor}
                style={{ marginBlockStart: "8px" }}
              >
                + הוסף עוגן
              </button>
            )}
          </div>

          {!published && (
            <div>
              <button
                type="button"
                className="auth-btn auth-btn--ghost auth-btn--sm"
                onClick={handleSave}
                disabled={edit.saving || !edit.dirty}
              >
                {edit.saving ? "שומר..." : "שמור קריטריון"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RubricEditor({
  templateId,
  onGenerate,
  onUpdateCriterion,
  onPublish,
}: Props) {
  const [rubric, setRubric] = useState<RubricVersionResponse | null>(null);
  const [edits, setEdits] = useState<Record<string, CriterionEdit>>({});
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [pubError, setPubError] = useState<string | null>(null);

  const published = rubric?.status === "PUBLISHED";

  async function handleGenerate() {
    setGenError(null);
    setGenerating(true);
    try {
      const result = await onGenerate();
      setRubric(result);
      setEdits(initEdits(result.criteria));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "שגיאה ביצירת הרובריקה.");
    } finally {
      setGenerating(false);
    }
  }

  function setCriterionEdit(id: string, update: Partial<CriterionEdit>) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, ...update },
    }));
  }

  async function handleSaveCriterion(criterionId: string) {
    if (!rubric) return;
    const edit = edits[criterionId];
    if (!edit) return;
    setCriterionEdit(criterionId, { saving: true });
    try {
      const req: UpdateCriterionRequest = {
        labels: edit.labels,
        weight: edit.formativeOnly ? 0 : edit.weight,
        maxScore: edit.maxScore,
        scoringAnchors: edit.scoringAnchors,
        competencyId: edit.competencyId || undefined,
        formativeOnly: edit.formativeOnly,
      };
      await onUpdateCriterion(rubric.id, criterionId, req);
      setCriterionEdit(criterionId, { dirty: false, saving: false });
    } catch (err) {
      setCriterionEdit(criterionId, { saving: false });
      throw err;
    }
  }

  async function handlePublish() {
    if (!rubric) return;
    // Warn if any criterion has unsaved edits
    const hasDirty = Object.values(edits).some((e) => e.dirty);
    if (hasDirty) {
      const confirmed = window.confirm(
        "יש שינויים שלא נשמרו בחלק מהקריטריונים. להמשיך לפרסום בכל זאת?",
      );
      if (!confirmed) return;
    }
    setPubError(null);
    setPublishing(true);
    try {
      const result = await onPublish(rubric.id);
      setRubric(result);
    } catch (err) {
      setPubError(err instanceof Error ? err.message : "שגיאה בפרסום הרובריקה.");
    } finally {
      setPublishing(false);
    }
  }

  if (!rubric) {
    return (
      <div className="auth-section">
        <div>
          <h2 className="auth-section__heading">רובריקת הערכה</h2>
          <p className="auth-section__subheading">
            צור גרסת DRAFT של הרובריקה. השרת יציע קריטריונים על סמך המודל הקליני
            ורמת הסטודנט/ית. לאחר מכן תוכל/י לערוך ולפרסם.
          </p>
        </div>

        {genError && (
          <div className="auth-error" role="alert">
            {genError}
          </div>
        )}

        <div className="auth-notice auth-notice--info">
          <span className="auth-notice__title">לחץ/י "צור טיוטה" להפעלת הגנרציה</span>
          <span>
            הגנרציה מחזירה DRAFT -- ניתן לערוך ואז לפרסם. לאחר פרסום הרובריקה נעולה.
          </span>
        </div>

        <div>
          <button
            type="button"
            className="auth-btn auth-btn--primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "מייצר טיוטה..." : "צור טיוטת רובריקה"}
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer__progress">שלב 4 מתוך 4</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-section">
      <div>
        <h2 className="auth-section__heading">רובריקת הערכה</h2>
        <p className="auth-section__subheading">
          ערוך את הקריטריונים ואז פרסם. לאחר פרסום הרובריקה נעולה ולא ניתן לשינוי.
        </p>
      </div>

      {/* Status strip */}
      <div className="auth-status-strip">
        <span
          className={
            "auth-status-badge " +
            (published ? "auth-status-badge--published" : "auth-status-badge--draft")
          }
        >
          {published ? "PUBLISHED" : "DRAFT"}
        </span>
        <span className="auth-status-strip__meta">
          גרסה {rubric.version}
          {published && rubric.publishedAt
            ? ` -- פורסם ${new Date(rubric.publishedAt).toLocaleDateString("he-IL")}`
            : ""}
          {" | "}
          {rubric.criteria.length} קריטריונים
        </span>
        {!published && (
          <button
            type="button"
            className="auth-btn auth-btn--publish"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "מפרסם..." : "פרסם רובריקה"}
          </button>
        )}
      </div>

      {pubError && (
        <div className="auth-error" role="alert">
          {pubError}
        </div>
      )}

      {published && (
        <div className="auth-published-note">
          הרובריקה פורסמה ונעולה. לשינויים יש ליצור גרסה חדשה (צור טיוטה שוב).
        </div>
      )}

      {/* Criteria list */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        role="list"
        aria-label="קריטריוני הרובריקה"
      >
        {rubric.criteria.map((c) => {
          const edit = edits[c.id];
          if (!edit) return null;
          return (
            <div key={c.id} role="listitem">
              <CriterionCard
                criterion={c}
                edit={edit}
                published={published}
                onEdit={(update) => setCriterionEdit(c.id, update)}
                onSave={() => handleSaveCriterion(c.id)}
              />
            </div>
          );
        })}
      </div>

      {!published && (
        <div className="auth-notice auth-notice--warn">
          <span className="auth-notice__title">לפני פרסום</span>
          <span>
            ודא/י שכל הקריטריונים נשמרו (לחץ/י "שמור קריטריון" על כל שורה שנערכה).
            קריטריון "מודעות לסיכון" תמיד מסומן פורמטיבי עם משקל 0 -- זהו כלל בטיחות.
          </span>
        </div>
      )}

      <div className="auth-footer">
        <span className="auth-footer__progress">שלב 4 מתוך 4</span>
        <div className="auth-footer__actions">
          {!published && (
            <>
              <button
                type="button"
                className="auth-btn auth-btn--ghost"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "מייצר..." : "צור טיוטה מחדש"}
              </button>
              <button
                type="button"
                className="auth-btn auth-btn--publish"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "מפרסם..." : "פרסם"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
