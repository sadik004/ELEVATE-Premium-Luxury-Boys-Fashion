"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Determine if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Setup Lenis only if reduced motion is not requested
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false, // Don't use smooth scroll on touch devices to save performance and feel native
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      // Sync GSAP ScrollTrigger with Lenis
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      gsap.ticker.remove(lenisRef.current?.raf);
    };
  }, []);

  return <>{children}</>;
}
