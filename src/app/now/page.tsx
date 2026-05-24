"use client";

import { useEffect, useState } from "react";
import {
  completeNextAction,
  getContextSummary,
  getNowActions,
  notNowNextAction,
} from "@/lib/api";

type ContextItem = {
  id: string;
  name: string;
  open_next_actions_count?: number;
  count?: number;
};

type NextActionItem = {
  id: string;
  title: string;
  notes?: string;
  status?: string;
  project_title?: string | null;
  estimated_minutes?: number | null;
  energy?: string;
};

export default function NowPage() {
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [selectedContextId, setSelectedContextId] = useState("");
  const [actions, setActions] = useState<NextActionItem[]>([]);

  const [isLoadingContexts, setIsLoadingContexts] = useState(true);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadContexts() {
    try {
      setIsLoadingContexts(true);
      setError(null);

      const result = await getContextSummary();
      const typedContexts = result as ContextItem[];

      setContexts(typedContexts);

      if (typedContexts.length > 0) {
        setSelectedContextId(typedContexts[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת Contexts");
    } finally {
      setIsLoadingContexts(false);
    }
  }

  async function loadActions(contextId: string) {
    if (!contextId) return;

    try {
      setIsLoadingActions(true);
      setError(null);

      const result = await getNowActions(contextId);
      setActions(result as NextActionItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת פעולות");
    } finally {
      setIsLoadingActions(false);
    }
  }

  async function handleComplete(actionId: string) {
    try {
      await completeNextAction(actionId);
      setActions((current) =>
        current.filter((action) => action.id !== actionId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בסימון כבוצע");
    }
  }

  async function handleNotNow(actionId: string) {
    try {
      await notNowNextAction(actionId);
      setActions((current) =>
        current.filter((action) => action.id !== actionId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהסתרת הפעולה");
    }
  }

  useEffect(() => {
    loadContexts();
  }, []);

  useEffect(() => {
    if (selectedContextId) {
      loadActions(selectedContextId);
    }
  }, [selectedContextId]);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          Engage
        </p>

        <h2 className="mt-1 text-2xl font-black">מה לעשות עכשיו?</h2>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          בחר Context וקבל רק את הפעולות שמתאימות למצב הנוכחי שלך.
        </p>
      </section>

      {error ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h3 className="font-black text-red-900">יש שגיאה</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
            {error}
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">בחר Context</h3>

        {isLoadingContexts ? (
          <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">
            טוען Contexts...
          </p>
        ) : contexts.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-800">
              אין עדיין Contexts במערכת. צריך ליצור לפחות Context אחד דרך
              Django admin.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {contexts.map((context) => {
              const isSelected = context.id === selectedContextId;
              const count =
                context.open_next_actions_count ?? context.count ?? 0;

              return (
                <button
                  key={context.id}
                  onClick={() => setSelectedContextId(context.id)}
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-sm font-black transition",
                    isSelected
                      ? "bg-[var(--brand-orange)] text-white"
                      : "bg-[var(--surface-soft)] text-[var(--brand-ink)] hover:bg-[var(--brand-cream-strong)]",
                  ].join(" ")}
                >
                  {context.name}
                  <span className="me-2 opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        {isLoadingActions ? (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="font-bold text-[var(--brand-ink-soft)]">
              טוען פעולות...
            </p>
          </section>
        ) : null}

        {!isLoadingActions && selectedContextId && actions.length === 0 ? (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
              אין פעולה זמינה
            </p>

            <h3 className="mt-2 text-xl font-black">
              אין כרגע פעולות בהקשר הזה
            </h3>

            <p className="mt-3 text-sm leading-6 text-[var(--brand-ink-soft)]">
              אפשר לבחור Context אחר או לחזור ל־Inbox ולעבד עוד פריטים.
            </p>
          </section>
        ) : null}

        {actions.map((action) => (
          <article
            key={action.id}
            className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm"
          >
            <h3 className="text-xl font-black">{action.title}</h3>

            {action.project_title ? (
              <p className="mt-2 text-xs font-bold text-[var(--brand-orange-dark)]">
                פרויקט: {action.project_title}
              </p>
            ) : null}

            {action.notes ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--brand-ink-soft)]">
                {action.notes}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--brand-ink-soft)]">
              {action.estimated_minutes ? (
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 font-bold">
                  {action.estimated_minutes} דק׳
                </span>
              ) : null}

              {action.energy ? (
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 font-bold">
                  אנרגיה: {action.energy}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleComplete(action.id)}
                className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white"
              >
                בוצע
              </button>

              <button
                onClick={() => handleNotNow(action.id)}
                className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm font-black text-[var(--brand-ink)]"
              >
                לא עכשיו
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
