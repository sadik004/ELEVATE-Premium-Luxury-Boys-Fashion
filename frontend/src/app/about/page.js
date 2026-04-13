"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      textRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
        },
      },
    );
  }, []);

  return (
    <div className={styles.aboutContainer} ref={containerRef}>
      <h1 className={styles.title}>The ELEVATE Heritage</h1>
      <div className={styles.content} ref={textRef}>
        <p>
          Founded on the principle that luxury knows no age, ELEVATE redefines
          boys' fashion. We source the finest materials from heritage mills
          across Europe, ensuring each piece reflects uncompromised quality and
          timeless elegance.
        </p>
        <p>
          From classic tuxedos to refined casual wear, our collections are
          meticulously tailored to inspire confidence and sophistication in the
          next generation of gentlemen.
        </p>
      </div>
    </div>
  );
}
