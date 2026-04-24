"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";

const ThreeHeroScene = dynamic(() => import("@/components/ThreeHeroScene"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const bentoRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    // Hero Text Animation
    if (heroTextRef.current) {
      gsap.fromTo(
        heroTextRef.current.children,
        { opacity: 0, y: 30, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.3, duration: 2, ease: "power3.out", delay: 0.5 }
      );
    }

    // Sticky Bar ScrollTrigger
    ScrollTrigger.create({
      start: "top -800px",
      onEnter: () => setShowStickyBar(true),
      onLeaveBack: () => setShowStickyBar(false),
    });

    // Editorial Commerce Reveal Animation
    if (editorialRef.current) {
      const items = editorialRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: editorialRef.current,
            start: "top 85%",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-luxury-black text-white selection:bg-luxury-gold selection:text-black overflow-hidden">
      
      {/* Global Noise Texture Overlay */}
      <div className="fixed inset-0 z-[50] bg-noise pointer-events-none mix-blend-overlay"></div>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {/* Background 3D Scene (Disabled on Mobile for Performance) */}
        {!isMobile && <ThreeHeroScene />}
        
        {/* Fallback Image / Mobile Background */}
        <div className="absolute inset-0 z-0">
           <Image
             src="https://images.unsplash.com/photo-1594938298596-033285741630?q=80&w=2940&auto=format&fit=crop"
             alt="Luxury Fashion Hero Background"
             fill
             priority
             className={`object-cover ${isMobile ? 'opacity-40' : 'opacity-20'} transition-opacity duration-1000`}
             sizes="100vw"
             placeholder="blur"
             blurDataURL="data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoQAAwAAQAcJaQAA3AA/v3QgAA="
           />
           <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black"></div>
        </div>

        <div ref={heroTextRef} className="relative z-10 text-center flex flex-col items-center max-w-5xl px-4">
          <p className="text-luxury-gold tracking-[0.4em] uppercase text-xs md:text-sm mb-6 opacity-0">Fall / Winter 2026</p>
          <h1 className="text-6xl md:text-[9rem] font-serif text-white mb-6 font-thin tracking-[-0.02em] leading-none opacity-0">
            ELEVATE
          </h1>
          <p className="text-lg md:text-2xl font-light tracking-[0.2em] mb-16 text-gray-300 max-w-2xl opacity-0">
            The Pinnacle of Boys' Luxury Fashion.
          </p>
          <div className="opacity-0">
            <MagneticButton href="/shop" className="px-12 py-5 border border-luxury-gold/50 bg-white/5 backdrop-blur-md text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all duration-700">
              <span className="tracking-[0.2em] text-sm uppercase">Discover Collection</span>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Editorial Commerce Showcase (Hybrid Layout) */}
      <section className="py-32 px-4 md:px-12 max-w-[2000px] mx-auto relative z-20 bg-luxury-black">
        <div className="flex flex-col items-center mb-24">
          <span className="text-luxury-gold tracking-widest uppercase text-xs mb-4">Curated Elegance</span>
          <h2 className="text-4xl md:text-6xl font-serif font-thin tracking-wide">The Signature Edit</h2>
        </div>

        <div ref={editorialRef} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 auto-rows-[400px] md:auto-rows-[600px]">
          
          {/* Row 1: 2 Products */}
          <div className="group md:col-span-5 relative overflow-hidden bg-zinc-900 flex items-end p-8 border border-white/5 cursor-pointer">
            <Image
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e5?q=80&w=1000&auto=format&fit=crop"
              alt="Tailoring"
              fill
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-70 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="relative z-10 w-full flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-serif mb-1">Tailored Velvet Tuxedo</h3>
                <p className="text-luxury-gold text-sm tracking-widest">$1,250</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                <span className="text-xs">+</span>
              </div>
            </div>
          </div>

          <div className="group md:col-span-7 relative overflow-hidden bg-zinc-900 flex items-end p-8 border border-white/5 cursor-pointer">
             <Image
              src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop"
              alt="Outerwear"
              fill
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-70 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="relative z-10 w-full flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-serif mb-1">Cashmere Overcoat</h3>
                <p className="text-luxury-gold text-sm tracking-widest">$2,100</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                <span className="text-xs">+</span>
              </div>
            </div>
          </div>

          {/* Row 2: 1 Large Banner (Editorial Break) */}
          <div className="group md:col-span-12 relative overflow-hidden bg-black flex items-center justify-center border border-white/5 cursor-pointer h-[500px] md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1550614000-4b95f22fcc22?q=80&w=2000&auto=format&fit=crop"
              alt="Editorial Video"
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-50"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-1000"></div>
            <div className="relative z-10 flex flex-col items-center">
               <span className="text-white/70 font-sans text-xs tracking-[0.3em] mb-6 uppercase">Campaign Film</span>
               <div className="w-20 h-20 rounded-full border border-luxury-gold flex items-center justify-center backdrop-blur-md group-hover:bg-luxury-gold group-hover:text-black transition-all duration-500 group-hover:scale-110">
                 <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-1"></div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sticky Add to Bag Bar */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 py-4 px-6 md:px-12 z-40 flex justify-between items-center transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="hidden md:block">
          <span className="font-serif text-xl text-white">Elevate Signature Collection</span>
          <p className="text-xs tracking-widest text-luxury-gold mt-1 uppercase">Available Now</p>
        </div>
        <Link href="/shop" className="w-full md:w-auto text-center bg-white text-black px-8 py-3 text-sm tracking-[0.15em] uppercase font-medium hover:bg-luxury-gold hover:text-black transition-colors duration-300">
          Shop The Look
        </Link>
      </div>

    </div>
  );
}
