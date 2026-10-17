
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "student" | "trainer" | "coordinator";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError("Please accept the terms to continue.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to create account.");
        return;
      }

      setMessage("Account created! Redirecting to sign in...");
      window.setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Cannot connect to the Campus Hub backend. Please try again.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <aside className="auth-brand">
          <Link href="/login" className="brand-logo">
            <span className="brand-mark">Z</span>
            <span className="brand-name">
              <strong>Zyngram</strong>
              <small>CAMPUS HUB</small>
            </span>
          </Link>

          <div className="brand-message">
            <span className="eyebrow">START YOUR JOURNEY</span>
            <h1>Your campus.<br />Your future.</h1>
            <p>
              Join a connected campus community. Explore learning resources,
              discover opportunities and prepare for your career.
            </p>

            <div className="brand-benefits">
              <p>✓ Discover courses and learning resources</p>
              <p>✓ Explore internships and career opportunities</p>
              <p>✓ Stay connected with campus activities</p>
            </div>
          </div>

          <p className="brand-footer">
            One place to learn, connect and grow.
          </p>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-content">
            <span className="form-tag">CAMPUS HUB PORTAL</span>
            <h2>Create your account</h2>
            <p className="form-subtitle">
              Select your role and fill in your details.
            </p>

            <form className="register-form" onSubmit={handleRegister}>
              <div className="form-field">
                <label htmlFor="register-role">Register as</label>
                <select
                  id="register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
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
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Enter your password again"
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

              <label className="check-row terms-row">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>I agree to the terms of use.</span>
              </label>

              {error && (
                <p className="auth-error" role="alert">{error}</p>
              )}

              {message && (
                <p className="auth-success" role="status">{message}</p>
              )}

              <button className="auth-button" type="submit">
                Create account <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="auth-bottom">
              Already have an account?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
