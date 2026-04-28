"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MagneticButton({ children, className = "", onClick, href }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Disable magnetic effect on touch devices
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(hover: none)").matches) {
      return;
    }

    const button = buttonRef.current;
    
    const moveEvent = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      gsap.to(button, {
        x: x * 0.3, // Pull strength
        y: y * 0.3,
        duration: 0.8,
        ease: "power3.out"
      });
    };

    const leaveEvent = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
    };

    button.addEventListener("mousemove", moveEvent);
    button.addEventListener("mouseleave", leaveEvent);

    return () => {
      button.removeEventListener("mousemove", moveEvent);
      button.removeEventListener("mouseleave", leaveEvent);
    };
  }, []);

  const baseClasses = `relative inline-flex items-center justify-center overflow-hidden cursor-pointer ${className}`;

  if (href) {
    return (
      <a href={href} ref={buttonRef} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button ref={buttonRef} onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
}
