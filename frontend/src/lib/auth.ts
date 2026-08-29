import { api } from "./api";
import { useAuthStore } from "../store/authStore";

//
export async function fullLogout(refreshTokenOverride?: string | null) {
  const refreshToken = refreshTokenOverride ?? useAuthStore.getState().refreshToken;
  if (refreshToken) {
    try {
      await api.post("/auth/users/logout/", { refresh: refreshToken });
    } catch {
    }
  }
  useAuthStore.getState().logout();
}

export async function completeLogin(access: string, refresh: string) {
  const { data: user } = await api.get("/auth/users/me/", {
    headers: { Authorization: `JWT ${access}` },
  });
  let avatar: string | null = null;
  try {
    const { data: profile } = await api.get("/api/profile/me/", {
      headers: { Authorization: `JWT ${access}` },
    });
    avatar = profile.avatar ?? null;
  } catch {
  }
  useAuthStore.getState().login(access, refresh, { ...user, avatar });
}
