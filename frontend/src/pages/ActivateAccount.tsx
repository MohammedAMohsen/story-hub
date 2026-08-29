import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Logo } from "../components/ui/Logo";

type Status = "loading" | "success" | "error";

export function ActivateAccount() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    if (!uid || !token) {
      setStatus("error");
      setMessage("This activation link is invalid.");
      return;
    }

    (async () => {
      try {
        await api.post("/auth/users/activation/", { uid, token });
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.detail ||
            err?.response?.data?.non_field_errors?.[0] ||
            "This activation link is invalid or has already been used."
        );
      }
    })();
  }, [uid, token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface-paper">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="w-auto object-contain transition-all p-0 m-0 h-13" />
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-lg p-8 md:p-10 flex flex-col items-center text-center gap-5">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">mark_email_read</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Activating your account</h1>
                <p className="text-body-md text-on-surface-variant">Hang tight, this only takes a moment...</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Account activated</h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Your email has been verified. You can now log in to StoryHub.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full px-6 py-3 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[32px]">error</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Activation failed</h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{message}</p>
              </div>
              <Link
                to="/login"
                className="w-full px-6 py-3 rounded-lg bg-surface-container text-on-surface font-label-sm hover:bg-surface-container-high transition-colors border border-outline-variant/20"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
