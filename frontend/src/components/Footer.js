import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-luxury-black border-t border-glass-border text-gray-400 py-16 px-8 mt-20 relative z-10">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="flex-1">
          <h2 className="text-3xl font-serif text-luxury-gold mb-4 uppercase tracking-widest font-light">ELEVATE</h2>
          <p className="font-light tracking-wide text-sm max-w-sm">The Pinnacle of Boys' Luxury Fashion.</p>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <h3 className="text-luxury-gold font-serif text-lg">Explore</h3>
            <Link href="/shop" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Collection</Link>
            <Link href="/about" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Heritage</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-luxury-gold font-serif text-lg">Client Services</h3>
            <Link href="#" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Contact Us</Link>
            <Link href="#" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Shipping & Returns</Link>
            <Link href="#" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Size Guide</Link>
          </div>
          <div className="flex flex-col space-y-4 col-span-2 md:col-span-1">
            <h3 className="text-luxury-gold font-serif text-lg">Legal</h3>
            <Link href="#" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Privacy Policy</Link>
            <Link href="#" className="hover:text-luxury-gold transition-colors text-sm uppercase tracking-wider">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="max-w-[2000px] mx-auto mt-16 pt-8 border-t border-glass-border text-xs text-center uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} ELEVATE. All rights reserved.</p>
      </div>
    </footer>
  );
}
