"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-black/5 flex flex-col fixed inset-y-0 bg-[#FDFCFB] z-50">
        <div className="p-10 pb-12">
          <Link href="/" className="text-2xl font-serif tracking-tight text-black">ELEVATE</Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/30 mt-2">Management</p>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <AdminNavLink href="/admin" label="Overview" active={pathname === "/admin"} />
          <AdminNavLink href="/admin/products" label="Collections" active={pathname.startsWith("/admin/products")} />
          <AdminNavLink href="/admin/orders" label="Transactions" active={pathname.startsWith("/admin/orders")} />
          <AdminNavLink href="/admin/customers" label="Clients" active={pathname.startsWith("/admin/customers")} />
          <div className="pt-8 opacity-20">
             <div className="h-[1px] bg-black w-full" />
          </div>
          <AdminNavLink href="/admin/settings" label="System" active={pathname.startsWith("/admin/settings")} />
        </nav>

        <div className="p-10 border-t border-black/5 bg-white/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-serif uppercase tracking-widest">AD</div>
            <div>
              <p className="text-[11px] font-medium text-black uppercase tracking-wider">Administrator</p>
              <p className="text-[10px] text-black/30 mt-0.5">ELEVATE LUXE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        <header className="h-24 border-b border-black/5 flex items-center justify-between px-16 bg-white/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
             <h1 className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-medium">Real-time System Status: Active</h1>
          </div>
          <div className="flex items-center gap-8">
            <button className="text-[10px] uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all duration-500">Search Console</button>
            <div className="w-[1px] h-4 bg-black/10" />
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-[10px] uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all duration-500"
            >
              Log Out
            </button>
          </div>
        </header>
        <div className="p-16 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`group flex items-center px-4 py-3 text-[11px] uppercase tracking-[0.25em] transition-all duration-700 ease-out ${
        active ? "text-black bg-black/[0.02]" : "text-black/30 hover:text-black/60"
      }`}
    >
      <span className="relative">
        {label}
        <span className={`absolute -bottom-1 left-0 h-[1px] bg-black transition-all duration-700 ${active ? "w-full" : "w-0 group-hover:w-4"}`} />
      </span>
    </Link>
  );
}

