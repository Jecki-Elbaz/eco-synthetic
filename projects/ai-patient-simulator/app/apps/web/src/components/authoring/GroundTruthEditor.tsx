"use client";

// GroundTruthEditor -- Step 2 of the case-authoring flow.
// Edits KnownFacts, DisclosureAllowList, escalationRules, and hardOffRampText.
// The hard-off-ramp text field has a mandatory safety notice (cannot be left empty).
// APS-REQ-030

import { useState } from "react";
import type {
  GroundTruthResponse,
  CreateGroundTruthRequest,
  KnownFacts,
  DisclosureAllowList,
} from "@aps/shared-types";

interface Props {
  templateId: string;
  initial?: GroundTruthResponse | null;
  onSaved: (gt: GroundTruthResponse) => void;
  onSubmit: (req: CreateGroundTruthRequest) => Promise<GroundTruthResponse>;
}

const DEFAULT_HARD_OFF_RAMP =
  "אני חייב להפסיק את הסימולציה כאן. אם אתה/את חווה מחשבות לפגיעה עצמית " +
  "או נמצא/ת במצוקה, אנא פנה/י מיד לגורם מקצועי או התקשר/י לקו החירום 1201.";

function initKnownFacts(gt?: GroundTruthResponse | null): KnownFacts {
  return (
    gt?.knownFacts ?? {
      facts: [""],
      doNotInvent: [""],
      riskBoundaries: [""],
    }
  );
}

function initDisclosure(gt?: GroundTruthResponse | null): DisclosureAllowList {
  return (
    gt?.disclosureAllowList ?? {
      disclosed: [],
      unlocked: [""],
      locked: [""],
      triggers: [""],
    }
  );
}

function initEscalation(gt?: GroundTruthResponse | null): string {
  if (!gt?.escalationRules) return "";
  try {
    return JSON.stringify(gt.escalationRules, null, 2);
  } catch {
    return "";
  }
}

// Dynamic string-list helpers
function updateItem(list: string[], idx: number, val: string): string[] {
  const next = [...list];
  next[idx] = val;
  return next;
}
function addItem(list: string[]): string[] {
  return [...list, ""];
}
function removeItem(list: string[], idx: number): string[] {
  return list.filter((_, i) => i !== idx);
}

interface StringListProps {
  id: string;
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
  required?: boolean;
}

