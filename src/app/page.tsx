"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHome } from "@/lib/api";

type HomeSummary = {
  inbox_count: number;
  open_next_actions_count: number;
  waiting_for_due_count?: number;
  stuck_projects_count?: number;
  weekly_review?: {
    is_due?: boolean;
    status?: string;
    current_review_id?: string | null;
    message?: string;
  };
};

export default function HomePage() {
  const [data, setData] = useState<HomeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadHome() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getHome();
      setData(result as HomeSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHome();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="font-bold text-[var(--brand-ink)]">טוען את הבית...</p>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
          מתחבר ל־backend ומביא את מצב המערכת.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <h2 className="text-xl font-black text-red-900">
          לא הצלחתי להתחבר ל־API
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-800">
          {error}
        </p>

        <button
          onClick={loadHome}
          className="mt-4 rounded-2xl bg-red-900 px-4 py-3 text-sm font-bold text-white"
        >
          נסה שוב
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[var(--brand-orange)] p-5 text-white shadow-sm">
        <p className="text-sm font-bold text-white/80">ברוך הבא</p>

        <h2 className="mt-2 text-3xl font-black leading-tight">
          מה צריך את תשומת הלב שלך עכשיו?
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Inbox" value={data?.inbox_count ?? 0} />
          <StatCard
            label="פעולות"
            value={data?.open_next_actions_count ?? 0}
          />
          <StatCard
            label="תקועים"
            value={data?.stuck_projects_count ?? 0}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <HomeAction
          href="/capture"
          title="לכוד משהו"
          description="הכנס מחשבה, משימה או רעיון בלי לסווג ובלי לחשוב יותר מדי."
        />

        <HomeAction
          href="/inbox"
          title="רוקן Inbox"
          description="עבור פריט־פריט והפוך דברים לא ברורים לפעולות, פרויקטים או מידע."
        />

        <HomeAction
          href="/now"
          title="מה לעשות עכשיו?"
          description="בחר Context וקבל רק את הפעולות שמתאימות למצב הנוכחי שלך."
        />
      </section>

      {data?.weekly_review?.is_due ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
            Weekly Review
          </p>

          <h3 className="mt-1 text-xl font-black text-[var(--brand-ink)]">
            סקירה שבועית ממתינה
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
            הגיע הזמן לעבור על המערכת ולוודא ששום דבר לא נופל בין הכיסאות.
          </p>

          <Link
            href="/weekly-review"
            className="mt-4 inline-block rounded-2xl bg-[var(--brand-orange)] px-4 py-3 text-sm font-bold text-white"
          >
            התחל סקירה
          </Link>
        </section>
      ) : null}

      {(data?.waiting_for_due_count ?? 0) > 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
            Waiting For
          </p>

          <h3 className="mt-1 text-xl font-black">
            יש {data?.waiting_for_due_count} מעקבים שהגיע זמנם
          </h3>

          <Link
            href="/waiting-for"
            className="mt-4 inline-block rounded-2xl bg-[var(--brand-ink)] px-4 py-3 text-sm font-bold text-white"
          >
            עבור ל־Waiting For
          </Link>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white/15 p-3">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/80">{label}</p>
    </div>
  );
}

function HomeAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--brand-orange)] hover:bg-[var(--surface-soft)]"
    >
      <h3 className="text-lg font-black text-[var(--brand-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
        {description}
      </p>
    </Link>
  );
}
