import Link from "next/link";

export default function PaymentFail() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full border border-red-900/50 p-10 text-center rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.1)] bg-black/40 backdrop-blur-md">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-6 tracking-wide">
          Payment Unsuccessful
        </h1>
        <p className="text-gray-300 mb-10 font-light leading-relaxed">
          We were unable to process your payment at this time, or the transaction was canceled. Please review your cart and try again.
        </p>
        <Link
          href="/cart"
          className="inline-block px-8 py-3 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all duration-300 font-medium tracking-widest uppercase text-sm"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
