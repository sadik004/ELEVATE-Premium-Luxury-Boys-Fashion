import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const data = await api.post("/auth/login", { email, password });
        set({ token: data.token, user: data.user });
      },

      register: async (name, email, password) => {
        await api.post("/auth/register", {
          name,
          email,
          password,
        });
        // We do not set the token/user here anymore; they must verify OTP first.
      },

      verifyOtp: async (email, otpCode) => {
        const data = await api.post("/auth/verify-otp", { email, otpCode });
        set({ token: data.token, user: data.user });
      },

      setToken: (token) => {
        set({ token });
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
