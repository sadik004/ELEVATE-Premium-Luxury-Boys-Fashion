"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function Cart() {
  const { items, total, removeItem, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payment");
    setPaymentStatus(status);

    if (status === "success") {
      clearCart();
    }
  }, [clearCart]);

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payment = await api.post("/payments/initiate", { items, total });
      window.location.assign(payment.gatewayUrl);
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Checkout failed.");
    }
  };

  const paymentMessage = {
    success: "Payment successful. Your order is confirmed.",
    failed: "Payment failed. Please try again.",
    cancelled: "Payment cancelled. Your cart is still here.",
  }[paymentStatus];

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.title}>Your Cart</h1>
      {paymentMessage && (
        <div className={`${styles.paymentStatus} ${styles[paymentStatus]}`}>
          {paymentMessage}
        </div>
      )}
      {items.length === 0 ? (
        <p className={styles.empty}>Your cart is elegantly empty.</p>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className={styles.itemPrice}>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.total}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
