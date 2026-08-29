import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, useDeleteAccount } from "../../hooks/useSettings";
import { fullLogout } from "../../lib/auth";
import { useAuthStore } from "../../store/authStore";

export function DangerSection({ onGoToPassword }: { onGoToPassword: () => void }) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const deleteAccount = useDeleteAccount();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const hasPassword = user?.has_usable_password ?? true;

  async function handleDelete() {
    setError("");
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }
    const refreshTokenAtSubmit = useAuthStore.getState().refreshToken;
    try {
      await deleteAccount.mutateAsync(password);
      await fullLogout(refreshTokenAtSubmit);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.current_password?.[0] || err?.response?.data?.detail || "Failed to delete account.");
    }
  }

  return (
    <section className="space-y-8">
      <h2 className="font-headline-md text-[20px] text-error border-b border-error/20 pb-4">Delete Account</h2>
      <div className="bg-error/5 border border-error/20 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-error text-body-lg">Delete Account</h3>
        <p className="text-body-md text-on-surface-variant">
          Once you delete your account, there is no going back. Please be certain. This will permanently delete your
          profile, stories, comments, and remove all your data from our servers.
        </p>

        {!hasPassword ? (
          <div className="bg-primary-container/10 border border-primary-container/20 text-primary-container p-4 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">info</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                You signed up with Google and don't have a password yet. For your security, you'll need to set one
                before you can delete your account.
              </p>
              <button
                type="button"
                onClick={onGoToPassword}
                className="self-start text-sm font-bold underline hover:opacity-80 transition-opacity"
              >
                Set a password
              </button>
            </div>
          </div>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="px-6 py-2.5 rounded-lg bg-error text-on-error font-label-sm hover:bg-error/90 transition-colors shadow-sm"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-sm text-error">Confirm Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full bg-surface-container-low border border-error/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-error/20 focus:border-error/50 transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            {error && <p className="text-error text-xs">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteAccount.isPending}
                className="px-6 py-2.5 rounded-lg bg-error text-on-error font-label-sm hover:bg-error/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {deleteAccount.isPending ? "Deleting..." : "Confirm Deletion"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setPassword("");
                  setError("");
                }}
                className="px-6 py-2.5 rounded-lg text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
