"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("Password reset link sent to your email.");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send reset link");
      setSuccess("");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Reset Password</h1>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: '#44ff44', textAlign: 'center', marginBottom: '1.5rem' }}>{success}</p>}
        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
             <Link href="/login" style={{ color: 'var(--gold-accent)' }}>Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
