"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/imageUrl";
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
        console.error("Failed to load products", error);
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
              href={`/product/${product.id}`}
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.imagePlaceholder}>
                {product.image ? (
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span>View Detail</span>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
