"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const registerToast = toast.loading("Setting up your account...");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, purpose: "signup" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      toast.success(data.message || "Verification code sent!", { id: registerToast });
      router.push(`/verify-email?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
    } catch (err) {
      toast.error(err.message, { id: registerToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = () => {
    signIn("google", { callbackUrl: "/cart" });
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
          <h1 className="text-4xl font-serif text-luxury-gold mb-2">Join Elevate</h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest">
            Create your premium account
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-sans focus:outline-none focus:border-luxury-gold transition-colors"
              required
              disabled={isLoading}
            />
          </div>

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

    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Register</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
         main

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full p-4 bg-luxury-gold text-luxury-black font-semibold uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Send Verification Code"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-glass-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-secondary text-xs uppercase tracking-widest">
              Or
            </span>
            <div className="flex-grow border-t border-glass-border"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleOAuthSignIn}
              className="w-full flex items-center justify-center gap-3 p-4 border border-glass-border bg-transparent text-white font-sans hover:bg-white/5 hover:border-luxury-gold transition-colors"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-luxury-gold hover:underline underline-offset-4 transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
