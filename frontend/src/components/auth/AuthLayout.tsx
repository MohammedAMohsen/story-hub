import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { AuthBauhausPanel } from "./AuthBauhausPanel";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full bg-surface-paper text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      <Link className="fixed top-6 left-6 md:left-12 z-50 hover:opacity-80 transition-opacity" to="/">
        <img src={logo} alt="StoryHub" className="h-13 w-auto object-contain" />
      </Link>
      <a
        className="fixed top-6 right-6 md:right-12 z-50 flex items-center gap-1.5 font-body-md text-body-lg font-semibold text-on-surface md:text-primary-fixed hover:text-primary md:hover:text-primary-fixed/75 transition-colors"
        href="help"
      >
        <span className="material-symbols-outlined text-[20px]">help</span>
        Help
      </a>

      <div className="flex min-h-screen">
        {children}
        <AuthBauhausPanel />
      </div>
    </div>
  );
}
