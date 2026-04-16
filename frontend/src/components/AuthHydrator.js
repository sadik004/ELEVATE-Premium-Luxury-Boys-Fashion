"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";

export default function AuthHydrator() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return null;
}
