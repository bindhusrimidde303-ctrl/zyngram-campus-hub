
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  role: "student" | "trainer" | "coordinator" | "admin";
};

const EMAIL_KEY = "campusRememberedEmail";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (rememberMe) {
      localStorage.setItem(EMAIL_KEY, cleanEmail);
    } else {
      localStorage.removeItem(EMAIL_KEY);
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to sign in.");
        return;
      }

      const user = result.user as User;

      sessionStorage.setItem(
        "campusCurrentUser",
        JSON.stringify(user)
      );

      const routes: Record<User["role"], string> = {
        student: "/",
        trainer: "/trainer",
        coordinator: "/coordinator",
        admin: "/admin",
      };

      router.replace(routes[user.role] || "/");
    } catch {
      setError("Unable to connect. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 shadow-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-between bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-800 p-8 text-white sm:p-12">
          <div>
            <Link href="/login" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-2xl font-black text-slate-950">
                Z
              </div>
              <div>
                <h1 className="text-xl font-bold">Zyngram</h1>
                <p className="text-xs tracking-widest text-slate-200">
                  CAMPUS HUB
                </p>
              </div>
            </Link>

            <div className="mt-12 sm:mt-16">
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                Welcome back
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">
                Your campus.
                <br />
                Your future.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
                Sign in to explore courses, discover opportunities,
                and stay connected with your campus community.
              </p>
            </div>
          </div>
          <p className="mt-10 text-sm text-slate-200">
            One place to learn, connect and grow.
          </p>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 md:p-12">
          <p className="text-sm font-bold tracking-widest text-indigo-700">
            CAMPUS HUB PORTAL
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Sign in to your account
          </h2>
          <p className="mt-3 text-base text-slate-700">
            Enter your registered email and password.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm font-bold">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-indigo-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setRememberMe(checked);

                    if (checked && email.trim()) {
                      localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
                    } else if (!checked) {
                      localStorage.removeItem(EMAIL_KEY);
                    }
                  }}
                  className="h-4 w-4 accent-indigo-600"
                />
                Remember my email
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Show password
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-700 px-4 py-3.5 font-bold text-white shadow-md hover:bg-indigo-800 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-center text-xs font-semibold text-slate-600">
              NEW TO CAMPUS HUB?
            </span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <Link
            href="/register"
            className="block w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center font-bold text-slate-900 hover:border-indigo-500 hover:bg-indigo-50"
          >
            Create a new account
          </Link>
        </section>
      </div>
    </main>
  );
}
