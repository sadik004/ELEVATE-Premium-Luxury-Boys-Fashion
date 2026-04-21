import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full border border-[#D4AF37] p-10 text-center rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] bg-black/40 backdrop-blur-md">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-6 tracking-wide">
          Payment Successful
        </h1>
        <p className="text-gray-300 mb-10 font-light leading-relaxed">
          Thank you for your purchase. Your elegant order has been securely processed and is now being prepared for you.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all duration-300 font-medium tracking-widest uppercase text-sm"
        >
          Return to Shop
        </Link>
      </div>
    </div>
  );
}
