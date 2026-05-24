"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "בית" },
  { href: "/capture", label: "לכידה" },
  { href: "/inbox", label: "Inbox" },
  { href: "/now", label: "עכשיו" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-[var(--brand-ink)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--brand-cream)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-orange)] text-lg font-black text-white shadow-sm">
              D
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-orange-dark)]">
                Deep Learning Human
              </p>
              <h1 className="text-lg font-black leading-tight">GTD</h1>
            </div>
          </Link>

          <Link
            href="/capture"
            className="rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-orange-dark)]"
          >
            לכוד
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--brand-cream)]/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-col items-center justify-center px-2 py-3 text-sm transition",
                  isActive
                    ? "font-black text-[var(--brand-orange)]"
                    : "font-semibold text-[var(--brand-ink-soft)] hover:text-[var(--brand-orange-dark)]",
                ].join(" ")}
              >
                <span>{item.label}</span>

                {isActive ? (
                  <span className="mt-1 h-1 w-6 rounded-full bg-[var(--brand-orange)]" />
                ) : (
                  <span className="mt-1 h-1 w-6 rounded-full bg-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
