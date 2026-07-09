"use client";

// TriggerRulesEditor -- Step 3 of the case-authoring flow.
// Teacher adds/removes TriggerRule rows (condition, action, priority).
// Each new rule is posted individually; existing rows are display-only (no PATCH
// on trigger rules in the current controller -- delete via recreating the set).
// APS-REQ-031

import { useState } from "react";
import type {
  TriggerRuleResponse,
  CreateTriggerRuleRequest,
} from "@aps/shared-types";

interface DraftRule {
  triggerCondition: string;
  action: string;
  priority: string; // string for input; parsed to number on submit
}

interface Props {
  templateId: string;
  initial: TriggerRuleResponse[];
  onRuleAdded: (rule: TriggerRuleResponse) => void;
  onAddRule: (req: CreateTriggerRuleRequest) => Promise<TriggerRuleResponse>;
}

const BLANK_DRAFT: DraftRule = {
  triggerCondition: "",
  action: "",
  priority: "10",
};

const ACTION_EXAMPLES = [
  "UNLOCK:FACT_CHILDHOOD_TRAUMA",
  "UNLOCK:FACT_WORK_CRISIS",
  "TRIGGER_HARD_OFF_RAMP",
  "INCREASE_RESISTANCE",
  "SHOW_NON_VERBAL:CUE_DISTRESS",
];

