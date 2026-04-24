"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Note: `useAuthStore` was removed during our transition to NextAuth.
// We keep this page strictly to route successful OAuth logins from the legacy system
// or any legacy tokens if they exist, but normally NextAuth handles its own callbacks.

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // If the legacy token system hits this page, we'll try to save it manually
    if (token && typeof window !== 'undefined') {
      const storage = JSON.parse(localStorage.getItem('auth-storage') || '{"state":{}}');
      storage.state.token = token;
      localStorage.setItem('auth-storage', JSON.stringify(storage));
      router.push("/cart");
    } else {
      // In the new NextAuth system, successful authentication redirects natively,
      // so we just default to cart if they accidentally land here.
      router.push("/cart");
    }
  }, [token, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-luxury-black">
      <div className="w-full max-w-md bg-glass-bg border border-glass-border p-10 backdrop-blur-md rounded-sm shadow-2xl relative overflow-hidden flex flex-col items-center justify-center gap-6">

        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-luxury-gold opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-luxury-gold opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-luxury-gold opacity-50"></div>

        <h1 className="text-3xl font-serif text-luxury-gold mb-2 text-center">Authenticating</h1>
        <Loader2 className="animate-spin text-luxury-gold" size={48} />
        <p className="text-center text-text-secondary text-sm uppercase tracking-widest mt-2">
          Please wait...
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-luxury-black">
        <Loader2 className="animate-spin text-luxury-gold" size={32} />
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}
