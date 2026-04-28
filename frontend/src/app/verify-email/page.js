"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [signupData, setSignupData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("signup_data");
    if (data) {
      setSignupData(JSON.parse(data));
    }
  }, []);

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      toast.error("Email address is missing. Please restart sign-up.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    if (!signupData) {
      toast.error("Registration data not found. Please register again.");
      router.push("/register");
      return;
    }

    setIsLoading(true);
    const verifyToast = toast.loading("Verifying and creating your account...");

    try {
      // 1. Call Register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...signupData,
          otp
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Account verified! Signing you in...", { id: verifyToast });

      // 2. Automatically sign in
      const result = await signIn("credentials", {
        identifier: signupData.email,
        password: signupData.password,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        toast.error("Account created, but sign-in failed. Please login manually.");
        router.push("/login");
      } else {
        sessionStorage.removeItem("signup_data");
        window.location.href = result?.url || "/cart";
      }
    } catch (err) {
      toast.error(err.message, { id: verifyToast });
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
        body: JSON.stringify({ email, purpose: "signup" }),
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
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-luxury-black">
      <div className="w-full max-w-md bg-glass-bg border border-glass-border p-10 backdrop-blur-md rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-luxury-gold opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-luxury-gold opacity-50"></div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/20">
              <ShieldCheck className="text-luxury-gold" size={24} />
            </div>
          </div>
          <h1 className="text-3xl font-serif text-luxury-gold mb-2">Verify Email</h1>
          <p className="text-text-secondary text-xs uppercase tracking-widest leading-relaxed">
            We've sent a 6-digit code to <br/>
            <span className="text-white lowercase tracking-normal text-sm font-medium">{email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(val);
                if (val.length === 6) {
                  // Auto-submit if needed, but manual is safer for feedback
                }
              }}
              placeholder="0 0 0 0 0 0"
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-luxury-gold transition-colors"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Account"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
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
          <button
            onClick={() => router.push("/register")}
            className="text-[10px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Go Back
          </button>
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