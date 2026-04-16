"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import styles from "./Header.module.css";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const { token, user, logout } = useAuthStore();
  const router = useRouter();

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
          <div className={styles.dropdown}>
            <button className={styles.profileBtn}>
              {user?.name || "Profile"} ▼
            </button>
            <div className={styles.dropdownMenu}>
              <Link href="/profile" className={styles.dropdownItem}>
                Profile
              </Link>
              <Link href="/orders" className={styles.dropdownItem}>
                Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className={styles.dropdownItem}
              >
                Logout
              </button>
            </div>
          </div>
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
