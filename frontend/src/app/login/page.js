"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/cart",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setMessage("Check your email for the magic link!");
        setEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/cart" });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Sign In</h1>
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.successMessage} style={{ color: 'var(--gold-accent)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Sending..." : "Sign in with Email"}
          </button>
        </form>

        <div className={styles.socialContainer}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGoogleSignIn}
          >
            <img src="/google-icon.svg" alt="Google" className={styles.socialIcon} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
