import { useAuthStore } from "../store/authStore";

export function useProfileLink() {
  const currentUsername = useAuthStore((s) => s.user?.username);
  return (username: string) => (username === currentUsername ? "/profile" : `/${username}`);
}

export function formatBirthDate(isoDate: string) {
  const date = new Date(isoDate + "T00:00:00");
  return `Born ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
}
