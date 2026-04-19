"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isHome = pathname === "/";

  return (
    <header className={`z-[100] flex items-center justify-between px-8 py-6 w-full transition-all duration-300 ${
      isHome
        ? "absolute top-0 left-0 bg-gradient-to-b from-black/80 to-transparent text-white"
        : "sticky top-0 bg-luxury-black border-b border-white/10 text-white"
    }`}>
      <div className="flex items-center">
        <Link href="/" className="font-playfair text-3xl tracking-[0.3em] font-bold text-luxury-gold">
          ELEVATE
        </Link>
      </div>
      <nav className="hidden md:flex space-x-12 text-sm tracking-widest uppercase relative group">
        <div className="group/mega py-4">
          <Link href="/shop" className="hover:text-luxury-gold transition-colors">Collection</Link>
          {/* Mega Menu Dropdown */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-screen max-w-4xl bg-luxury-black border border-white/10 shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 z-50 p-8 grid grid-cols-3 gap-8">
            <div>
              <h3 className="font-playfair text-luxury-gold mb-4 border-b border-white/10 pb-2">Ready to Wear</h3>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Outerwear</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Suits & Tailoring</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Knitwear</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Shirts</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-playfair text-luxury-gold mb-4 border-b border-white/10 pb-2">Accessories</h3>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Leather Goods</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Shoes</Link></li>
                <li><Link href="/shop" className="hover:text-luxury-gold transition-colors text-white/70">Ties & Pocket Squares</Link></li>
              </ul>
            </div>
            <div className="bg-white/5 p-4 flex flex-col items-center justify-center text-center">
              <span className="font-playfair text-xl mb-2 text-luxury-gold">New Arrivals</span>
              <p className="text-xs text-white/70 mb-4 normal-case">Discover the Fall/Winter 2026 Collection.</p>
              <Link href="/shop" className="border border-luxury-gold text-luxury-gold px-4 py-2 hover:bg-luxury-gold hover:text-black transition-colors text-xs">
                Explore
              </Link>
            </div>
          </div>
        </div>
        <div className="py-4">
          <Link href="/about" className="hover:text-luxury-gold transition-colors">Heritage</Link>
        </div>
      </nav>
      <div className="flex items-center space-x-6 text-sm tracking-widest uppercase">
        {token ? (
          <div className="relative group">
            <button className="flex items-center gap-2 hover:text-luxury-gold transition-colors uppercase">
              {user?.name || "Account"} ▼
            </button>
            <div className="absolute right-0 top-full mt-4 w-48 bg-luxury-black border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50">
              <Link href="/profile" className="px-6 py-3 text-left hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors">
                Profile
              </Link>
              <Link href="/orders" className="px-6 py-3 text-left hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors">
                Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="px-6 py-3 text-left hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors uppercase"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="hover:text-luxury-gold transition-colors">Sign In</Link>
        )}
        <Link href="/cart" className="text-luxury-gold hover:text-white transition-colors">
          Bag ({itemCount})
        </Link>
      </div>
    </header>
  );
}
