import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h2>ELEVATE</h2>
          <p>The Pinnacle of Boys' Luxury Fashion.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.column}>
            <h3>Explore</h3>
            <Link href="/shop">Collection</Link>
            <Link href="/about">Heritage</Link>
          </div>
          <div className={styles.column}>
            <h3>Client Services</h3>
            <Link href="#">Contact Us</Link>
            <Link href="#">Shipping & Returns</Link>
            <Link href="#">Size Guide</Link>
          </div>
          <div className={styles.column}>
            <h3>Legal</h3>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} ELEVATE. All rights reserved.</p>
      </div>
    </footer>
  );
}
