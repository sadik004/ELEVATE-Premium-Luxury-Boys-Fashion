import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const data = await api.post("/auth/login", { email, password });
        set({ token: data.token, user: data.user });
      },

      register: async (name, email, password) => {
        const data = await api.post("/auth/register", {
          name,
          email,
          password,
        });
        set({ token: data.token, user: data.user });
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
