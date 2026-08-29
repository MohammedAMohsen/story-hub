import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { PrivateProfile, User } from "../types";

export function useCurrentUser() {
  const storedUser = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/users/me/");
      return data;
    },
    initialData: storedUser ?? undefined,
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { first_name: string; last_name: string; username: string }) => {
      const { data } = await api.patch<User>("/auth/users/me/", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<User>(["current-user"], (old) => ({ ...(old as User), ...data }));
      const { accessToken, refreshToken, user, login } = useAuthStore.getState();
      if (accessToken && refreshToken) {
        login(accessToken, refreshToken, { ...(user as User), ...data });
      }
    },
  });
}

// ============ Profile (Bio/Avatar/Cover/Location/Birthday/Social) ============
type ProfileUpdatePayload = {
  bio?: string;
  location?: string;
  birth_date?: string | null;
  website?: string;
  github?: string;
  linkedin?: string;
  avatarFile?: File | null;
  coverFile?: File | null;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const { avatarFile, coverFile, ...fields } = payload;
      if (avatarFile || coverFile) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, value);
        });
        if (avatarFile) formData.append("avatar", avatarFile);
        if (coverFile) formData.append("cover", coverFile);
        const { data } = await api.patch<PrivateProfile>("/api/profile/me/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
      }
      const { data } = await api.patch<PrivateProfile>("/api/profile/me/", fields);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile-me"], data);
    },
  });
}

// ============ Email ============
export function useChangeEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<{ detail?: string }>("/auth/users/change-email/", { email });
      return data;
    },
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string; re_new_password: string }) => {
      const { data } = await api.post("/auth/users/set_password/", payload);
      return data;
    },
  });
}

export function useSetNewPassword() {
  return useMutation({
    mutationFn: async (payload: { new_password: string }) => {
      const { data } = await api.post("/auth/users/set-new-password/", payload);
      return data;
    },
  });
}

// ============ Delete Account ============
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (current_password: string) => {
      await api.delete("/auth/users/me/", { data: { current_password } });
    },
  });
}
