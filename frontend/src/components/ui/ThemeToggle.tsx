import { useThemeStore } from "../../store/themeStore";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex w-10 h-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors border border-outline-variant/20 relative overflow-hidden ${className}`}
    >
      <span
        className="material-symbols-outlined text-[20px] absolute transition-all duration-500 ease-out"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        light_mode
      </span>
      <span
        className="material-symbols-outlined text-[20px] absolute transition-all duration-500 ease-out"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "scale(1)" : "scale(0.5)",
        }}
      >
        dark_mode
      </span>
    </button>
  );
}
