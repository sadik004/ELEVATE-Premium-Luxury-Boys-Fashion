"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, BASE_URL } from "@/lib/api";
import styles from "./page.module.css";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.title}>The Collection</h1>
      {loading ? (
        <p className={styles.loading}>Loading elegance...</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.imagePlaceholder}>
                <Image
                  src={product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <p className={styles.price}>${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
