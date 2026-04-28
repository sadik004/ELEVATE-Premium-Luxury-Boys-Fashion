"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/authStore";

export default function AuthHydrator() {
  const { status } = useSession();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      logout();
      return;
    }

    if (status !== "authenticated" || token) {
      return;
    }

    let cancelled = false;

    async function hydrateBackendToken() {
      try {
        const response = await fetch("/api/auth/backend-token", {
          method: "POST",
          cache: "no-store",
        });
        const data = await response.json();

        if (!cancelled && response.ok) {
          setAuth({ token: data.token, user: data.user });
        }
      } catch (error) {
        console.error("Failed to hydrate backend token", error);
      }
    }

    hydrateBackendToken();

    return () => {
      cancelled = true;
    };
  }, [logout, setAuth, status, token]);

  return null;
}
