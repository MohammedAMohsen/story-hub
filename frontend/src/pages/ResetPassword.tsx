import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { AuthLayout } from "../components/auth/AuthLayout";
import { PasswordInput } from "../components/auth/PasswordInput";

function strengthLevel(length: number): { bars: number; label: string; barColor: string; textColor: string } {
  if (length === 0) return { bars: 0, label: "", barColor: "", textColor: "" };
  if (length < 6) return { bars: 1, label: "Weak", barColor: "bg-error", textColor: "text-error" };
  if (length < 10) return { bars: 2, label: "Fair", barColor: "bg-[#fbbf24]", textColor: "text-[#d97706]" };
  if (length < 14) return { bars: 3, label: "Good", barColor: "bg-primary-fixed", textColor: "text-primary" };
  return { bars: 4, label: "Strong", barColor: "bg-primary", textColor: "text-primary" };
}

export function ResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = strengthLevel(newPassword.length);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("This reset link is invalid.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/users/reset_password_confirm/", {
        uid,
        token,
        new_password: newPassword,
        re_new_password: confirmPassword,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        data?.new_password?.[0] ||
          data?.token?.[0] ||
          data?.uid?.[0] ||
          data?.detail ||
          "This reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-surface">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(25,51,39,0.04)] border border-outline-variant/10 relative z-10">
          {done ? (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
              </div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Password updated</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Redirecting you to log in with your new password...
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2">
                Set a new password
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Choose a new password for your account to regain access.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="new-password">
                    New Password
                  </label>
                  <PasswordInput
                    id="new-password"
                    name="new-password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-on-surface-variant/50 pr-11"
                  />
                  <div className="pt-2">
                    <div className="flex gap-1 mb-1 h-1.5 w-full">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            i < strength.bars ? strength.barColor : "bg-surface-variant"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`font-label-sm text-label-sm text-right ${strength.textColor || "text-on-surface-variant/70"}`}>
                      {strength.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-on-surface-variant/50 pr-11"
                  />
                </div>

                {error && <p className="text-error text-sm">{error}</p>}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary font-label-sm text-label-sm rounded-lg py-4 px-6 hover:bg-primary hover:shadow-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </>
          )}
          {!done && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
