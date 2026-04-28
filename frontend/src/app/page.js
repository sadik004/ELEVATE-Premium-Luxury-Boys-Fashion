"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const bentoRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    // 1. Ultra-clean Hero Fade In
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1.5, ease: "power2.out", delay: 0.2 }
      );
    }

    // 2. Barely noticeable, very slow rotation for the Hero Product
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        rotation: 3,
        yoyo: true,
        repeat: -1,
        duration: 10,
        ease: "sine.inOut"
      });
    }

    // 3. Smooth Scroll Reveal for Bento Grid
    if (bentoRef.current) {
      gsap.fromTo(
        bentoRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: bentoRef.current, start: "top 85%" }
        }
      );
    }

    // 4. Smooth Scroll Reveal for Products Grid
    if (productsRef.current) {
      gsap.fromTo(
        productsRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: productsRef.current, start: "top 85%" }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-luxury-pearl text-luxury-charcoal selection:bg-[#E8E2D6] selection:text-luxury-charcoal font-sans font-light overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center z-10 pt-20 px-6">
        
        {/* Floating Product Image */}
        <div className="relative w-full max-w-2xl aspect-square mb-[-10vh] md:mb-[-15vh] z-0 flex items-center justify-center pointer-events-none">
          <div ref={heroImageRef} className="relative w-[80%] h-[80%] drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <Image
              src="/luxury_hero_perfume_1777055528778.png"
              alt="Iconic Luxury Product"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Minimal Text Content */}
        <div ref={heroRef} className="relative z-10 text-center flex flex-col items-center w-full max-w-4xl px-4 pointer-events-none">
          <p className="text-luxury-charcoal/40 tracking-[0.4em] uppercase text-[10px] mb-4 font-medium">The Absolute Standard</p>
          <h1 className="text-6xl md:text-[8rem] font-serif text-luxury-charcoal mb-4 font-thin tracking-tight leading-none">
            ELEVATE
          </h1>
          <p className="text-base md:text-lg font-light tracking-widest mb-10 text-luxury-charcoal/60 max-w-xl">
            Pure luxury. Stripped of excess.
          </p>
          <div className="pointer-events-auto">
            <MagneticButton href="#collection" className="px-14 py-4 bg-transparent border border-luxury-charcoal/20 text-luxury-charcoal hover:bg-luxury-charcoal hover:text-luxury-pearl transition-colors duration-500 rounded-full group">
              <span className="tracking-[0.2em] text-[10px] uppercase font-medium">Explore Form</span>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 2. THE BENTO GRID (Editorial Style) */}
      <section id="collection" className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto relative z-20">
        <div className="flex flex-col items-center mb-24 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-thin text-luxury-charcoal">The Form Element</h2>
          <p className="text-luxury-charcoal/50 tracking-[0.2em] text-[11px] uppercase mt-4 font-medium max-w-md mx-auto leading-relaxed">
            Every thread, every glass curve, meticulously engineered to float seamlessly in your world.
          </p>
        </div>

        <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[500px]">
          
          {/* Main Card: Editorial Lifestyle */}
          <Link href="/shop/suit" className="md:col-span-8 relative group rounded-2xl overflow-hidden bg-white/40 shadow-sm hover:shadow-md transition-all duration-700 border border-luxury-charcoal/5 cursor-pointer block">
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-12">
              <div className="relative w-full h-full bg-[#FAFAFA] rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-[1.5s] ease-out group-hover:scale-[1.02]">
                <Image
                  src="/luxury_suit_1777054761858.png"
                  alt="Tailored Suit"
                  fill
                  className="object-contain mix-blend-darken p-12"
                />
              </div>
            </div>
            <div className="absolute top-8 left-8 z-10 transition-transform duration-[1s] group-hover:translate-x-1">
              <h3 className="text-2xl font-serif text-luxury-charcoal mb-1">The Cashmere Silhouette</h3>
              <p className="text-luxury-charcoal/50 font-light text-xs tracking-widest uppercase">Weightless structure</p>
            </div>
          </Link>

          {/* Secondary Card: Essential */}
          <Link href="/shop/perfume" className="md:col-span-4 relative group rounded-2xl overflow-hidden bg-white/40 shadow-sm hover:shadow-md transition-all duration-700 border border-luxury-charcoal/5 cursor-pointer block">
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8">
              <div className="relative w-full h-full bg-[#FDFCF8] rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-[1.5s] ease-out group-hover:scale-[1.02]">
                <Image
                  src="/luxury_perfume_1777054743842.png"
                  alt="Luxury Fragrance"
                  fill
                  className="object-contain mix-blend-darken p-8"
                />
              </div>
            </div>
            <div className="absolute top-8 left-8 z-10 transition-transform duration-[1s] group-hover:translate-x-1">
              <h3 className="text-xl font-serif text-luxury-charcoal mb-1">L'Air Elegance</h3>
              <p className="text-luxury-charcoal/50 font-light text-xs tracking-widest uppercase">The invisible aura</p>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto relative z-20">
        <div className="w-full h-[1px] bg-luxury-charcoal/5 mb-20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-thin text-luxury-charcoal">The Essentials</h2>
          <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] font-medium text-luxury-charcoal/60 hover:text-luxury-charcoal transition-colors pb-1 border-b border-luxury-charcoal/20 hover:border-luxury-charcoal mt-6 md:mt-0">
            View All Objects
          </Link>
        </div>

        <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Product 1 */}
          <Link href="/shop/shoe" className="group cursor-pointer block">
            <div className="w-full aspect-[4/3] rounded-2xl bg-white/50 shadow-sm hover:shadow-md transition-all duration-700 border border-luxury-charcoal/5 flex items-center justify-center mb-6 overflow-hidden p-12">
               <div className="relative w-full h-full transition-transform duration-[1.5s] ease-out group-hover:scale-[1.02]">
                 <Image
                    src="/luxury_shoe_1777054714213.png"
                    alt="Oxford Shoe"
                    fill
                    className="object-contain mix-blend-darken drop-shadow-md"
                 />
               </div>
            </div>
            <div className="flex justify-between items-baseline px-2 transition-transform duration-[1s] group-hover:translate-x-1">
              <div>
                <h4 className="text-lg font-serif text-luxury-charcoal mb-1">The Onyx Oxford</h4>
                <p className="text-luxury-charcoal/50 text-xs font-light tracking-wide">Italian Calfskin</p>
              </div>
              <span className="text-luxury-charcoal font-light tracking-wide text-sm">$850</span>
            </div>
          </Link>

          {/* Product 2 */}
          <Link href="/shop/watch" className="group cursor-pointer block">
            <div className="w-full aspect-[4/3] rounded-2xl bg-white/50 shadow-sm hover:shadow-md transition-all duration-700 border border-luxury-charcoal/5 flex items-center justify-center mb-6 overflow-hidden p-12">
               <div className="relative w-full h-full transition-transform duration-[1.5s] ease-out group-hover:scale-[1.02]">
                 <Image
                    src="/luxury_watch_1777054730387.png"
                    alt="Luxury Watch"
                    fill
                    className="object-contain mix-blend-darken drop-shadow-md"
                 />
               </div>
            </div>
            <div className="flex justify-between items-baseline px-2 transition-transform duration-[1s] group-hover:translate-x-1">
              <div>
                <h4 className="text-lg font-serif text-luxury-charcoal mb-1">The Zenith Chronograph</h4>
                <p className="text-luxury-charcoal/50 text-xs font-light tracking-wide">Swiss Movement</p>
              </div>
              <span className="text-luxury-charcoal font-light tracking-wide text-sm">$12,400</span>
            </div>
          </Link>

        </div>
      </section>

      {/* 4. BRAND STORY CLOSER */}
      <section className="py-40 text-center max-w-3xl mx-auto px-6">
        <div className="w-[1px] h-24 bg-luxury-charcoal/10 mx-auto mb-16"></div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-luxury-charcoal/40 font-medium mb-10">Design Philosophy</p>
        <h2 className="text-3xl md:text-5xl font-serif font-thin text-luxury-charcoal leading-tight mb-16">
          "True luxury is not loud. It is the perfect arrangement of space, material, and light."
        </h2>
        <div className="w-[1px] h-24 bg-luxury-charcoal/10 mx-auto"></div>
      </section>

    </div>
  );
}

