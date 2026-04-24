"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

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

      toast.success("OTP Sent! Check your email.");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    const verifyToast = toast.loading("Verifying code...");

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        toast.error(result.error, { id: verifyToast });
      } else {
        toast.success("Login successful!", { id: verifyToast });
        window.location.href = result?.url || "/cart";
      }
    } catch (err) {
      toast.error("An unexpected error occurred.", { id: verifyToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/cart" });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-luxury-black">
      <div className="w-full max-w-md bg-glass-bg border border-glass-border p-10 backdrop-blur-md rounded-sm shadow-2xl relative overflow-hidden">

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-luxury-gold opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-luxury-gold opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-luxury-gold mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest">Access your premium account</p>
        </div>

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
              disabled={isLoading}
              className="text-xs text-luxury-gold hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4"
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-glass-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-secondary text-xs uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-glass-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 p-4 border border-glass-border bg-transparent text-white font-sans hover:bg-white/5 hover:border-luxury-gold transition-colors"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account? <Link href="/register" className="text-luxury-gold hover:underline underline-offset-4 transition-all">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
