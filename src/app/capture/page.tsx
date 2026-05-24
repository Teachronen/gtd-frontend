"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { quickCapture } from "@/lib/api";

export default function CapturePage() {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setErrorMessage("צריך לכתוב משהו כדי ללכוד.");
      setSuccessMessage(null);
      textareaRef.current?.focus();
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await quickCapture(trimmedText);

      setText("");
      setSuccessMessage("נשמר ל־Inbox.");
      textareaRef.current?.focus();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "לא הצלחתי לשמור את הפריט ל־Inbox."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-bold text-[var(--brand-orange-dark)]">
          Quick Capture
        </p>

        <h2 className="mt-1 text-3xl font-black text-[var(--brand-ink)]">
          לכוד משהו
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          כאן לא מחליטים, לא מסווגים ולא מתעדפים. רק מוציאים מהראש ושמים
          ב־Inbox.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="capture-text"
          className="block text-sm font-black text-[var(--brand-ink)]"
        >
          מה עלה לך לראש?
        </label>

        <textarea
          ref={textareaRef}
          id="capture-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          placeholder="לדוגמה: לבדוק עם דני לגבי הצעת המחיר"
          className="mt-3 min-h-44 w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-base leading-7 text-[var(--brand-ink)] outline-none transition placeholder:text-[var(--brand-ink-soft)]/60 focus:border-[var(--brand-orange)] focus:bg-white"
        />

        <div className="mt-2 flex items-center justify-between text-xs text-[var(--brand-ink-soft)]">
          <span>בלי סיווג. בלי החלטות. רק לכידה.</span>
          <span>{text.trim().length} תווים</span>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-800">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 w-full rounded-3xl bg-[var(--brand-orange)] px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-[var(--brand-orange-dark)]"
        >
          {isSaving ? "שומר..." : "שמור ל־Inbox"}
        </button>
      </form>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--brand-cream)] p-4">
        <h3 className="font-black text-[var(--brand-ink)]">
          מה קורה אחרי השמירה?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
          הפריט יישמר ב־Inbox. אחר כך, בזמן ריקון ה־Inbox, תחליט אם זו פעולה,
          פרויקט, מידע לשמירה, משהו להאציל או משהו ל־Someday.
        </p>

        <Link
          href="/inbox"
          className="mt-3 inline-block rounded-2xl bg-[var(--brand-ink)] px-4 py-3 text-sm font-bold text-white"
        >
          עבור ל־Inbox
        </Link>
      </section>
    </div>
  );
}
