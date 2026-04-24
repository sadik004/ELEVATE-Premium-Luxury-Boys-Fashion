"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../login/page.module.css";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess("Password has been reset successfully.");
      setError("");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setSuccess("");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>New Password</h1>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: '#44ff44', textAlign: 'center', marginBottom: '1.5rem' }}>{success}</p>}
        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
             <Link href="/login" style={{ color: 'var(--gold-accent)' }}>Go to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