export default function TriggerRulesEditor({
  templateId,
  initial,
  onRuleAdded,
  onAddRule,
}: Props) {
  const [rules, setRules] = useState<TriggerRuleResponse[]>(initial);
  const [draft, setDraft] = useState<DraftRule>(BLANK_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDraftField(key: keyof DraftRule, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!draft.triggerCondition.trim()) {
      setError("חובה להזין תנאי טריגר.");
      return;
    }
    if (!draft.action.trim()) {
      setError("חובה להזין פעולה.");
      return;
    }
    const priority = parseInt(draft.priority, 10);
    if (isNaN(priority) || priority < 1) {
      setError("עדיפות חייבת להיות מספר שלם חיובי.");
      return;
    }

    setSubmitting(true);
    try {
      const req: CreateTriggerRuleRequest = {
        simulationTemplateId: templateId,
        triggerCondition: draft.triggerCondition.trim(),
        action: draft.action.trim(),
        priority,
      };
      const result = await onAddRule(req);
      setRules((prev) => [...prev, result]);
      onRuleAdded(result);
      setDraft(BLANK_DRAFT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהוספת הכלל.");
    } finally {
      setSubmitting(false);
    }
  }

  function removeLocalRule(id: string) {
    // Local removal only -- the API has no DELETE on trigger rules in this sprint.
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="auth-section">
      <div>
        <h2 className="auth-section__heading">כללי טריגר</h2>
        <p className="auth-section__subheading">
          הגדר תנאים שמשנים את התנהגות הסימולטור -- לדוגמה: פתיחת עובדה נסתרת
          כאשר הסטודנט/ית מגיע/ה לרמת אמפתיה מסוימת.
        </p>
      </div>

      {/* Existing rules */}
      {rules.length > 0 && (
        <div className="auth-card">
          <span className="auth-card__title">כללים קיימים ({rules.length})</span>

          <div>
            {/* Column headers */}
            <div className="auth-trigger-row" style={{ paddingBlockEnd: "6px" }}>
              <span className="auth-trigger-row__label">תנאי</span>
              <span className="auth-trigger-row__label">פעולה</span>
              <span className="auth-trigger-row__label">עדיפות</span>
              <span className="auth-trigger-row__label">
                <span className="visually-hidden">הסר</span>
              </span>
            </div>

            {rules.map((rule) => (
              <div key={rule.id} className="auth-trigger-row">
                <code
                  style={{
                    fontSize: "0.8125rem",
                    background: "#f3f4f6",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    direction: "ltr",
                    unicodeBidi: "embed",
                    display: "block",
                    wordBreak: "break-all",
                  }}
                >
                  {rule.triggerCondition}
                </code>
                <code
                  style={{
                    fontSize: "0.8125rem",
                    background: "#eff6ff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    direction: "ltr",
                    unicodeBidi: "embed",
                    display: "block",
                    wordBreak: "break-all",
                    color: "#1e40af",
                  }}
                >
                  {rule.action}
                </code>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    direction: "ltr",
                    unicodeBidi: "embed",
                    paddingBlockStart: "6px",
                  }}
                >
                  {rule.priority}
                </span>
                {/* Remove is local-only -- API has no DELETE on trigger rules this sprint.
                    Notice shown inline so teacher is not misled (m5). */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <button
                    type="button"
                    className="auth-list-item__remove"
                    onClick={() => removeLocalRule(rule.id)}
                    aria-label={`הסר כלל (מקומי בלבד, לא נמחק בשרת): ${rule.triggerCondition}`}
                    title="הסרה מקומית בלבד -- לא נמחק בשרת"
                  >
                    x
                  </button>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-warn-amber)",
                      whiteSpace: "nowrap",
                    }}
                    aria-hidden="true"
                  >
                    מקומי בלבד
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new rule form */}
      <form onSubmit={handleAdd} noValidate>
        <div className="auth-card">
          <span className="auth-card__title">הוסף כלל חדש</span>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="tr-condition" className="auth-label auth-label--required">
              תנאי טריגר
            </label>
            <input
              id="tr-condition"
              type="text"
              className="auth-input"
              value={draft.triggerCondition}
              onChange={(e) => setDraftField("triggerCondition", e.target.value)}
              placeholder='לדוגמה: empathy >= 0.7'
              style={{ direction: "ltr", unicodeBidi: "embed" }}
            />
            <span className="auth-hint">
              ביטוי בוליאני המוערך על ידי מנוע הסימולציה. משתנים זמינים: empathy, open_questions_ratio, turn_number.
            </span>
          </div>

          <div className="auth-field">
            <label htmlFor="tr-action" className="auth-label auth-label--required">
              פעולה
            </label>
            <input
              id="tr-action"
              type="text"
              className="auth-input"
              value={draft.action}
              onChange={(e) => setDraftField("action", e.target.value)}
              placeholder='לדוגמה: UNLOCK:FACT_CHILDHOOD_TRAUMA'
              style={{ direction: "ltr", unicodeBidi: "embed" }}
            />
            <div
              className="auth-checkboxes"
              style={{ marginBlockStart: "6px", flexWrap: "wrap" }}
              role="group"
              aria-label="פעולות לדוגמה"
            >
              {ACTION_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="auth-btn auth-btn--ghost auth-btn--sm"
                  onClick={() => setDraftField("action", ex)}
                  style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-field" style={{ maxInlineSize: "180px" }}>
            <label htmlFor="tr-priority" className="auth-label auth-label--required">
              עדיפות
            </label>
            <input
              id="tr-priority"
              type="number"
              className="auth-input"
              min={1}
              max={100}
              value={draft.priority}
              onChange={(e) => setDraftField("priority", e.target.value)}
              style={{ direction: "ltr", unicodeBidi: "embed" }}
            />
            <span className="auth-hint">1 = עדיפות גבוהה ביותר</span>
          </div>

          <div>
            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={submitting}
            >
              {submitting ? "מוסיף..." : "+ הוסף כלל"}
            </button>
          </div>
        </div>
      </form>

      {rules.length === 0 && (
        <div className="auth-notice auth-notice--info">
          <span className="auth-notice__title">אין כללי טריגר עדיין</span>
          <span>
            ניתן לדלג על שלב זה -- הסימולציה תרוץ עם ברירות המחדל של Ground Truth.
            מומלץ להגדיר לפחות כלל אחד לניהול פתיחת עובדות נסתרות.
          </span>
        </div>
      )}

      <div className="auth-footer">
        <span className="auth-footer__progress">שלב 3 מתוך 4</span>
        <div className="auth-footer__actions">
          <span className="auth-notice auth-notice--info" style={{ padding: "6px 12px", margin: 0 }}>
            {rules.length} כלל/ים מוגדר/ים
          </span>
        </div>
      </div>
    </div>
  );
}
