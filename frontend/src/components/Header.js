"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const { token, user, logout } = useAuthStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isHome = pathname === "/";

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] flex items-center justify-between px-8 py-6 transition-all duration-500 ${
      scrolled
        ? "bg-luxury-pearl/80 backdrop-blur-md border-b border-luxury-charcoal/5 py-4 shadow-lg shadow-luxury-charcoal/5"
        : isHome ? "bg-transparent" : "bg-luxury-pearl border-b border-luxury-charcoal/5"
    }`}>
      <div className="flex items-center">
        <Link href="/" className="font-playfair text-3xl tracking-[0.3em] font-bold text-luxury-gold">
          ELEVATE
        </Link>
      </div>
      <nav className="hidden md:flex space-x-12 text-sm tracking-widest uppercase relative group">
        <div className="group/mega py-4">
          <Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors">Collection</Link>
          {/* Mega Menu Dropdown */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-screen max-w-4xl bg-luxury-ivory border border-luxury-charcoal/5 shadow-2xl shadow-luxury-charcoal/5 opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 z-50 p-8 grid grid-cols-3 gap-8 rounded-b-3xl">
            <div>
              <h3 className="font-playfair text-luxury-charcoal mb-4 border-b border-luxury-charcoal/10 pb-2">Ready to Wear</h3>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Outerwear</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Suits & Tailoring</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Knitwear</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Shirts</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-playfair text-luxury-charcoal mb-4 border-b border-luxury-charcoal/10 pb-2">Accessories</h3>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Leather Goods</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Shoes</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-charcoal/60 transition-colors text-luxury-charcoal/80">Ties & Pocket Squares</Link></li>
              </ul>
            </div>
            <div className="bg-luxury-beige/30 p-4 flex flex-col items-center justify-center text-center rounded-2xl">
              <span className="font-playfair text-xl mb-2 text-luxury-charcoal">New Arrivals</span>
              <p className="text-xs text-luxury-charcoal/70 mb-4 normal-case">Discover the Fall/Winter 2026 Collection.</p>
              <Link href="/shop" className="border border-luxury-charcoal text-luxury-charcoal px-4 py-2 hover:bg-luxury-charcoal hover:text-white transition-colors text-xs rounded-full">
                Explore
              </Link>
            </div>
          </div>
        </div>
        <div className="py-4">
          <Link href="/about" className="hover:text-luxury-charcoal/60 transition-colors">Heritage</Link>
        </div>
      </nav>
      <div className="flex items-center space-x-6 text-sm tracking-widest uppercase">
        {token ? (
          <div className="relative group">
            <button className="flex items-center gap-2 hover:text-luxury-charcoal/60 transition-colors uppercase">
              {user?.name || "Account"} ▼
            </button>
            <div className="absolute right-0 top-full mt-4 w-48 bg-luxury-ivory border border-luxury-charcoal/5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 rounded-2xl">
              <Link href="/profile" className="px-6 py-3 text-left hover:bg-luxury-beige/50 transition-colors">
                Profile
              </Link>
              <Link href="/orders" className="px-6 py-3 text-left hover:bg-luxury-beige/50 transition-colors">
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="px-6 py-3 text-left hover:bg-luxury-beige/50 transition-colors font-medium">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  signOut({ callbackUrl: "/" });
                }}
                className="px-6 py-3 text-left hover:bg-luxury-beige/50 transition-colors uppercase"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="hover:text-luxury-charcoal/60 transition-colors">Sign In</Link>
        )}
        <Link href="/cart" className="text-luxury-charcoal hover:text-luxury-charcoal/60 transition-colors">
          Bag ({itemCount})
        </Link>
      </div>
    </header>
  );
}
