import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function MobileSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    navigate({ pathname: "/", search: params.toString() });
  }

  return (
    <form onSubmit={handleSubmit} className="md:hidden w-full max-w-md px-1 mb-4">
      <div className="relative w-full flex items-center">
        <button
          type="submit"
          aria-label="Search"
          className="material-symbols-outlined absolute left-4 text-on-surface-variant/60 text-[20px]"
        >
          search
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-2.5 pl-12 pr-4 text-body-md focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
          placeholder="Search stories..."
          type="text"
        />
      </div>
    </form>
  );
}
