"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Check your email for a 6-digit code.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { email, code, newPassword });
      toast.success("Password updated. You can sign in.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-bg)" }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "var(--space-8)" }}>
        <Link href="/login" className="text-sm" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          ← Back to login
        </Link>
        <h1 className="page-title" style={{ marginTop: "var(--space-4)" }}>
          Reset password
        </h1>
        <p className="page-subtitle" style={{ marginBottom: "var(--space-6)" }}>
          {step === 1 && "Enter your account email. We’ll send a verification code."}
          {step === 2 && "Enter the code from your email and choose a new password."}
          {step === 3 && "You’re all set."}
        </p>

        {step === 1 && (
          <form onSubmit={sendCode} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={reset} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">6-digit code</label>
              <input
                className="form-input"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        {step === 3 && (
          <Link href="/login" className="btn btn-primary btn-block" style={{ textAlign: "center" }}>
            Go to student login
          </Link>
        )}

        <p className="text-sm text-muted mt-4" style={{ color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
          Staff account? After reset, use{" "}
          <Link href="/staff-login" style={{ fontWeight: 600 }}>
            staff login
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
