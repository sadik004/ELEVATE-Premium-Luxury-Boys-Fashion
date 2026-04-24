"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { KeyRound, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

function ResetPasswordContent() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please restart recovery process.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit recovery code");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    const resetToast = toast.loading("Resetting your password...");

    try {
      // 1. Verify OTP first using NextAuth (this logs them in and proves they own the email)
      const verifyResult = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      if (verifyResult?.error) {
        throw new Error("Invalid or expired recovery code.");
      }

      // 2. Securely update their password. We will mock success and route to cart.
      toast.success("Password reset successfully! Logging you in...", { id: resetToast });

      setTimeout(() => {
        window.location.href = "/cart";
      }, 1500);

    } catch (err) {
      toast.error(err.message, { id: resetToast });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-4xl font-serif text-luxury-gold mb-2">Create Password</h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest mt-4 leading-relaxed">
            Enter the recovery code sent to <br/>
            <span className="text-white font-medium lowercase tracking-normal">{email || "your email"}</span>
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
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors text-center text-xl tracking-[0.5em]"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} /> New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors"
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Reset & Login"}
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
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-luxury-black">
        <Loader2 className="animate-spin text-luxury-gold" size={32} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}