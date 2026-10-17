
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) { setError("Your new password must contain at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("The passwords do not match."); return; }
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Unable to reset password."); return; }
      setMessage("Password updated! Redirecting to sign in...");
      setPassword(""); setConfirmPassword("");
      window.setTimeout(() => router.push("/login"), 1000);
    } catch { setError("Cannot connect to the Campus Hub backend. Please try again."); }
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        {/* Left branding panel */}
        <aside className="auth-brand">
          <Link href="/login" className="brand-logo">
            <span className="brand-mark">Z</span>

            <span className="brand-name">
              <strong>Zyngram</strong>
              <small>CAMPUS HUB</small>
            </span>
          </Link>

          <div className="brand-message">
            <span className="eyebrow">ACCOUNT RECOVERY</span>

            <h1>
              A fresh start.
              <br />
              A secure journey.
            </h1>

            <p>
              Reset your demo account password and return to
              your campus community.
            </p>

            <div className="brand-benefits">
              <p>✓ Recover access to your account</p>
              <p>✓ Choose a new password</p>
              <p>✓ Return to your Campus Hub</p>
            </div>
          </div>

          <p className="brand-footer">
            One place to learn, connect and grow.
          </p>
        </aside>

        {/* Right password recovery form */}
        <section className="auth-form-panel">
          <div className="auth-form-content">
            <span className="form-tag">STUDENT PORTAL</span>

            <h2>Reset your password</h2>

            <p className="form-subtitle">
              Enter your registered email address and choose a new password.
            </p>

            <form className="register-form" onSubmit={handleReset}>
              <div className="form-field">
                <label htmlFor="recovery-email">Email address</label>

                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-password">New password</label>

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="confirm-new-password">
                  Confirm new password
                </label>

                <input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your new password again"
                  autoComplete="new-password"
                  required
                />
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <span>Show passwords</span>
              </label>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success" role="status">
                  {message}
                </p>
              )}

              <button className="auth-button" type="submit">
                Reset password
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="auth-bottom">
              Remember your password?{" "}
              <Link href="/login">Back to sign in</Link>
            </p>

            <p className="form-subtitle recovery-note">
              Demo recovery only: this updates the server-stored password. It does not verify identity or send a reset email; use an email verification flow before production.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
