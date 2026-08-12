import React, { useState } from "react";
import { Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primaryText">
            <Layers size={20} />
          </div>
          <h1 className="mt-3 text-lg font-semibold text-text">Sign in to TaskFlow</h1>
          <p className="mt-1 text-sm text-textMuted">Your team's shared task workspace</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-card"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-textMuted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@taskflow.dev"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-textMuted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primaryText hover:bg-primaryHover disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-textMuted">
          Demo accounts (seeded): ahsan@taskflow.dev · ali@taskflow.dev — password: password123
        </p>
      </div>
    </div>
  );
}
