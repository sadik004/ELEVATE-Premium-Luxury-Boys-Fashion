"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { api, BASE_URL } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await api.get(`/products/${unwrappedParams.slug}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [unwrappedParams.slug]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!product) return <div className={styles.loading}>Product not found.</div>;

  return (
    <div className={styles.detailContainer}>
      <div className={styles.imageSection}>
        <div className={styles.imagePlaceholder}>
          <Image
            src={product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
      <div className={styles.infoSection}>
        <h4 className={styles.category}>{product.category?.name}</h4>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <p className={styles.description}>{product.description}</p>
        <Button onClick={() => addItem(product)} className="w-max px-8">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
