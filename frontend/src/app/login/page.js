"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage("OTP sent! Please check your email.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Success: Redirect to callback URL
        window.location.href = result?.url || "/cart";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/cart" });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Sign In</h1>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.successMessage} style={{ color: 'var(--gold-accent)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue with Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                disabled={isLoading}
                maxLength={6}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => handleSendOtp()}
              style={{ background: 'none', border: 'none', color: 'var(--gold-accent)', textDecoration: 'underline', cursor: 'pointer', marginTop: '1rem', width: '100%' }}
              disabled={isLoading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className={styles.socialContainer} style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGoogleSignIn}
          >
            <img src="/google-icon.svg" alt="Google" className={styles.socialIcon} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}