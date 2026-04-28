"use client";

import { useAuthStore } from "@/lib/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !token) {
      router.push("/login");
    }
  }, [token, mounted, router]);

  if (!mounted || !user) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h1 className={styles.title}>My Profile</h1>
        <div className={styles.infoGroup}>
          <span className={styles.label}>Name</span>
          <div className={styles.value}>{user.name}</div>
        </div>
        <div className={styles.infoGroup}>
          <span className={styles.label}>Email</span>
          <div className={styles.value}>{user.email}</div>
        </div>
        <div className={styles.infoGroup}>
          <span className={styles.label}>Member Since</span>
          <div className={styles.value}>{joinDate}</div>
        </div>
      </div>
    </div>
  );
}
