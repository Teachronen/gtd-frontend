"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("test_rotem");
  const [password, setPassword] = useState("StrongPass12345!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        setError("שם המשתמש או הסיסמה אינם נכונים.");
        return;
      }

      const data = await response.json();

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      router.push("/");
    } catch {
      setError("לא ניתן להתחבר לשרת כרגע.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <div className="mb-6 space-y-2 text-center">
            <p className="text-sm text-slate-400">GTD System</p>
            <h1 className="text-3xl font-bold">התחברות</h1>
            <p className="text-sm text-slate-400">
              התחבר כדי לגשת ל־Inbox, פעולות וסקירה שבועית.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">
                שם משתמש
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none focus:border-blue-500"
                autoComplete="username"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">סיסמה</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none focus:border-blue-500"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
