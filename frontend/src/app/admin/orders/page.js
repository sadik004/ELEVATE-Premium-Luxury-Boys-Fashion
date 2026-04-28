"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would require an admin-protected route in the backend
    // For now, we'll simulate or fetch if public (unlikely)
    async function fetchOrders() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`);
        // If it's 401/403, we show the loading state or a custom message
        if (res.ok) {
           const data = await res.json();
           setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-black">Transactions</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/30 mt-2">Oversee all client acquisitions and fulfillment</p>
        </div>
        <div className="flex gap-4">
            <button className="px-6 py-2 border border-black/10 text-[9px] uppercase tracking-[0.2em] text-black/40 hover:text-black hover:border-black/30 transition-all duration-500">
                Export Ledger
            </button>
        </div>
      </div>

      <div className="border border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Reference</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Client</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Value</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Status</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">Date</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-[10px] uppercase tracking-widest text-black/20">Syncing Ledger...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-20 text-center space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-black/20">No transactions recorded.</p>
                    <p className="text-[9px] text-black/10 italic">Waiting for first acquisition.</p>
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={order.id} 
                  className="border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors group"
                >
                  <td className="p-6 text-[11px] font-medium text-black/40">#ORD-{order.id.toString().padStart(4, '0')}</td>
                  <td className="p-6">
                    <p className="text-[11px] font-medium text-black">User ID: {order.userId}</p>
                  </td>
                  <td className="p-6 text-[11px] text-black/60 font-medium">${order.total.toFixed(2)}</td>
                  <td className="p-6">
                     <span className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                         order.status === 'PAID' ? 'bg-green-50 text-green-700/70 border border-green-200/50' : 
                         'bg-orange-50 text-orange-700/70 border border-orange-200/50'
                     }`}>
                        {order.status}
                     </span>
                  </td>
                  <td className="p-6 text-[11px] text-black/30">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] uppercase tracking-widest text-black/20 hover:text-black transition-colors">Manifest</button>
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
