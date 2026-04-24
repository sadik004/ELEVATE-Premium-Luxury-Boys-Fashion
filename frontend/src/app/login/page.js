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
  const [isDelayed, setIsDelayed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setIsDelayed(false);

    // Promise race: 5-second timeout vs NextAuth signIn
    // This implements our graceful UX fallback if QStash/Resend are hanging
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    try {
      const result = await Promise.race([
        signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/cart",
        }),
        timeout
      ]);

      if (result?.error) {
        setError(result.error);
      } else {
        setMessage("Check your email for the magic link!");
        setEmail("");
      }
    } catch (err) {
      if (err.message === "Timeout") {
        setIsDelayed(true);
        setError("Email delivery is currently delayed due to high traffic.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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

        {/* Graceful UX Fallback Banner */}
        {isDelayed && (
          <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #ff4444', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem' }}>
            Email delivery is currently delayed. Please use Google to sign in instantly.
          </div>
        )}

        {error && !isDelayed && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.successMessage} style={{ color: 'var(--gold-accent)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</p>}

        {/* Hide email form if degraded */}
        {!isDelayed && (
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
        )}

        <div className={styles.socialContainer} style={{ marginTop: isDelayed ? '0' : '1.5rem' }}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGoogleSignIn}
            style={isDelayed ? { borderColor: 'var(--gold-accent)', background: 'rgba(212, 175, 55, 0.1)' } : {}}
          >
            <img src="/google-icon.svg" alt="Google" className={styles.socialIcon} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}