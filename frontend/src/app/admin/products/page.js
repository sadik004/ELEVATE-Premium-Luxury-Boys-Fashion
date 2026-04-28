"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-black">Collections</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/30 mt-2">Manage your digital showroom inventory</p>
        </div>
        <button className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-black/80 transition-all duration-500">
          New Acquisition
        </button>
      </div>

      <div className="border border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Product</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Category</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Price</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Status</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-20 text-center text-[10px] uppercase tracking-widest text-black/20">Initializing Registry...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center text-[10px] uppercase tracking-widest text-black/20">No items found in collections.</td>
              </tr>
            ) : (
              products.map((product, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={product.id} 
                  className="border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-black/5 overflow-hidden rounded-sm">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-black">{product.name}</p>
                        <p className="text-[9px] text-black/30 mt-0.5 italic">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[11px] text-black/60 font-medium uppercase tracking-wider">{product.category?.name || 'Uncategorized'}</td>
                  <td className="p-6 text-[11px] text-black/60 font-medium">${product.price.toFixed(2)}</td>
                  <td className="p-6">
                     <span className="inline-block w-2 h-2 rounded-full bg-green-500/40 mr-2" />
                     <span className="text-[10px] uppercase tracking-widest text-black/40">In Stock</span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] uppercase tracking-widest text-black/20 hover:text-black transition-colors mr-6">Edit</button>
                    <button className="text-[10px] uppercase tracking-widest text-red-900/20 hover:text-red-900 transition-colors">Archive</button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
