import { Link } from "react-router-dom";

export function FollowRequired() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-20 px-6 max-w-lg mx-auto">
      <div className="relative w-24 h-24 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/8 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-primary/10" />
        <div className="relative w-14 h-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px] text-primary">lock</span>
        </div>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface mb-4">
        This corner is for members only.
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-10 max-w-sm">
        Following your favorite storytellers, and keeping their new stories close, is something we save for
        readers who've made a home here. It only takes a moment to join.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="px-7 py-3 rounded-full bg-primary text-on-primary text-label-sm font-bold hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="px-7 py-3 rounded-full border border-outline-variant text-on-surface text-label-sm font-bold hover:border-primary hover:text-primary transition-colors duration-300"
        >
          Create an account
        </Link>
      </div>

      <Link
        to="/"
        className="mt-10 text-xs text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to stories
      </Link>
    </div>
  );
}
