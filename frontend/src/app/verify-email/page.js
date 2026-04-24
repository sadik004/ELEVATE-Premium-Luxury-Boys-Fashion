"use client";

import { useState, Suspense } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";

function VerifyEmailContent() {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    try {
      await verifyOtp(email, otpCode);
      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/cart");
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Verify Email</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Enter the 6-digit code sent to {email || "your email"}.
        </p>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: '#44ff44', textAlign: 'center', marginBottom: '1.5rem' }}>{success}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="OTP Code"
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
          />
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
