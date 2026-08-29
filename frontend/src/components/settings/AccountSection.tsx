import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useCurrentUser, useUpdateAccount } from "../../hooks/useSettings";
import type { SectionHandle } from "../../pages/Settings";

export const AccountSection = forwardRef<SectionHandle, { onDirtyChange: (dirty: boolean) => void }>(
  function AccountSection({ onDirtyChange }, ref) {
    const { data: user, isLoading } = useCurrentUser();
    const updateAccount = useUpdateAccount();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const initialized = useRef(false);
    useEffect(() => {
      if (!user || initialized.current) return;
      initialized.current = true;
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setUsername(user.username);
    }, [user]);

    const dirty =
      !!user && (firstName !== user.first_name || lastName !== user.last_name || username !== user.username);

    useEffect(() => {
      onDirtyChange(dirty);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty]);

    useImperativeHandle(ref, () => ({
      async save() {
        setError("");
        try {
          await updateAccount.mutateAsync({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: username.trim().toLowerCase(),
          });
        } catch (err: any) {
          const data = err?.response?.data;
          const message =
            data?.username?.[0] || data?.first_name?.[0] || data?.last_name?.[0] || data?.detail || "Failed to save changes.";
          setError(message);
          throw err;
        }
      },
      reset() {
        if (!user) return;
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setUsername(user.username);
        setError("");
      },
    }));

    if (isLoading || !user) {
      return <p className="text-center text-on-surface-variant py-12">Loading...</p>;
    }

    const joinDate = new Date(user.date_joined).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <section className="space-y-8">
        <h2 className="font-headline-md text-[20px] text-on-surface border-b border-outline-variant/10 pb-4">
          Account Details
        </h2>
        <div className="space-y-6">
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-sm text-on-surface-variant">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-on-surface-variant">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pl-8 pr-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-1">No dots, not previously reserved.</p>
          </div>
          <div className="pt-4 border-t border-outline-variant/10">
            <p className="text-sm text-on-surface-variant">Joined on {joinDate}</p>
          </div>
        </div>
      </section>
    );
  }
);
