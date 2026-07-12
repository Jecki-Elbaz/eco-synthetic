"use client";

// SimulationBuilder -- Step 1 of the case-authoring flow.
// Teacher fills structured fields -> submits CreateTemplateRequest.
// After creation the server-generated personaPrompt is shown read-only.
// APS-REQ-028/029

import { useState } from "react";
import type {
  BuilderFields,
  CreateTemplateRequest,
  TemplateResponse,
} from "@aps/shared-types";

interface Props {
  onCreated: (template: TemplateResponse) => void;
  onSubmit: (req: CreateTemplateRequest) => Promise<TemplateResponse>;
}

const CLINICAL_MODELS = [
  { value: "CBT", label: "CBT -- טיפול קוגניטיבי-התנהגותי" },
  { value: "ACT", label: "ACT -- תרפיית קבלה ומחויבות" },
  { value: "PSYCHODYNAMIC", label: "פסיכודינמי" },
  { value: "DBT", label: "DBT -- טיפול דיאלקטי-התנהגותי" },
  { value: "PERSON_CENTERED", label: "ממוקד-אדם (Rogers)" },
];

const STUDENT_LEVELS = [
  { value: "שנה א", label: "שנה א" },
  { value: "שנה ב", label: "שנה ב" },
  { value: "שנה ג", label: "שנה ג" },
  { value: "סטאז'", label: "סטאז'" },
  { value: "מתקדם", label: "מתקדם" },
];

const SKILLS = [
  "אמפתיה וברית טיפולית",
  "שאלות פתוחות",
  "הקשבה פעילה",
  "ניתוח תפקודי",
  "אססמנט סיכון",
  "ניהול משבר",
  "הסטוריה קלינית",
  "תכנון טיפול",
];

const PATIENT_STYLES = [
  { value: "hesitant", label: "מהסס/ת ומסייג/ת" },
  { value: "distressed", label: "במצוקה גלויה" },
  { value: "defensive", label: "דפנסיבי/ת" },
  { value: "cooperative", label: "שיתופי/ת" },
  { value: "avoidant", label: "נמנע/ת" },
];

const RISK_LEVELS = [
  { value: "LOW", label: "נמוך" },
  { value: "MEDIUM", label: "בינוני" },
  { value: "HIGH", label: "גבוה" },
];

const MODES = [
  { value: "intake", label: "ראיון קבלה" },
  { value: "ongoing", label: "מפגש המשך" },
  { value: "crisis", label: "התערבות משבר" },
];

const LANGUAGES = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
  { value: "ar", label: "عربية" },
];

const DEFAULT_FIELDS: BuilderFields = {
  title: "",
  clinicalModel: "CBT",
  studentLevel: "שנה ב",
  primarySkill: SKILLS[0] ?? "",
  secondarySkill: undefined,
  patientStyle: "hesitant",
  presentingProblem: "",
  hiddenIssue: undefined,
  riskLevel: "LOW",
  challengeLevel: 3,
  languages: ["he"],
  mode: "intake",
  maxTurns: undefined,
  timeLimitMinutes: undefined,
  // S5-NOA-ARC-AUTHOR: arc session cap. Default 3 (matches DB default).
  maxSessions: 3,
};

