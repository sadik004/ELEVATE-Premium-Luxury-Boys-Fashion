"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import styles from "./Header.module.css";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const { token, user, logout } = useAuthStore();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">ELEVATE</Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/shop">Collection</Link>
        <Link href="/about">Heritage</Link>
      </nav>
      <div className={styles.actions}>
        {token ? (
          <>
            <span className={styles.greeting}>
              Welcome, {user?.name || "Guest"}
            </span>
            <button onClick={logout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Sign In</Link>
        )}
        <Link href="/cart" className={styles.cartLink}>
          Cart ({itemCount})
        </Link>
      </div>
    </header>
  );
}
