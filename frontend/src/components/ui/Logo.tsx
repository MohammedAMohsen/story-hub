import logoLight from "../../assets/logo.png";
import logoDark from "../../assets/logo_darkmod.png";
import { useThemeStore } from "../../store/themeStore";

export function Logo({ className = "" }: { className?: string }) {
  const { theme } = useThemeStore();
  const src = theme === "dark" ? logoDark : logoLight;

  return <img src={src} alt="StoryHub" className={className} />;
}
