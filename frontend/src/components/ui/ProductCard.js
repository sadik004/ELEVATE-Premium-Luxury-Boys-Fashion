import Link from "next/link";
import Image from "next/image";
import { BASE_URL } from "@/lib/api";

export function ProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold-accent)]"
    >
      <div className="relative w-full h-[350px] bg-[#111] flex items-center justify-center text-[var(--text-secondary)] text-[0.9rem] tracking-[1px] overflow-hidden">
        <Image
          src={product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="text-[1.1rem] mb-2 text-[var(--text-primary)] font-[var(--font-inter)]">{product.name}</h3>
        <p className="text-[var(--text-secondary)] text-[0.9rem] mb-4 leading-[1.4] line-clamp-2 overflow-hidden">{product.description}</p>
        <p className="text-[var(--gold-accent)] font-semibold">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
