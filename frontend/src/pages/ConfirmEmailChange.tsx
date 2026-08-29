import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { fullLogout } from "../lib/auth";
import { useAuthStore } from "../store/authStore";
import { Logo } from "../components/ui/Logo";

type Status = "loading" | "success" | "error";

export function ConfirmEmailChange() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    if (!uid || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("This confirmation link is invalid.");
      return;
    }

    const refreshTokenAtOpen = useAuthStore.getState().refreshToken;

    (async () => {
      try {
        const { data } = await api.post<{ message?: string }>("/auth/users/confirm-email-change/", { uid, token });
        setStatus("success");
        setMessage(data?.message ?? "Your email has been changed successfully.");
        await fullLogout(refreshTokenAtOpen);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.detail ||
            err?.response?.data?.non_field_errors?.[0] ||
            "This confirmation link is invalid or has already been used."
        );
      }
    })();
  }, [uid, token]);

  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div className="dot-pattern min-h-screen flex items-center justify-center px-6 bg-surface">
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
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Confirming your email</h1>
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
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Email changed successfully</h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  For your security, you've been signed out. Please log in again using your new email address.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full px-6 py-3 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-xs text-on-surface-variant">Redirecting automatically in {countdown}s...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[32px]">error</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Confirmation failed</h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{message}</p>
              </div>
              <Link
                to="/settings"
                className="w-full px-6 py-3 rounded-lg bg-surface-container text-on-surface font-label-sm hover:bg-surface-container-high transition-colors border border-outline-variant/20"
              >
                Back to Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
