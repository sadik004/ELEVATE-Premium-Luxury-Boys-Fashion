import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setToken: (token) => {
        set({ token });
      },

      setAuth: ({ token, user }) => {
        set({ token, user });
      },

      fetchProfile: async () => {
        try {
          const token = get().token;
          if (!token) return;
          const data = await api.get("/auth/me");
          set({ user: data });
        } catch (error) {
          console.error("Failed to fetch profile", error);
          set({ token: null, user: null });
        }
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
