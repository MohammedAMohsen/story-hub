import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { completeLogin } from "../lib/auth";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { PasswordInput } from "../components/auth/PasswordInput";

export function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirm_password: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/users/", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        re_password: confirmPassword,
      });
      setDone(true);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const flat: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          flat[key] = Array.isArray(value) ? String(value[0]) : String(value);
        });
        setErrors(flat);
      } else {
        setErrors({ non_field_errors: "Sign up failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setErrors({});
    setLoading(true);
    try {
      const { data: tokens } = await api.post("/api/google/", { token: idToken });
      await completeLogin(tokens.access, tokens.refresh);
      navigate("/");
    } catch (err: any) {
      setErrors({ non_field_errors: err?.response?.data?.detail || "Google sign-in failed. Please try again." });
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
            <div className="text-center py-4 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
              </div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Check your email</h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                We've sent an activation link to <span className="font-bold text-on-surface">{email}</span>. Click
                it to activate your account, then come back and log in.
              </p>
              <Link
                to="/login"
                className="w-full mt-2 bg-primary-container text-on-primary rounded-full py-3 px-6 font-label-sm text-label-sm hover:bg-primary transition-colors duration-200 h-[48px] flex items-center justify-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-8 text-center">
                Create your account
              </h1>

              <GoogleAuthButton onCredential={handleGoogleCredential} disabled={loading} />

              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider text-[10px]">
                  or
                </span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="sr-only" htmlFor="first-name">
                      First Name
                    </label>
                    <input
                      id="first-name"
                      name="first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-colors duration-200"
                    />
                    {errors.first_name && <p className="text-error text-xs mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="last-name">
                      Last Name
                    </label>
                    <input
                      id="last-name"
                      name="last-name"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-colors duration-200"
                    />
                    {errors.last_name && <p className="text-error text-xs mt-1">{errors.last_name}</p>}
                  </div>
                </div>
                <div>
                  <label className="sr-only" htmlFor="email">
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
                    placeholder="Email"
                    className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-colors duration-200"
                  />
                  {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Password"
                  />
                  {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="sr-only" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Confirm Password"
                  />
                  {errors.confirm_password && <p className="text-error text-xs mt-1">{errors.confirm_password}</p>}
                  {errors.re_password && <p className="text-error text-xs mt-1">{errors.re_password}</p>}
                </div>

                {errors.non_field_errors && <p className="text-error text-xs">{errors.non_field_errors}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm rounded-lg py-3.5 transition-colors duration-200 mt-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>
              <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-container font-semibold transition-colors duration-200 underline decoration-primary/30 hover:decoration-primary underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
