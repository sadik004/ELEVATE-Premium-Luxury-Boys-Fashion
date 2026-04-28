"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDot = useRef(null);
  const cursorOutline = useRef(null);

  useEffect(() => {
    // Disable custom cursor on touch devices / small screens
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(hover: none)").matches) {
      return;
    }

    const dot = cursorDot.current;
    const outline = cursorOutline.current;

    // Set initial position
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(outline, { xPercent: -50, yPercent: -50 });

    const onMouseMove = (e) => {
      // Dot follows immediately
      gsap.to(dot, {
        duration: 0.1,
        x: e.clientX,
        y: e.clientY,
        ease: "power2.out",
      });

      // Outline follows with a slight delay
      gsap.to(outline, {
        duration: 0.5,
        x: e.clientX,
        y: e.clientY,
        ease: "power3.out",
      });
    };

    const onMouseEnter = () => {
      gsap.to(outline, { scale: 1.5, opacity: 0.8, backgroundColor: "rgba(197, 179, 88, 0.1)", borderColor: "rgba(197, 179, 88, 0.5)", duration: 0.4, ease: "back.out(1.5)" });
      gsap.to(dot, { scale: 0.5, backgroundColor: "#C5B358", duration: 0.3 });
    };

    const onMouseLeave = () => {
      gsap.to(outline, { scale: 1, opacity: 1, backgroundColor: "transparent", borderColor: "rgba(51, 51, 51, 0.2)", duration: 0.4, ease: "power2.out" });
      gsap.to(dot, { scale: 1, backgroundColor: "#333333", duration: 0.3 });
    };

    window.addEventListener("mousemove", onMouseMove);

    // Add hover effects to clickable elements
    const clickables = document.querySelectorAll("a, button, [role='button'], input, select, textarea");
    clickables.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clickables.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorDot}
        className="fixed top-0 left-0 w-2 h-2 bg-luxury-charcoal rounded-full pointer-events-none z-[9999] hidden md:block shadow-sm"
      />
      <div
        ref={cursorOutline}
        className="fixed top-0 left-0 w-10 h-10 border border-luxury-charcoal/20 rounded-full pointer-events-none z-[9998] transition-colors hidden md:block backdrop-blur-[1px]"
      />
    </>
  );
}
