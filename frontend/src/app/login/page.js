"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import LoginBackground from "@/components/LoginBackground";
import { Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIntensity, setTypingIntensity] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    // Deep cinematic entrance
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, filter: "blur(20px)", scale: 1.05 },
      { opacity: 1, filter: "blur(0px)", scale: 1, duration: 2.5, ease: "power4.out" }
    );
  }, []);

  const handleMouseMove = (e) => {
    // Smooth cursor follow
    gsap.to(".cursor-glow", {
      x: e.clientX,
      y: e.clientY,
      duration: 1.5,
      ease: "power3.out",
    });
  };

  const handleTyping = (val, setter) => {
    setter(val);
    setIsTyping(true);
    setTypingIntensity(1); // Spike the Three.js intensity
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    setTypingTimeout(
      setTimeout(() => {
        setIsTyping(false);
        setTypingIntensity(0); // Fade out Three.js intensity
      }, 800)
    );
  };

  const checkUser = async (email) => {
    if (!email.includes("@")) {
      setUserData(null);
      return;
    }
    try {
      const res = await fetch("/api/auth/check-user", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        setUserData(data.user);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) throw new Error(result.error);

      // Ultra-cinematic exit
      gsap.to(containerRef.current, {
        scale: 1.5,
        opacity: 0,
        filter: "blur(30px)",
        duration: 1.8,
        ease: "power4.inOut",
        onComplete: () => {
          window.location.href = result?.url || "/cart";
        }
      });
    } catch (error) {
      toast.error(error.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <main 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full flex items-center justify-center bg-[#030303] overflow-hidden selection:bg-white selection:text-black font-sans"
    >
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Insane 3D Fluid Particle Wave */}
        <div className="absolute inset-0 opacity-60">
          <LoginBackground intensity={typingIntensity} />
        </div>
        
        {/* Massive Ambient Glow */}
        <motion.div 
          animate={{
            scale: isTyping ? 1.2 : 1,
            opacity: isTyping ? 0.3 : 0.1,
            rotate: isTyping ? 5 : 0
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600 rounded-full blur-[160px] pointer-events-none mix-blend-screen"
        />

        {/* Cursor tracking light */}
        <div className="cursor-glow absolute top-0 left-0 w-[400px] h-[400px] bg-luxury-gold/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          <div className="h-24 flex items-end justify-center mb-6">
            <AnimatePresence mode="wait">
              {userData?.image ? (
                <motion.img 
                  key="avatar"
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  src={userData.image} 
                  alt="User" 
                  className="w-20 h-20 rounded-full border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] object-cover" 
                />
              ) : (
                <motion.div 
                  key="brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-10 h-10 border border-white/20 rotate-45 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-white mb-3 text-center">
            {userData ? `Welcome back, ${userData.name.split(' ')[0]}` : "Continue to workspace"}
          </h1>
          <p className="text-[#888] text-sm mb-12 tracking-[0.2em] uppercase text-center font-medium">
            Authenticate with your credentials
          </p>

          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
            <div className="w-full relative group">
              <motion.div 
                animate={{ 
                  boxShadow: isTyping ? "0 0 60px rgba(212,175,55,0.05)" : "0 0 0px rgba(212,175,55,0)",
                  borderColor: isTyping ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"
                }}
                className="relative w-full rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden transition-colors duration-500"
              >
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    handleTyping(e.target.value, setIdentifier);
                    checkUser(e.target.value);
                  }}
                  placeholder="Email or Phone"
                  className="w-full bg-transparent px-8 py-4 text-lg text-center text-white focus:outline-none placeholder:text-white/20 font-light tracking-wide"
                  autoFocus
                  disabled={isLoading}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>

            <div className="w-full relative group">
              <motion.div 
                animate={{ 
                  boxShadow: isTyping ? "0 0 60px rgba(212,175,55,0.05)" : "0 0 0px rgba(212,175,55,0)",
                  borderColor: isTyping ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"
                }}
                className="relative w-full rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden transition-colors duration-500"
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleTyping(e.target.value, setPassword)}
                  placeholder="Password"
                  className="w-full bg-transparent px-8 py-4 text-lg text-center text-white focus:outline-none placeholder:text-white/20 font-light tracking-wide"
                  disabled={isLoading}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>

            <div className="flex justify-between items-center px-2">
              <button 
                type="button"
                onClick={() => window.location.href = '/forgot-password'}
                className="text-[10px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
              <button 
                type="button"
                onClick={() => window.location.href = '/register'}
                className="text-[10px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Create Account
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-4 bg-white text-black rounded-2xl font-medium uppercase tracking-[0.2em] text-xs hover:bg-luxury-gold transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Authenticating
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 flex flex-col items-center justify-center w-full"
        >
          <button 
            onClick={() => signIn("google", { callbackUrl: "/cart" })}
            className="group flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-[0.2em] hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-white/20"
          >
            <svg className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.5em] text-white/20 uppercase pointer-events-none">
        Elevate • Secure Access
      </div>
    </main>
  );
}
