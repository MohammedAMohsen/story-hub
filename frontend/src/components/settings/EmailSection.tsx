import { useState } from "react";
import { useCurrentUser, useChangeEmail } from "../../hooks/useSettings";

export function EmailSection() {
  const { data: user, isLoading } = useCurrentUser();
  const changeEmail = useChangeEmail();

  const [newEmail, setNewEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    changeEmail.mutate(newEmail, {
      onSuccess: () => {
        setSent(true);
        setNewEmail("");
      },
      onError: (err: any) => {
        setError(err?.response?.data?.email?.[0] || "Failed to request email change.");
      },
    });
  }

  if (isLoading || !user) {
    return <p className="text-center text-on-surface-variant py-12">Loading...</p>;
  }

  return (
    <section className="space-y-8">
      <h2 className="font-headline-md text-[20px] text-on-surface border-b border-outline-variant/10 pb-4">
        Email Address
      </h2>

      {sent && (
        <div className="bg-primary-container/10 border border-primary-container/20 text-primary-container p-4 rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">mark_email_read</span>
          <div>
            <p className="font-bold text-sm">Confirmation link sent</p>
            <p className="text-sm opacity-80">Please check your new email to verify the change.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant">Current Email</label>
          <input
            readOnly
            type="email"
            value={user.email}
            className="w-full bg-surface-container-highest/50 border border-transparent rounded-lg p-3 text-body-md text-on-surface-variant cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant">New Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email address"
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
        {error && <p className="text-error text-xs">{error}</p>}
        <button
          type="submit"
          disabled={changeEmail.isPending}
          className="px-6 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm hover:bg-surface-variant transition-colors border border-outline-variant/20 disabled:opacity-50"
        >
          {changeEmail.isPending ? "Sending..." : "Change Email"}
        </button>
      </form>
    </section>
  );
}
