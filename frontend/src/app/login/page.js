"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Mail, KeyRound, Loader2, ArrowRight } from "lucide-react";

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
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Continue"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <KeyRound size={14} /> Security Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors text-center text-xl tracking-[0.5em]"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-text-secondary text-center mt-2">
                Sent to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Code"}
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
