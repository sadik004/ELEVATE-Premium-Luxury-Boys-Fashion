"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import styles from "../login/page.module.css";

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
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Authenticating...</h1>
        <p style={{ textAlign: "center", color: "var(--gold-accent)" }}>
          Please wait while we complete your login.
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
