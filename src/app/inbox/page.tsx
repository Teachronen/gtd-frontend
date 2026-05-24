"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInbox } from "@/lib/api";

type InboxItem = {
  id: string;
  title: string;
  body?: string;
  status: string;
  source?: string;
  outcome?: string;
  created_at?: string;
  updated_at?: string;
};

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInbox() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getInbox();
      setItems(result as InboxItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת Inbox");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
            Inbox
          </p>

          <h2 className="mt-1 text-2xl font-black text-[var(--brand-ink)]">
            דברים שעדיין לא הובהרו
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
            כאן מופיעים דברים שלכדת ועדיין לא החלטת מה הם.
          </p>
        </div>

        <Link
          href="/capture"
          className="shrink-0 rounded-2xl bg-[var(--brand-orange)] px-4 py-2 text-sm font-bold text-white shadow-sm"
        >
          לכוד
        </Link>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-[var(--brand-ink)]">סה״כ פריטים</p>
            <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">
              פריטים שמחכים לעיבוד
            </p>
          </div>

          <p className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-lg font-black text-[var(--brand-orange-dark)]">
            {items.length}
          </p>
        </div>

        <Link
          href="/inbox/process"
          className="mt-5 block rounded-2xl bg-[var(--brand-ink)] px-4 py-3 text-center font-bold text-white"
        >
          התחל לרוקן Inbox
        </Link>
      </section>

      {isLoading ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="font-bold text-[var(--brand-ink)]">טוען Inbox...</p>
        </section>
      ) : null}

      {error ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h3 className="font-black text-red-900">שגיאה בטעינת Inbox</h3>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-800">
            {error}
          </p>

          <button
            onClick={loadInbox}
            className="mt-4 rounded-2xl bg-red-900 px-4 py-3 text-sm font-bold text-white"
          >
            נסה שוב
          </button>
        </section>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
          <h3 className="text-xl font-black text-[var(--brand-ink)]">
            Inbox Zero
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
            אין כרגע פריטים שמחכים להבהרה.
          </p>

          <Link
            href="/now"
            className="mt-5 inline-block rounded-2xl bg-[var(--brand-orange)] px-4 py-3 text-sm font-bold text-white"
          >
            עבור למה לעשות עכשיו
          </Link>
        </section>
      ) : null}

      <section className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-black text-[var(--brand-ink)]">
                  {item.title}
                </h3>

                {item.body ? (
                  <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-[var(--brand-ink-soft)]">
                    {item.body}
                  </p>
                ) : null}
              </div>

              <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-orange-dark)]">
                {item.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
