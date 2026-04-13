"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import styles from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

function HeroModel() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
}

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" },
    );
  }, []);

  return (
    <div className={styles.home}>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContent}>
          <h1>ELEVATE</h1>
          <p>The Pinnacle of Boys' Luxury Fashion.</p>
          <a href="/shop" className={styles.ctaBtn}>
            Explore Collection
          </a>
        </div>
        <div className={styles.canvasContainer}>
          <Canvas>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <HeroModel />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} autoRotate />
          </Canvas>
        </div>
      </section>
      <section className={styles.featured}>
        <h2>Curated Elegance</h2>
        <div className={styles.grid}>
          <div className={styles.card}>Suits & Tuxedos</div>
          <div className={styles.card}>Outerwear</div>
          <div className={styles.card}>Accessories</div>
        </div>
      </section>
    </div>
  );
}
