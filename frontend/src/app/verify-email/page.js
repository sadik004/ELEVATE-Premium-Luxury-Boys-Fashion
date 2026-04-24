"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../login/page.module.css";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const name = searchParams.get("name");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email address is missing. Please restart sign-up.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);
    const verifyToast = toast.loading("Verifying your account...");

    try {
      const result = await signIn("credentials", {
        email,
        name,
        otp,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        toast.error(result.error, { id: verifyToast });
      } else {
        toast.success("Account verified successfully!", { id: verifyToast });
        window.location.href = result?.url || "/cart";
      }
    } catch (err) {
      toast.error("An unexpected error occurred.", { id: verifyToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsLoading(true);
    const resendToast = toast.loading("Sending new code...");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, purpose: "signup" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      toast.success(data.message || "New code sent! Check your email.", { id: resendToast });
    } catch (err) {
      toast.error(err.message, { id: resendToast });
    } finally {
      setIsLoading(false);
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
          <div className={styles.inputGroup}>
            <label>OTP Code</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Verify
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-luxury-gold hover:text-white transition-colors uppercase tracking-widest text-xs underline underline-offset-4 ml-1"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-luxury-black">
        <Loader2 className="animate-spin text-luxury-gold" size={32} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}