function StringListField({
  id,
  label,
  hint,
  items,
  onChange,
  addLabel,
  placeholder,
  required,
}: StringListProps) {
  return (
    <div className="auth-field">
      <span className={required ? "auth-label auth-label--required" : "auth-label"}>
        {label}
      </span>
      {hint && <span className="auth-hint">{hint}</span>}
      <div className="auth-list" style={{ marginBlockStart: "6px" }}>
        {items.map((item, idx) => (
          <div key={idx} className="auth-list-item">
            <input
              id={idx === 0 ? id : undefined}
              type="text"
              className="auth-input auth-list-item__input"
              value={item}
              onChange={(e) => onChange(updateItem(items, idx, e.target.value))}
              placeholder={placeholder}
              aria-label={`${label} -- פריט ${idx + 1}`}
            />
            {items.length > 1 && (
              <button
                type="button"
                className="auth-list-item__remove"
                onClick={() => onChange(removeItem(items, idx))}
                aria-label={`הסר פריט ${idx + 1} מ-${label}`}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="auth-add-btn"
        onClick={() => onChange(addItem(items))}
        style={{ marginBlockStart: "6px" }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

export default function GroundTruthEditor({
  templateId,
  initial,
  onSaved,
  onSubmit,
}: Props) {
  const [knownFacts, setKnownFacts] = useState<KnownFacts>(initKnownFacts(initial));
  const [disclosure, setDisclosure] = useState<DisclosureAllowList>(
    initDisclosure(initial),
  );
  const [escalationRaw, setEscalationRaw] = useState<string>(
    initEscalation(initial),
  );
  const [hardOffRamp, setHardOffRamp] = useState<string>(
    initial?.hardOffRampText ?? DEFAULT_HARD_OFF_RAMP,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<GroundTruthResponse | null>(
    initial ?? null,
  );

  function updateKF<K extends keyof KnownFacts>(key: K, value: KnownFacts[K]) {
    setKnownFacts((prev) => ({ ...prev, [key]: value }));
  }

  function updateDL<K extends keyof DisclosureAllowList>(
    key: K,
    value: DisclosureAllowList[K],
  ) {
    setDisclosure((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hardOffRamp.trim()) {
      setError("טקסט ה-Hard Off-Ramp הוא שדה חובה -- זהו כלל בטיחות קליני.");
      return;
    }

    let escalationRules: Record<string, unknown> = {};
    if (escalationRaw.trim()) {
      try {
        escalationRules = JSON.parse(escalationRaw) as Record<string, unknown>;
      } catch {
        setError("פורמט JSON שגוי בשדה כללי הסלמה.");
        return;
      }
    }

    // Filter out empty strings from lists
    const cleanFacts = knownFacts.facts.filter((f) => f.trim());
    if (cleanFacts.length === 0) {
      setError("יש להזין לפחות עובדה אחת בסעיף 'עובדות ידועות'.");
      return;
    }

    setSubmitting(true);
    try {
      const req: CreateGroundTruthRequest = {
        simulationTemplateId: templateId,
        knownFacts: {
          facts: cleanFacts,
          doNotInvent: knownFacts.doNotInvent.filter((f) => f.trim()),
          riskBoundaries: knownFacts.riskBoundaries.filter((f) => f.trim()),
        },
        disclosureAllowList: {
          disclosed: disclosure.disclosed.filter((f) => f.trim()),
          unlocked: disclosure.unlocked.filter((f) => f.trim()),
          locked: disclosure.locked.filter((f) => f.trim()),
          triggers: disclosure.triggers.filter((f) => f.trim()),
        },
        escalationRules,
        hardOffRampText: hardOffRamp.trim(),
      };
      const result = await onSubmit(req);
      setSaved(result);
      onSaved(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת Ground Truth.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="auth-section">
        <div>
          <h2 className="auth-section__heading">עורך Ground Truth</h2>
          <p className="auth-section__subheading">
            הגדר את המידע הנסתר של המטופל/ת, את רשימת הגילויים המותרים, וכללי הסלמה.
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {saved && (
          <div className="auth-notice auth-notice--info">
            <span className="auth-notice__title">נשמר בהצלחה (גרסה {saved.version})</span>
            <span>ניתן להמשיך לשלב הבא.</span>
          </div>
        )}

        {/* Known Facts */}
        <div className="auth-card">
          <span className="auth-card__title">עובדות ידועות</span>

          <StringListField
            id="gt-facts"
            label="עובדות"
            hint="מה הסימולטור יודע על המטופל/ת -- לא יחשף אוטומטית."
            items={knownFacts.facts}
            onChange={(v) => updateKF("facts", v)}
            addLabel="הוסף עובדה"
            placeholder="לדוגמה: יוסי, גבר בן 34, נשוי + 2 ילדים"
            required
          />

          <StringListField
            id="gt-dont-invent"
            label="אל תמציא"
            hint="רשימת עניינים שהמטופל/ת לא ידון בהם, גם אם יישאל/ת."
            items={knownFacts.doNotInvent}
            onChange={(v) => updateKF("doNotInvent", v)}
            addLabel="הוסף הנחיה"
            placeholder="לדוגמה: אל תציג היסטוריה פסיכיאטרית שלא צוינה"
          />

          <StringListField
            id="gt-risk"
            label="גבולות סיכון"
            hint="הגדר במדויק את גבולות מצבי הסיכון של הפרסונה."
            items={knownFacts.riskBoundaries}
            onChange={(v) => updateKF("riskBoundaries", v)}
            addLabel="הוסף גבול סיכון"
            placeholder="לדוגמה: אין מחשבות אובדניות פעילות -- ייאוש בלבד"
          />
        </div>

        {/* Disclosure Allow List */}
        <div className="auth-card">
          <span className="auth-card__title">רשימת גילויים מותרים</span>

          <StringListField
            id="gt-unlocked"
            label="נפתח (ניתן לגילוי כרגע)"
            hint="מזהי עובדות שניתן לגלות בכל שלב."
            items={disclosure.unlocked}
            onChange={(v) => updateDL("unlocked", v)}
            addLabel="הוסף מזהה"
            placeholder="לדוגמה: FACT_WORK_STRESS"
          />

          <StringListField
            id="gt-locked"
            label="נעול (דורש טריגר לפתיחה)"
            hint="מזהי עובדות שנסגרות עד להפעלת טריגר."
            items={disclosure.locked}
            onChange={(v) => updateDL("locked", v)}
            addLabel="הוסף מזהה"
            placeholder="לדוגמה: FACT_CHILDHOOD_TRAUMA"
          />

          <StringListField
            id="gt-triggers"
            label="טריגרי פתיחה"
            hint="הגדר תנאי -> פעולה לפתיחת עובדות נעולות."
            items={disclosure.triggers}
            onChange={(v) => updateDL("triggers", v)}
            addLabel="הוסף טריגר"
            placeholder="לדוגמה: empathy >= 0.7 -> UNLOCK:FACT_CHILDHOOD_TRAUMA"
          />
        </div>

        {/* Escalation rules */}
        <div className="auth-card">
          <span className="auth-card__title">כללי הסלמה (JSON)</span>
          <div className="auth-field">
            <label htmlFor="gt-escalation" className="auth-label">
              כללי הסלמה (JSON object, אופציונלי)
            </label>
            <textarea
              id="gt-escalation"
              className="auth-textarea"
              rows={4}
              value={escalationRaw}
              onChange={(e) => setEscalationRaw(e.target.value)}
              placeholder={'{\n  "risk_score > 0.8": "TRIGGER_HARD_OFF_RAMP"\n}'}
              style={{ direction: "ltr", unicodeBidi: "embed", fontFamily: "monospace" }}
            />
            <span className="auth-hint">
              JSON object שבו ה-key הוא תנאי וה-value הוא פעולה.
            </span>
          </div>
        </div>

        {/* Hard Off-Ramp -- mandatory */}
        <div className="auth-card">
          <span className="auth-card__title">טקסט Hard Off-Ramp</span>

          <div className="auth-notice auth-notice--warn">
            <span className="auth-notice__title">שדה חובה -- כלל בטיחות קליני</span>
            <span>
              הודעה זו מוצגת ומסיימת את הסימולציה כאשר מתגלה סיכון קיצוני.
              לא ניתן להשאיר שדה זה ריק. הטקסט חייב לכלול הפנייה לגורם מקצועי.
            </span>
          </div>

          <div className="auth-field">
            <label htmlFor="gt-hard-off-ramp" className="auth-label auth-label--required">
              טקסט Hard Off-Ramp
            </label>
            <textarea
              id="gt-hard-off-ramp"
              className="auth-textarea"
              rows={4}
              value={hardOffRamp}
              onChange={(e) => setHardOffRamp(e.target.value)}
              required
            />
            <span className="auth-hint">
              ניתן לערוך את הנוסח אך לא למחוק -- חובה לכלול הפנייה לגורם עזרה.
            </span>
          </div>
        </div>

        <div className="auth-footer">
          <span className="auth-footer__progress">שלב 2 מתוך 4</span>
          <div className="auth-footer__actions">
            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={submitting}
            >
              {submitting ? "שומר..." : "שמור Ground Truth"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
