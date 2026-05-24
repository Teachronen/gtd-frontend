"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  getContextSummary,
  getNextInboxItem,
  getPeople,
  processInboxItem,
  type InboxDecision,
} from "@/lib/api";

type InboxItem = {
  id: string;
  title: string;
  body?: string;
  status?: string;
};

type ContextItem = {
  id: string;
  name: string;
  open_next_actions_count?: number;
  count?: number;
};

type PersonItem = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};


type Step =
  | "question"
  | "non_actionable"
  | "actionable"
  | "next_action"
  | "delegate"
  | "project";

export default function InboxProcessPage() {
  const [item, setItem] = useState<InboxItem | null>(null);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [step, setStep] = useState<Step>("question");

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [contextId, setContextId] = useState("");
  const [personId, setPersonId] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  
  const [projectTitle, setProjectTitle] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const [nextItem, contextResult, peopleResult] = await Promise.all([
  getNextInboxItem(),
  getContextSummary(),
  getPeople(),
]);

setItem(nextItem as InboxItem | null);
setContexts(contextResult as ContextItem[]);
setPeople(peopleResult as PersonItem[]);

if (contextResult.length > 0) {
  setContextId(contextResult[0].id);
}

if (peopleResult.length > 0) {
  setPersonId(peopleResult[0].id);
}

      if (nextItem) {
        const typedItem = nextItem as InboxItem;
        setTitle(typedItem.title ?? "");
        setNotes(typedItem.body ?? "");
        setProjectTitle(typedItem.title ?? "");
      }

      setStep("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הפריט");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadNextItem() {
    try {
      setIsSaving(false);
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const nextItem = await getNextInboxItem();

      setItem(nextItem as InboxItem | null);
      setStep("question");

      if (nextItem) {
        const typedItem = nextItem as InboxItem;
        setTitle(typedItem.title ?? "");
        setNotes(typedItem.body ?? "");
        setProjectTitle(typedItem.title ?? "");
    } else {
        setTitle("");
        setNotes("");
        setProjectTitle("");
    }
      setCategory("");
      setFollowUpAt("");
      setProjectTitle("");
      setDesiredOutcome("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הפריט הבא");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function saveDecision(decision: InboxDecision) {
    if (!item) return;

    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      await processInboxItem(item.id, decision);

      setMessage("הפריט עובד בהצלחה.");
      await loadNextItem();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעיבוד הפריט");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTrash() {
    await saveDecision({
      requires_action: false,
      target: "trash",
    });
  }

  async function handleReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await saveDecision({
      requires_action: false,
      target: "reference",
      title,
      body: notes,
      category,
    });
  }

  async function handleSomeday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await saveDecision({
      requires_action: false,
      target: "someday",
      title,
      notes,
      category,
    });
  }

  async function handleDoneTwoMinutes() {
    await saveDecision({
      requires_action: true,
      action_type: "do_now",
      two_minute: true,
      title,
      notes,
    });
  }

  async function handleDelegate(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!personId) {
    setError("צריך לבחור אדם כדי ליצור Waiting For.");
    return;
  }

  await saveDecision({
    requires_action: true,
    action_type: "delegate",
    next_visible_action: title,
    title,
    notes,
    person_id: personId,
    follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
  });
}

async function handleProject(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!projectTitle.trim()) {
    setError("צריך לתת שם לפרויקט.");
    return;
  }

  if (!desiredOutcome.trim()) {
    setError("צריך להגדיר תוצאה רצויה לפרויקט.");
    return;
  }

  if (!title.trim()) {
    setError("צריך להגדיר Next Action ראשון לפרויקט.");
    return;
  }

  if (!contextId) {
    setError("צריך לבחור Context ל־Next Action הראשון.");
    return;
  }

  await saveDecision({
    requires_action: true,
    is_project: true,
    action_type: "project",
    project_title: projectTitle,
    desired_outcome: desiredOutcome,
    initial_movement_type: "next_action",
    next_action_title: title,
    next_action_notes: notes,
    context_id: contextId,
  });
}

