"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const setToken = useAuthStore((state) => state.setToken);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    if (token) {
      setToken(token);
      fetchProfile().then(() => {
        router.push("/cart");
      });
    } else {
      router.push("/login");
    }
  }, [token, setToken, fetchProfile, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-luxury-black">
      <div className="w-full max-w-md bg-glass-bg border border-glass-border p-10 backdrop-blur-md rounded-sm shadow-2xl relative overflow-hidden">
        <h1 className="text-4xl font-serif text-luxury-gold mb-2 text-center">Authenticating...</h1>
        <p className="text-center text-luxury-gold">
          Please wait while we complete your login.
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center bg-luxury-black">Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
