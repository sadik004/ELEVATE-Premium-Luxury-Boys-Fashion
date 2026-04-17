"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/cart");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Sign In</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>

        <div className={styles.socialContainer}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`}
          >
            <img src="/google-icon.svg" alt="Google" className={styles.socialIcon} />
            Continue with Google
          </button>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook`}
          >
            <img src="/facebook-icon.svg" alt="Facebook" className={styles.socialIcon} />
            Continue with Facebook
          </button>
        </div>

        <p className={styles.linkText}>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
