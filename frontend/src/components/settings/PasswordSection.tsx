import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, useSetNewPassword, useSetPassword } from "../../hooks/useSettings";
import { fullLogout } from "../../lib/auth";
import { useAuthStore } from "../../store/authStore";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

function StrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-full w-1/4 rounded-full transition-colors ${
              i < score ? (score <= 1 ? "bg-error" : score <= 2 ? "bg-tertiary" : "bg-primary") : "bg-outline-variant/50"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</p>
    </div>
  );
}

export function PasswordSection() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const setPassword = useSetPassword();
  const setNewPassword = useSetNewPassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword_] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const hasPassword = user?.has_usable_password ?? true;

  async function afterSuccess(refreshTokenAtSubmit: string | null) {
    setDone(true);
    await fullLogout(refreshTokenAtSubmit);
    setTimeout(() => navigate("/login"), 1200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const refreshTokenAtSubmit = useAuthStore.getState().refreshToken;

    try {
      if (hasPassword) {
        if (!currentPassword) {
          setError("Please enter your current password.");
          return;
        }
        await setPassword.mutateAsync({
          current_password: currentPassword,
          new_password: newPassword,
          re_new_password: confirmPassword,
        });
      } else {
        await setNewPassword.mutateAsync({ new_password: newPassword });
      }
      await afterSuccess(refreshTokenAtSubmit);
    } catch (err: any) {
      const data = err?.response?.data;
      const message =
        data?.current_password?.[0] ||
        data?.new_password?.[0] ||
        data?.re_new_password?.[0] ||
        data?.detail ||
        "Failed to update password.";
      setError(message);
    }
  }

  if (isLoading || !user) {
    return <p className="text-center text-on-surface-variant py-12">Loading...</p>;
  }

  const submitting = setPassword.isPending || setNewPassword.isPending;

  return (
    <section className="space-y-8">
      <h2 className="font-headline-md text-[20px] text-on-surface border-b border-outline-variant/10 pb-4">
        Password &amp; Security
      </h2>

      {done ? (
        <div className="bg-primary-container/10 border border-primary-container/20 text-primary-container p-4 rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">check_circle</span>
          <div>
            <p className="font-bold text-sm">Password updated</p>
            <p className="text-sm opacity-80">Signing you out for security — please log in again.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {!hasPassword && (
            <div className="bg-primary-container/10 border border-primary-container/20 text-primary-container p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5">info</span>
              <p className="text-sm">You signed up with Google and don't have a password yet. Set one below to also be able to log in with your email.</p>
            </div>
          )}

          <div className="space-y-4">
            {hasPassword && (
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  If you signed up with Google and don't have a password yet, leave this field blank.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword_(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
              <StrengthMeter password={newPassword} />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-sm hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
          </button>
        </form>
      )}
    </section>
  );
}
