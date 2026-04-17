"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function Orders() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await api.get("/orders");
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, mounted, router]);

  if (!mounted || loading) {
    return <div className={styles.container}><h1 className={styles.title}>Loading Orders...</h1></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order History</h1>
      {orders.length === 0 ? (
        <p className={styles.empty}>You have no order history.</p>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className={styles.date}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className={styles.orderStatus}>
                  <span className={styles.statusBadge}>{order.status}</span>
                </div>
              </div>
              <div className={styles.itemsList}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.product?.name || "Product"}</span>
                      <span className={styles.itemQty}>x{item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.orderTotal}>
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
