"use client";

import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Cart() {
  const { items, total, removeItem, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Create the order
      const orderResponse = await api.post("/orders", { items, total });
      const order = orderResponse.data;

      // 2. Initiate payment with the new order ID
      const paymentResponse = await api.post("/payment/initiate", {
        order_id: order.id,
        total_amount: total
      });

      // Clear cart locally since order is placed
      clearCart();

      // 3. Redirect to SSLCommerz Gateway
      const gatewayUrl = paymentResponse.data.GatewayPageURL;
      if (gatewayUrl) {
        window.location.href = gatewayUrl;
      } else {
        alert("Payment gateway URL not found.");
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Checkout failed.");
    }
  };

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.title}>Your Cart</h1>
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
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
