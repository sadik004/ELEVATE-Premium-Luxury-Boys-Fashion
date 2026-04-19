"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const bentoRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    // Hero Animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" },
    );

    // Sticky Bar ScrollTrigger
    ScrollTrigger.create({
      start: "top -500px",
      onEnter: () => setShowStickyBar(true),
      onLeaveBack: () => setShowStickyBar(false),
    });

    // Bento Grid Scrollytelling Animation
    if (bentoRef.current) {
      const bentoItems = bentoRef.current.children;
      gsap.fromTo(
        bentoItems,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bentoRef.current,
            start: "top 80%",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-luxury-black text-white selection:bg-luxury-gold selection:text-black">

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Video / Image (Optimized Next Image as fallback) */}
        <div className="absolute inset-0 z-0">
           <Image
             src="https://images.unsplash.com/photo-1594938298596-033285741630?q=80&w=2940&auto=format&fit=crop"
             alt="Luxury Fashion Hero Background"
             fill
             priority
             className="object-cover opacity-60"
             sizes="100vw"
           />
           <div className="absolute inset-0 bg-luxury-black/30 backdrop-blur-[2px]"></div>
        </div>

        <div ref={heroRef} className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-7xl md:text-9xl font-serif text-luxury-gold mb-6 drop-shadow-2xl font-light tracking-tight">ELEVATE</h1>
          <p className="text-xl md:text-2xl font-light tracking-[0.2em] mb-12 text-gray-200">The Pinnacle of Boys' Luxury Fashion.</p>
          <a
            href="/shop"
            className="group relative px-10 py-4 overflow-hidden border border-luxury-gold/50 bg-luxury-black/50 backdrop-blur-md text-luxury-gold transition-all duration-500 hover:bg-luxury-gold hover:text-black"
          >
            <span className="relative z-10 tracking-[0.15em] text-sm uppercase">Explore Collection</span>
          </a>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section className="py-32 px-4 md:px-12 max-w-[2000px] mx-auto">
        <h2 className="text-4xl md:text-6xl text-center mb-20 font-serif font-light tracking-wide">Curated Elegance</h2>

        <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
          {/* Main Feature - 2x2 */}
          <div className="group md:col-span-2 md:row-span-2 relative overflow-hidden bg-zinc-900 flex items-end p-8 cursor-pointer border border-glass-border">
            <Image
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e5?q=80&w=2000&auto=format&fit=crop"
              alt="Suits & Tuxedos"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="relative z-10 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
              <h3 className="text-3xl font-serif mb-2">Suits & Tuxedos</h3>
              <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Impeccable tailoring for the modern gentleman.</p>
            </div>
          </div>

          {/* Secondary 1 */}
          <div className="group relative overflow-hidden bg-zinc-900 flex items-end p-6 cursor-pointer border border-glass-border">
             <Image
              src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop"
              alt="Outerwear"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <h3 className="relative z-10 text-2xl font-serif">Outerwear</h3>
          </div>

          {/* Secondary 2 */}
          <div className="group relative overflow-hidden bg-zinc-900 flex items-end p-6 cursor-pointer border border-glass-border">
             <Image
              src="https://images.unsplash.com/photo-1601233749202-95d04d5b3c00?q=80&w=1000&auto=format&fit=crop"
              alt="Accessories"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <h3 className="relative z-10 text-2xl font-serif">Accessories</h3>
          </div>

           {/* Promotional Video / Editorial Placeholder */}
           <div className="group md:col-span-2 relative overflow-hidden bg-black flex items-center justify-center p-6 cursor-pointer border border-glass-border">
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
               <span className="text-luxury-gold/50 font-serif text-lg tracking-widest">EDITORIAL VIDEO PRESENTATION</span>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1550614000-4b95f22fcc22?q=80&w=1000&auto=format&fit=crop"
              alt="Editorial"
              fill
              className="object-cover transition-all duration-1000 group-hover:blur-sm opacity-40 group-hover:opacity-20"
            />
            <div className="relative z-10 w-16 h-16 rounded-full border border-luxury-gold flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
               <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-luxury-gold border-b-[8px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Add to Bag Bar */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-glass-border py-4 px-6 md:px-12 z-40 flex justify-between items-center transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="hidden md:block">
          <span className="font-serif text-xl text-luxury-gold">Elevate Signature Collection</span>
          <p className="text-xs tracking-widest text-gray-400 mt-1 uppercase">Available Now</p>
        </div>
        <Link href="/shop" className="w-full md:w-auto text-center bg-luxury-gold text-black px-8 py-3 text-sm tracking-[0.15em] uppercase font-medium hover:bg-white transition-colors duration-300">
          Discover More
        </Link>
      </div>

      {/* Placeholders for AR / AI Stylist */}
      <div className="fixed bottom-24 right-6 flex flex-col space-y-4 z-40">
        <button className="w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-md border border-luxury-gold/30 flex items-center justify-center shadow-lg hover:border-luxury-gold hover:scale-105 transition-all group" title="AR Virtual Try-On">
          <span className="text-luxury-gold text-xs font-serif group-hover:animate-pulse">AR</span>
        </button>
        <button className="w-14 h-14 rounded-full bg-luxury-gold text-black flex items-center justify-center shadow-lg shadow-luxury-gold/20 hover:scale-105 transition-all group" title="AI Stylist">
          <span className="text-xl font-serif">✨</span>
        </button>
      </div>

    </div>
  );
}
