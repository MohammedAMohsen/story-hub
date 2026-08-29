import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { AuthLayout } from "../components/auth/AuthLayout";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/users/reset_password/", { email });
    } catch {
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-surface">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(25,51,39,0.04)] border border-outline-variant/10 relative z-10">
          {sent ? (
            <div className="text-center flex flex-col items-center gap-4">
              <span
                className="material-symbols-outlined text-primary text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_read
              </span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Check your email</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                If an account exists for <span className="font-bold text-on-surface">{email}</span>, we've sent a
                link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span
                  className="material-symbols-outlined text-primary text-[44px] mb-3"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock_reset
                </span>
                <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2">
                  Reset your password
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface transition-colors placeholder-outline"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-container text-on-primary rounded-lg py-3 px-6 font-label-sm text-label-sm hover:bg-primary transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Log in
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