export default function SimulationBuilder({ onCreated, onSubmit }: Props) {
  const [fields, setFields] = useState<BuilderFields>(DEFAULT_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<TemplateResponse | null>(null);

  function setField<K extends keyof BuilderFields>(key: K, value: BuilderFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function toggleLanguage(lang: string) {
    setFields((prev) => {
      const has = prev.languages.includes(lang);
      const next = has
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang];
      // At least one language must stay selected
      return { ...prev, languages: next.length > 0 ? next : prev.languages };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fields.title.trim()) {
      setError("חובה למלא כותרת לסימולציה.");
      return;
    }
    if (!fields.presentingProblem.trim()) {
      setError("חובה למלא בעיה מוצגת.");
      return;
    }
    // S5-NOA-ARC-AUTHOR: validate maxSessions range [2,4].
    const sessions = fields.maxSessions ?? 3;
    if (sessions < 2 || sessions > 4) {
      setError("מספר פגישות חייב להיות בין 2 ל-4.");
      return;
    }
    setSubmitting(true);
    try {
      const req: CreateTemplateRequest = { builder: fields };
      const result = await onSubmit(req);
      setCreated(result);
      onCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת הסימולציה.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="auth-section">
        <div>
          <h2 className="auth-section__heading">תבנית נוצרה בהצלחה</h2>
          <p className="auth-section__subheading">
            הסימולציה נוצרה. הפרומפט של הפרסונה נוצר אוטומטית על-ידי השרת -- ניתן לצפות בו בלבד.
          </p>
        </div>

        <div className="auth-persona-preview">
          <span className="auth-persona-preview__label">פרומפט פרסונה (נוצר אוטומטית -- קריאה בלבד)</span>
          <p className="auth-persona-preview__text">{created.personaPrompt}</p>
          <span className="auth-persona-preview__note">
            הפרומפט מורכב בצד השרת על סמך השדות שמילאת. לא ניתן לערוך אותו ישירות.
          </span>
        </div>

        <div className="auth-card">
          <span className="auth-card__title">פרטי תבנית</span>
          <div className="auth-field--row">
            <div className="auth-field">
              <span className="auth-label">מזהה תבנית</span>
              <code style={{ fontSize: "0.875rem", direction: "ltr", unicodeBidi: "embed" }}>
                {created.id}
              </code>
            </div>
            <div className="auth-field">
              <span className="auth-label">גרסה</span>
              <span style={{ direction: "ltr", unicodeBidi: "embed" }}>{created.version}</span>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <span className="auth-footer__progress">שלב 1 מתוך 4 הושלם</span>
          <div className="auth-footer__actions">
            <button
              type="button"
              className="auth-btn auth-btn--ghost"
              onClick={() => setCreated(null)}
            >
              ערוך שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="auth-section">
        <div>
          <h2 className="auth-section__heading">בנאי סימולציה</h2>
          <p className="auth-section__subheading">
            מלא את השדות המובנים. השרת יבנה את פרומפט הפרסונה אוטומטית -- לא תוכל לערוך אותו ישירות.
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Basic identity */}
        <div className="auth-card">
          <span className="auth-card__title">מידע כללי</span>

          <div className="auth-field">
            <label htmlFor="builder-title" className="auth-label auth-label--required">
              כותרת הסימולציה
            </label>
            <input
              id="builder-title"
              type="text"
              className="auth-input"
              value={fields.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder='לדוגמה: "ראיון קבלה -- דיכאון קל"'
              required
            />
          </div>

          <div className="auth-field--row">
            <div className="auth-field">
              <label htmlFor="builder-model" className="auth-label auth-label--required">
                מודל קליני
              </label>
              <select
                id="builder-model"
                className="auth-select"
                value={fields.clinicalModel}
                onChange={(e) => setField("clinicalModel", e.target.value)}
              >
                {CLINICAL_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="builder-level" className="auth-label auth-label--required">
                רמת הסטודנט
              </label>
              <select
                id="builder-level"
                className="auth-select"
                value={fields.studentLevel}
                onChange={(e) => setField("studentLevel", e.target.value)}
              >
                {STUDENT_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="auth-card">
          <span className="auth-card__title">מיומנויות</span>

          <div className="auth-field--row">
            <div className="auth-field">
              <label htmlFor="builder-primary-skill" className="auth-label auth-label--required">
                מיומנות ראשית
              </label>
              <select
                id="builder-primary-skill"
                className="auth-select"
                value={fields.primarySkill}
                onChange={(e) => setField("primarySkill", e.target.value)}
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="builder-secondary-skill" className="auth-label">
                מיומנות משנית (אופציונלי)
              </label>
              <select
                id="builder-secondary-skill"
                className="auth-select"
                value={fields.secondarySkill ?? ""}
                onChange={(e) =>
                  setField("secondarySkill", e.target.value || undefined)
                }
              >
                <option value="">-- ללא --</option>
                {SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Patient */}
        <div className="auth-card">
          <span className="auth-card__title">פרסונה ומצב קליני</span>

          <div className="auth-field--row">
            <div className="auth-field">
              <label htmlFor="builder-style" className="auth-label auth-label--required">
                סגנון מטופל/ת
              </label>
              <select
                id="builder-style"
                className="auth-select"
                value={fields.patientStyle}
                onChange={(e) => setField("patientStyle", e.target.value)}
              >
                {PATIENT_STYLES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="builder-risk" className="auth-label auth-label--required">
                רמת סיכון
              </label>
              <select
                id="builder-risk"
                className="auth-select"
                value={fields.riskLevel}
                onChange={(e) => setField("riskLevel", e.target.value)}
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="builder-presenting" className="auth-label auth-label--required">
              בעיה מוצגת
            </label>
            <textarea
              id="builder-presenting"
              className="auth-textarea"
              rows={3}
              value={fields.presentingProblem}
              onChange={(e) => setField("presentingProblem", e.target.value)}
              placeholder="מה המטופל/ת מציג/ה בפתיחת השיחה?"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="builder-hidden" className="auth-label">
              בעיה נסתרת (אופציונלי)
            </label>
            <textarea
              id="builder-hidden"
              className="auth-textarea"
              rows={2}
              value={fields.hiddenIssue ?? ""}
              onChange={(e) =>
                setField("hiddenIssue", e.target.value || undefined)
              }
              placeholder="מה מסתיר/ה המטופל/ת -- יחשף רק בתנאי פתיחה מסוימים?"
            />
          </div>
        </div>

        {/* Session settings */}
        <div className="auth-card">
          <span className="auth-card__title">הגדרות מפגש</span>

          <div className="auth-field--row">
            <div className="auth-field">
              <label htmlFor="builder-mode" className="auth-label auth-label--required">
                סוג מפגש
              </label>
              <select
                id="builder-mode"
                className="auth-select"
                value={fields.mode}
                onChange={(e) => setField("mode", e.target.value)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="builder-challenge" className="auth-label auth-label--required">
                רמת אתגר
              </label>
              <div className="auth-slider-wrapper">
                <input
                  id="builder-challenge"
                  type="range"
                  className="auth-slider"
                  min={1}
                  max={5}
                  step={1}
                  value={fields.challengeLevel}
                  onChange={(e) =>
                    setField("challengeLevel", Number(e.target.value))
                  }
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={fields.challengeLevel}
                />
                <span className="auth-slider-value">{fields.challengeLevel}</span>
              </div>
              <span className="auth-hint">1 = קל ביותר, 5 = מאתגר ביותר</span>
            </div>
          </div>

          <div className="auth-field--row">
            <div className="auth-field">
              <label htmlFor="builder-turns" className="auth-label">
                מקסימום תורות (אופציונלי)
              </label>
              <input
                id="builder-turns"
                type="number"
                className="auth-input"
                min={5}
                max={200}
                value={fields.maxTurns ?? ""}
                onChange={(e) =>
                  setField(
                    "maxTurns",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="ברירת מחדל: ללא הגבלה"
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="builder-timelimit" className="auth-label">
                הגבלת זמן (דקות, אופציונלי)
              </label>
              <input
                id="builder-timelimit"
                type="number"
                className="auth-input"
                min={1}
                max={180}
                value={fields.timeLimitMinutes ?? ""}
                onChange={(e) =>
                  setField(
                    "timeLimitMinutes",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="ברירת מחדל: ללא הגבלה"
                style={{ direction: "ltr" }}
              />
            </div>
          </div>

          {/* S5-NOA-ARC-AUTHOR: max sessions field */}
          <div className="auth-field">
            <label htmlFor="builder-max-sessions" className="auth-label">
              מספר פגישות בקשת הטיפול
            </label>
            <input
              id="builder-max-sessions"
              type="number"
              className="auth-input"
              min={2}
              max={4}
              step={1}
              value={fields.maxSessions ?? 3}
              onChange={(e) =>
                setField(
                  "maxSessions",
                  e.target.value ? Number(e.target.value) : 3,
                )
              }
              aria-describedby="builder-max-sessions-hint"
              style={{ direction: "ltr", maxInlineSize: "80px" }}
            />
            <span id="builder-max-sessions-hint" className="auth-hint">
              2-4 פגישות (ברירת מחדל: 3). השרת אוכף טווח זה.
            </span>
            {(fields.maxSessions !== undefined &&
              (fields.maxSessions < 2 || fields.maxSessions > 4)) && (
              <span
                className="auth-error"
                role="alert"
                data-testid="max-sessions-error"
              >
                מספר פגישות חייב להיות בין 2 ל-4.
              </span>
            )}
          </div>

          <div className="auth-field">
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className="auth-label auth-label--required">
                שפות
              </legend>
              <div className="auth-checkboxes" style={{ marginBlockStart: "6px" }}>
                {LANGUAGES.map((lang) => (
                  <label key={lang.value} className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={fields.languages.includes(lang.value)}
                      onChange={() => toggleLanguage(lang.value)}
                    />
                    {lang.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="auth-footer">
          <span className="auth-footer__progress">שלב 1 מתוך 4</span>
          <div className="auth-footer__actions">
            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={submitting}
            >
              {submitting ? "יוצר תבנית..." : "צור תבנית"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
