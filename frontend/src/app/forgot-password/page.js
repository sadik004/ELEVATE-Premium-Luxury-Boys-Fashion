"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    const resetToast = toast.loading("Sending recovery code...");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "recovery" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send recovery code");
      }

      toast.success(data.message || "Recovery code sent to your email.", { id: resetToast });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.message, { id: resetToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Reset Password</h1>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: '#44ff44', textAlign: 'center', marginBottom: '1.5rem' }}>{success}</p>}
        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
             <Link href="/login" style={{ color: 'var(--gold-accent)' }}>Back to Login</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Send Code"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-xs text-luxury-gold hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
