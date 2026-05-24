"use client";

import { useEffect, useMemo, useState } from "react";
import {
  completeWeeklyReviewStep,
  finishWeeklyReview,
  getCurrentWeeklyReview,
  getWeeklyReviewStep,
  isCurrentWeeklyReviewEmpty,
  skipWeeklyReviewStep,
  startWeeklyReview,
  type WeeklyReviewSession,
  type WeeklyReviewStep,
  type WeeklyReviewStepResponse,
} from "@/lib/api";

const REVIEW_STEPS: {
  id: WeeklyReviewStep;
  title: string;
  description: string;
}[] = [
  {
    id: "inbox_zero" as WeeklyReviewStep,
    title: "Inbox Zero",
    description: "רוקן או בדוק שכל ה־Inbox עבר הבהרה.",
  },
  {
    id: "calendar_past" as WeeklyReviewStep,
    title: "Calendar Past",
    description: "בדוק את השבוע שעבר: פגישות, התחייבויות ודברים שנשארו פתוחים.",
  },
  {
    id: "calendar_future" as WeeklyReviewStep,
    title: "Calendar Future",
    description: "בדוק את השבועות הקרובים: אירועים, תזכורות וטריגרים עתידיים.",
  },
  {
    id: "projects" as WeeklyReviewStep,
    title: "Projects",
    description: "ודא שלכל פרויקט פעיל יש תנועה ברורה.",
  },
  {
    id: "next_actions" as WeeklyReviewStep,
    title: "Next Actions",
    description: "בדוק שהפעולות הבאות עדיין רלוונטיות וברורות.",
  },
  {
    id: "waiting_for" as WeeklyReviewStep,
    title: "Waiting For",
    description: "בדוק מה אתה מחכה לקבל מאחרים.",
  },
  {
    id: "agendas" as WeeklyReviewStep,
    title: "Agendas",
    description: "בדוק נושאים לשיחה עם אנשים.",
  },
  {
    id: "someday_maybe" as WeeklyReviewStep,
    title: "Someday / Maybe",
    description: "בדוק רעיונות ודברים שאולי תרצה להפעיל בעתיד.",
  },
];

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<WeeklyReviewSession | null>(null);
  const [selectedStep, setSelectedStep] = useState<WeeklyReviewStep>(
    REVIEW_STEPS[0].id
  );
  const [stepData, setStepData] = useState<WeeklyReviewStepResponse | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStepMeta = useMemo(() => {
    return REVIEW_STEPS.find((step) => step.id === selectedStep);
  }, [selectedStep]);

  async function loadCurrentReview() {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const result = await getCurrentWeeklyReview();

      if (isCurrentWeeklyReviewEmpty(result)) {
        setReview(null);
        setStepData(null);
        return;
      }

      setReview(result);
      await loadStep(result.id, selectedStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הסקירה");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStep(reviewId: string, step: WeeklyReviewStep) {
    try {
      setIsStepLoading(true);
      setError(null);

      const result = await getWeeklyReviewStep(reviewId, step);
      setStepData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת השלב");
    } finally {
      setIsStepLoading(false);
    }
  }

  async function handleStartReview() {
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const newReview = await startWeeklyReview();
      setReview(newReview);
      setSelectedStep(REVIEW_STEPS[0].id);
      await loadStep(newReview.id, REVIEW_STEPS[0].id);

      setMessage("הסקירה השבועית התחילה.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחלת סקירה");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectStep(step: WeeklyReviewStep) {
    setSelectedStep(step);

    if (review) {
      await loadStep(review.id, step);
    }
  }

  async function handleCompleteStep() {
    if (!review) return;

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const updatedReview = await completeWeeklyReviewStep(
        review.id,
        selectedStep
      );

      setReview(updatedReview);
      setMessage("השלב סומן כבוצע.");

      const nextStep = getNextStep(selectedStep);
      if (nextStep) {
        setSelectedStep(nextStep);
        await loadStep(updatedReview.id, nextStep);
      } else {
        await loadStep(updatedReview.id, selectedStep);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בסימון השלב");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSkipStep() {
    if (!review) return;

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const updatedReview = await skipWeeklyReviewStep(review.id, selectedStep);

      setReview(updatedReview);
      setMessage("השלב דולג.");

      const nextStep = getNextStep(selectedStep);
      if (nextStep) {
        setSelectedStep(nextStep);
        await loadStep(updatedReview.id, nextStep);
      } else {
        await loadStep(updatedReview.id, selectedStep);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בדילוג על השלב");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinishReview() {
    if (!review) return;

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const updatedReview = await finishWeeklyReview(review.id);
      setReview(updatedReview);
      setMessage("הסקירה השבועית הושלמה.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "אי אפשר לסיים את הסקירה כרגע"
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadCurrentReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="font-bold">טוען סקירה שבועית...</p>
      </section>
    );
  }

  if (!review) {
    return (
      <div className="space-y-5">
        <section>
          <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
            Weekly Review
          </p>

          <h2 className="mt-1 text-2xl font-black">סקירה שבועית</h2>

          <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
            הסקירה השבועית מחזירה שליטה: עוברים על Inbox, פרויקטים, פעולות,
            דברים שמחכים להם ורעיונות לעתיד.
          </p>
        </section>

        {error ? <ErrorBox error={error} /> : null}

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
          <h3 className="text-xl font-black">אין סקירה פתוחה כרגע</h3>

          <p className="mt-3 text-sm leading-6 text-[var(--brand-ink-soft)]">
            אפשר להתחיל סקירה חדשה ולעבור שלב־שלב על כל המערכת.
          </p>

          <button
            onClick={handleStartReview}
            disabled={isSaving}
            className="mt-5 w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-black text-white"
          >
            {isSaving ? "מתחיל..." : "התחל סקירה שבועית"}
          </button>
        </section>
      </div>
    );
  }

  const reviewStatus = String(review.status ?? "");

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          Weekly Review
        </p>

        <h2 className="mt-1 text-2xl font-black">סקירה שבועית</h2>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          עבור שלב־שלב. אפשר לסמן שלב כבוצע או לדלג עליו כרגע.
        </p>
      </section>

      {message ? (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-800">{message}</p>
        </section>
      ) : null}

      {error ? <ErrorBox error={error} /> : null}

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
              סטטוס סקירה
            </p>

            <h3 className="mt-1 text-xl font-black">
              {reviewStatus === "completed" ? "הושלמה" : "פתוחה"}
            </h3>
          </div>

          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black text-[var(--brand-ink-soft)]">
            {reviewStatus}
          </span>
        </div>

        {reviewStatus !== "completed" ? (
          <button
            onClick={handleFinishReview}
            disabled={isSaving}
            className="mt-4 w-full rounded-2xl bg-[var(--brand-ink)] px-4 py-3 text-sm font-black text-white"
          >
            סיים סקירה
          </button>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">שלבי הסקירה</h3>

        <div className="mt-4 grid gap-2">
          {REVIEW_STEPS.map((step) => {
            const isSelected = step.id === selectedStep;
            const status = getChecklistStatus(review, step.id);

            return (
              <button
                key={step.id}
                onClick={() => handleSelectStep(step.id)}
                className={[
                  "rounded-2xl border px-4 py-3 text-right transition",
                  isSelected
                    ? "border-[var(--brand-orange)] bg-[var(--surface-soft)]"
                    : "border-[var(--border)] bg-white hover:bg-[var(--surface-soft)]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--brand-ink-soft)]">
                      {step.description}
                    </p>
                  </div>

                  <StepStatusBadge status={status} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          השלב הנוכחי
        </p>

        <h3 className="mt-1 text-xl font-black">
          {selectedStepMeta?.title ?? selectedStep}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          {selectedStepMeta?.description}
        </p>

        <div className="mt-5">
          {isStepLoading ? (
            <p className="text-sm font-bold text-[var(--brand-ink-soft)]">
              טוען נתוני שלב...
            </p>
          ) : (
            <StepDataPreview stepData={stepData} />
          )}
        </div>

        {reviewStatus !== "completed" ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleCompleteStep}
              disabled={isSaving}
              className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white"
            >
              סיימתי שלב זה
            </button>

            <button
              onClick={handleSkipStep}
              disabled={isSaving}
              className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm font-black text-[var(--brand-ink)]"
            >
              דלג כרגע
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function getNextStep(currentStep: WeeklyReviewStep): WeeklyReviewStep | null {
  const currentIndex = REVIEW_STEPS.findIndex((step) => step.id === currentStep);

  if (currentIndex === -1) return null;

  const next = REVIEW_STEPS[currentIndex + 1];

  return next?.id ?? null;
}

function getChecklistStatus(
  review: WeeklyReviewSession,
  stepId: WeeklyReviewStep
): string {
  const item = review.checklist_items?.find(
    (checklistItem) => checklistItem.step === stepId
  );

  return item?.status ?? "pending";
}

function StepStatusBadge({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
        בוצע
      </span>
    );
  }

  if (status === "skipped") {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
        דולג
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black text-[var(--brand-ink-soft)]">
      ממתין
    </span>
  );
}

function StepDataPreview({
  stepData,
}: {
  stepData: WeeklyReviewStepResponse | null;
}) {
  if (!stepData) {
    return (
      <p className="text-sm leading-6 text-[var(--brand-ink-soft)]">
        אין נתונים להצגה בשלב הזה.
      </p>
    );
  }

  const data = stepData as unknown as Record<string, unknown>;
  const entries = Object.entries(data).filter(
    ([key]) => !["review", "step", "checklist_item"].includes(key)
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm leading-6 text-[var(--brand-ink-soft)]">
        השלב נטען, אבל אין בו רשימת פריטים להצגה.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <DataBlock key={key} label={key} value={value} />
      ))}
    </div>
  );
}

function DataBlock({ label, value }: { label: string; value: unknown }) {
  const readableLabel = formatDataLabel(label);

  if (Array.isArray(value)) {
    return (
      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[var(--brand-orange-dark)]">
            {readableLabel}
          </p>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-ink-soft)]">
            {value.length} פריטים
          </span>
        </div>

        {value.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-[var(--brand-ink-soft)]">
            אין פריטים בשלב הזה.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {value.slice(0, 8).map((item, index) => (
              <ReviewItemCard key={index} item={item} />
            ))}

            {value.length > 8 ? (
              <p className="text-xs font-bold text-[var(--brand-ink-soft)]">
                מוצגים 8 מתוך {value.length} פריטים.
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (isRecord(value)) {
    return (
      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
        <p className="text-sm font-black text-[var(--brand-orange-dark)]">
          {readableLabel}
        </p>

        <div className="mt-3">
          <ReviewItemCard item={value} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
      <p className="text-sm font-black text-[var(--brand-orange-dark)]">
        {readableLabel}
      </p>

      <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">
        {String(value)}
      </p>
    </div>
  );
}

function ReviewItemCard({ item }: { item: unknown }) {
  if (!isRecord(item)) {
    return (
      <div className="rounded-2xl bg-white p-4">
        <p className="text-sm leading-6 text-[var(--brand-ink-soft)]">
          {String(item)}
        </p>
      </div>
    );
  }

  const title =
    pickString(item, ["title", "name", "summary", "message"]) ?? "פריט ללא כותרת";

  const description = pickString(item, [
    "body",
    "notes",
    "description",
    "desired_outcome",
    "block_reason",
  ]);

  const status = pickString(item, ["status", "outcome"]);
  const source = pickString(item, ["source"]);
  const personName = pickString(item, ["person_name", "person"]);
  const contextName = pickString(item, ["context_name", "context"]);
  const projectTitle = pickString(item, ["project_title", "project"]);

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-[var(--brand-ink)]">{title}</h4>

          {description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--brand-ink-soft)]">
              {description}
            </p>
          ) : null}
        </div>

        {status ? (
          <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black text-[var(--brand-ink-soft)]">
            {status}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {source ? <SmallBadge label={`מקור: ${source}`} /> : null}
        {projectTitle ? <SmallBadge label={`פרויקט: ${projectTitle}`} /> : null}
        {contextName ? <SmallBadge label={`Context: ${contextName}`} /> : null}
        {personName ? <SmallBadge label={`אדם: ${personName}`} /> : null}
      </div>
    </article>
  );
}

function SmallBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-ink-soft)]">
      {label}
    </span>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function formatDataLabel(label: string): string {
  const labels: Record<string, string> = {
    items: "פריטים",
    inbox_items: "פריטי Inbox",
    projects: "פרויקטים",
    next_actions: "Next Actions",
    waiting_for: "Waiting For",
    agenda_items: "Agenda Items",
    someday_items: "Someday / Maybe",
    calendar_entries: "Calendar",
    review_alerts: "התראות סקירה",
  };

  return labels[label] ?? label;
}

function ErrorBox({ error }: { error: string }) {
  return (
    <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
      <h3 className="font-black text-red-900">יש שגיאה</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
        {error}
      </p>
    </section>
  );
}
