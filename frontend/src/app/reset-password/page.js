"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
 feat/otp-authentication-1622790782403589352
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";
 main

function ResetPasswordContent() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please restart recovery.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit recovery code");
      return;
    }

    setIsLoading(true);
    const resetToast = toast.loading("Recovering your account...");

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Access recovered. Welcome back.", { id: resetToast });
      window.location.href = result?.url || "/cart";
    } catch (error) {
      toast.error(error.message || "Invalid or expired recovery code.", { id: resetToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    feat/otp-authentication-1622790782403589352
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-luxury-black">
      <div className="w-full max-w-md bg-glass-bg border border-glass-border p-10 backdrop-blur-md rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-luxury-gold opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-luxury-gold opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-luxury-gold mb-2">Recover Access</h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest mt-4 leading-relaxed">
            Enter the recovery code sent to <br />
            <span className="text-white font-medium lowercase tracking-normal">
              {email || "your email"}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <KeyRound size={14} /> Recovery Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              maxLength={6}
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors text-center text-xl tracking-[0.5em]"
              required
              disabled={isLoading}
            />

    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>New Password</h1>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: '#44ff44', textAlign: 'center', marginBottom: '1.5rem' }}>{success}</p>}
        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
             <Link href="/login" style={{ color: 'var(--gold-accent)' }}>Go to Login</Link>
         main
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Recover & Login"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/forgot-password"
            className="text-xs text-luxury-gold hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4"
          >
            Need a new code?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-luxury-black">
          <Loader2 className="animate-spin text-luxury-gold" size={32} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
