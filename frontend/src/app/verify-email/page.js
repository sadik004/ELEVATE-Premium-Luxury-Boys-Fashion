"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      toast.success("New code sent! Check your email.", { id: resendToast });
    } catch (err) {
      toast.error(err.message, { id: resendToast });
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
          <h1 className="text-4xl font-serif text-luxury-gold mb-2">Verify Account</h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest mt-4 leading-relaxed">
            We sent a 6-digit security code to<br/>
            <span className="text-white font-medium lowercase tracking-normal">{email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <KeyRound size={14} /> Security Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors text-center text-2xl tracking-[0.75em]"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Account"}
            {!isLoading && <ArrowRight size={18} />}
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