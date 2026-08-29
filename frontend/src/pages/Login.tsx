import { useState } from "react";
import { useNavigate, useLocation, Link, type Location } from "react-router-dom";
import { api } from "../lib/api";
import { completeLogin } from "../lib/auth";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { PasswordInput } from "../components/auth/PasswordInput";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  async function afterTokens(access: string, refresh: string) {
    await completeLogin(access, refresh);
    navigate(from, { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: tokens } = await api.post("/auth/jwt/create/", { email, password });
      await afterTokens(tokens.access, tokens.refresh);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Login failed. Double check your email and password — if you just signed up, make sure you've activated your account via the email we sent you."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      const { data: tokens } = await api.post("/api/google/", { token: idToken });
      await afterTokens(tokens.access, tokens.refresh);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-surface">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(25,51,39,0.04)] border border-outline-variant/10 relative z-10">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-8 text-center">Welcome back</h1>

          <GoogleAuthButton onCredential={handleGoogleCredential} disabled={loading} />

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-outline-variant/30" />
            <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider text-[10px]">
              or
            </span>
            <div className="flex-grow border-t border-outline-variant/30" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface block mb-2" htmlFor="email">
                Email Address
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
                className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-colors duration-200"
              />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface block mb-2" htmlFor="password">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && <p className="text-error text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary rounded-lg py-3 px-6 font-label-sm text-label-sm hover:bg-primary transition-colors duration-200 mt-2 h-[48px] flex items-center justify-center shadow-[0_4px_12px_rgba(25,51,39,0.1)] hover:shadow-[0_6px_16px_rgba(25,51,39,0.15)] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
