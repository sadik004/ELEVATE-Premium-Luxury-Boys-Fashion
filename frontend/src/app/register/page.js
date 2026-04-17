"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/page.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Register</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          </div>
          <button type="submit" className={styles.submitBtn}>
            Create Account
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
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