async function handleNextAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contextId) {
      setError("צריך לבחור Context כדי ליצור Next Action.");
      return;
    }

    await saveDecision({
      requires_action: true,
      action_type: "defer",
      target: "next_action",
      next_visible_action: title,
      title,
      notes,
      context_id: contextId,
    });
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="font-bold">טוען פריט מה־Inbox...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <h2 className="text-xl font-black text-red-900">יש שגיאה</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-800">
          {error}
        </p>

        <button
          onClick={loadInitialData}
          className="mt-4 rounded-2xl bg-red-900 px-4 py-3 text-sm font-bold text-white"
        >
          נסה שוב
        </button>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          Inbox Zero
        </p>

        <h2 className="mt-2 text-2xl font-black">אין עוד פריטים לעיבוד</h2>

        <p className="mt-3 text-sm leading-6 text-[var(--brand-ink-soft)]">
          כל מה שלכדת כבר עבר הבהרה. עכשיו אפשר לעבור למה לעשות עכשיו.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/now"
            className="flex-1 rounded-2xl bg-[var(--brand-orange)] px-4 py-3 text-center text-sm font-bold text-white"
          >
            מה לעשות עכשיו
          </Link>

          <Link
            href="/capture"
            className="flex-1 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold text-[var(--brand-ink)]"
          >
            לכוד עוד
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          Inbox Processing
        </p>

        <h2 className="mt-1 text-2xl font-black">ריקון Inbox</h2>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          עוברים פריט־פריט ומחליטים מה הוא באמת.
        </p>
      </section>

      {message ? (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-800">{message}</p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-orange-dark)]">
          הפריט הנוכחי
        </p>

        <h3 className="mt-2 text-xl font-black">{item.title}</h3>

        {item.body ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--brand-ink-soft)]">
            {item.body}
          </p>
        ) : null}
      </section>

      {step === "question" ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">האם זה דורש פעולה?</h3>

          <div className="mt-5 grid gap-3">
            <button
                onClick={handleDoneTwoMinutes}
                disabled={isSaving}
                className="rounded-2xl bg-green-700 px-4 py-3 font-bold text-white"
            >
                עשיתי עכשיו, פחות משתי דקות
            </button>

            <button
                onClick={() => setStep("next_action")}
                className="rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
            >
                צור Next Action
            </button>

            <button
                onClick={() => setStep("delegate")}
                className="rounded-2xl bg-[var(--brand-ink)] px-4 py-3 font-bold text-white"
            >
                האצל / Waiting For
            </button>

            <button
            onClick={() => setStep("project")}
            className="rounded-2xl bg-[var(--brand-orange-dark)] px-4 py-3 font-bold text-white"
            >
                 צור Project
                 </button>
            </div>


        </section>
        
        
      ) : null}

      {step === "non_actionable" ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <button
            onClick={() => setStep("question")}
            className="mb-4 text-sm font-bold text-[var(--brand-orange-dark)]"
          >
            ← חזרה
          </button>

          <h3 className="text-xl font-black">לא דורש פעולה</h3>

          <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
            אם אין פעולה לעשות, צריך להחליט איפה זה שייך.
          </p>

          <div className="mt-5 grid gap-3">
            <button
              onClick={handleTrash}
              disabled={isSaving}
              className="rounded-2xl bg-red-700 px-4 py-3 font-bold text-white"
            >
              מחק / Trash
            </button>

            <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <summary className="cursor-pointer font-black">Reference</summary>

              <form onSubmit={handleReference} className="mt-4 space-y-3">
                <TextField
                  label="כותרת"
                  value={title}
                  onChange={setTitle}
                />

                <TextArea
                  label="תוכן / הערות"
                  value={notes}
                  onChange={setNotes}
                />

                <TextField
                  label="קטגוריה, לא חובה"
                  value={category}
                  onChange={setCategory}
                />

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
                >
                  שמור כ־Reference
                </button>
              </form>
            </details>

            <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <summary className="cursor-pointer font-black">
                Someday / Maybe
              </summary>

              <form onSubmit={handleSomeday} className="mt-4 space-y-3">
                <TextField
                  label="כותרת"
                  value={title}
                  onChange={setTitle}
                />

                <TextArea
                  label="הערות"
                  value={notes}
                  onChange={setNotes}
                />

                <TextField
                  label="קטגוריה, לא חובה"
                  value={category}
                  onChange={setCategory}
                />

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
                >
                  שמור ל־Someday
                </button>
              </form>
            </details>
          </div>
        </section>
      ) : null}

      {step === "actionable" ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <button
            onClick={() => setStep("question")}
            className="mb-4 text-sm font-bold text-[var(--brand-orange-dark)]"
          >
            ← חזרה
          </button>

          <h3 className="text-xl font-black">מה הפעולה הבאה?</h3>

          <div className="mt-4 space-y-3">
            <TextField
              label="נסח פעולה פיזית וברורה"
              value={title}
              onChange={setTitle}
            />

            <TextArea
              label="הערות, לא חובה"
              value={notes}
              onChange={setNotes}
            />
          </div>

          <div className="mt-5 grid gap-3">
            <button
              onClick={handleDoneTwoMinutes}
              disabled={isSaving}
              className="rounded-2xl bg-green-700 px-4 py-3 font-bold text-white"
            >
              עשיתי עכשיו, פחות משתי דקות
            </button>

            <button
              onClick={() => setStep("next_action")}
              className="rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
            >
              צור Next Action
            </button>
          </div>
        </section>
      ) : null}

      {step === "project" ? (
  <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
    <button
      onClick={() => setStep("actionable")}
      className="mb-4 text-sm font-bold text-[var(--brand-orange-dark)]"
    >
      ← חזרה
    </button>

    <h3 className="text-xl font-black">יצירת Project</h3>

    <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
      פרויקט הוא תוצאה שדורשת יותר מצעד אחד. כדי שהפרויקט לא ייתקע, נגדיר
      כבר עכשיו Next Action ראשון.
    </p>

    <form onSubmit={handleProject} className="mt-4 space-y-4">
      <TextField
        label="שם הפרויקט"
        value={projectTitle}
        onChange={setProjectTitle}
      />

      <TextArea
        label="מה התוצאה הרצויה?"
        value={desiredOutcome}
        onChange={setDesiredOutcome}
      />

      <TextField
        label="Next Action ראשון"
        value={title}
        onChange={setTitle}
      />

      <TextArea
        label="הערות לפעולה, לא חובה"
        value={notes}
        onChange={setNotes}
      />

      <div>
        <label className="text-sm font-black">Context לפעולה הראשונה</label>

        {contexts.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
            אין Contexts. צריך ליצור לפחות Context אחד דרך ה־admin.
          </p>
        ) : (
          <select
            value={contextId}
            onChange={(event) => setContextId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--brand-orange)]"
          >
            {contexts.map((context) => (
              <option key={context.id} value={context.id}>
                {context.name}
              </option>
            ))}
          </select>
        )}

         <button
        type="submit"
        disabled={isSaving || contexts.length === 0}
        className="w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
      >
        שמור Project + Next Action
      </button>

      </div>

     
    </form>
  </section>
) : null}

      {step === "delegate" ? (
  <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
    <button
      onClick={() => setStep("actionable")}
      className="mb-4 text-sm font-bold text-[var(--brand-orange-dark)]"
    >
      ← חזרה
    </button>

    <h3 className="text-xl font-black">האצלה / Waiting For</h3>

    <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
      אם מישהו אחר צריך לעשות את הצעד הבא, זה הופך ל־Waiting For.
    </p>

    <form onSubmit={handleDelegate} className="mt-4 space-y-4">
      <TextField
        label="מה אני מחכה לקבל?"
        value={title}
        onChange={setTitle}
      />

      <TextArea
        label="הערות"
        value={notes}
        onChange={setNotes}
      />

      <div>
        <label className="text-sm font-black">אדם</label>

        {people.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
            אין עדיין אנשים במערכת. צריך ליצור Person דרך ה־admin.
          </p>
        ) : (
          <select
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--brand-orange)]"
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="text-sm font-black">
          מתי לבדוק שוב? לא חובה
        </label>

        <input
          type="datetime-local"
          value={followUpAt}
          onChange={(event) => setFollowUpAt(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--brand-orange)]"
        />

        <p className="mt-2 text-xs leading-5 text-[var(--brand-ink-soft)]">
          אפשר להשאיר ריק אם אין תאריך מעקב כרגע.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSaving || people.length === 0}
        className="w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
      >
        שמור כ־Waiting For
      </button>
    </form>
  </section>
) : null}

      {step === "next_action" ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <button
            onClick={() => setStep("actionable")}
            className="mb-4 text-sm font-bold text-[var(--brand-orange-dark)]"
          >
            ← חזרה
          </button>

          <h3 className="text-xl font-black">יצירת Next Action</h3>

          <form onSubmit={handleNextAction} className="mt-4 space-y-4">
            <TextField
              label="פעולה"
              value={title}
              onChange={setTitle}
            />

            <TextArea
              label="הערות"
              value={notes}
              onChange={setNotes}
            />

            <div>
              <label className="text-sm font-black">Context</label>

              {contexts.length === 0 ? (
                <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
                  אין Contexts. צריך ליצור לפחות Context אחד דרך ה־admin.
                </p>
              ) : (
                <select
                  value={contextId}
                  onChange={(event) => setContextId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--brand-orange)]"
                >
                  {contexts.map((context) => (
                    <option key={context.id} value={context.id}>
                      {context.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving || contexts.length === 0}
              className="w-full rounded-2xl bg-[var(--brand-orange)] px-4 py-3 font-bold text-white"
            >
              שמור כ־Next Action
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-black">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--brand-orange)]"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-black">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 leading-7 outline-none focus:border-[var(--brand-orange)]"
      />
    </div>
  );
}
