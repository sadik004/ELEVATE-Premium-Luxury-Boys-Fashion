"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";
import styles from "./page.module.css";

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await api.get(`/products/${unwrappedParams.id}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [unwrappedParams.id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!product) return <div className={styles.loading}>Product not found.</div>;

  return (
    <div className={styles.detailContainer}>
      <div className={styles.imageSection}>
        <div className={styles.imagePlaceholder}>
          {product.image ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
              alt={product.name}
              className={styles.detailImage}
            />
          ) : (
            <span>Product Image</span>
          )}
        </div>
      </div>
      <div className={styles.infoSection}>
        <h4 className={styles.category}>{product.category?.name}</h4>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <p className={styles.description}>{product.description}</p>
        <button className={styles.addBtn} onClick={() => addItem(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
