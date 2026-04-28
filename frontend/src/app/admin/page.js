"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-16">
      {/* Welcome Header */}
      <section>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[10px] uppercase tracking-[0.5em] text-black/30 mb-4"
        >
          Executive Summary
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl font-serif text-black leading-tight"
        >
          Morning, Administrator. <br />
          <span className="text-black/20 italic">The house is performing well.</span>
        </motion.h2>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <StatWidget label="Total Revenue" value="$124,500.00" change="+12.4%" />
        <StatWidget label="Total Orders" value="1,240" change="+8.1%" />
        <StatWidget label="Average Value" value="$420.00" change="-2.4%" />
        <StatWidget label="Active Clients" value="892" change="+15.0%" />
      </section>

      {/* Tables/Activity Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between border-b border-black/5 pb-6">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-medium text-black">Recent Transactions</h3>
              <button className="text-[9px] uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors">View All</button>
           </div>
           <div className="space-y-4">
              <TransactionRow id="#ORD-9021" client="Alexander Thorne" amount="$890.00" status="Processing" date="Just Now" />
              <TransactionRow id="#ORD-9020" client="Julian Vane" amount="$1,240.00" status="Shipped" date="2 hours ago" />
              <TransactionRow id="#ORD-9019" client="Marcus Reed" amount="$450.00" status="Delivered" date="5 hours ago" />
              <TransactionRow id="#ORD-9018" client="Sebastian Cole" amount="$2,100.00" status="Processing" date="Yesterday" />
           </div>
        </div>

        <div className="space-y-8">
           <div className="border-b border-black/5 pb-6">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-medium text-black">Top Collections</h3>
           </div>
           <div className="space-y-8">
              <CollectionProgress label="Suits & Tuxedos" value={85} />
              <CollectionProgress label="Outerwear" value={62} />
              <CollectionProgress label="Accessories" value={45} />
              <CollectionProgress label="Footwear" value={30} />
           </div>
        </div>
      </section>
    </div>
  );
}

function StatWidget({ label, value, change }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="space-y-4 group cursor-default"
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 group-hover:text-black/60 transition-colors duration-500">{label}</p>
      <div className="flex items-baseline gap-4">
        <h4 className="text-3xl font-serif text-black">{value}</h4>
        <span className={`text-[10px] font-medium ${change.startsWith('+') ? 'text-green-500/60' : 'text-red-500/60'}`}>{change}</span>
      </div>
      <div className="h-[1px] bg-black/5 w-full relative overflow-hidden">
         <div className="absolute inset-0 bg-black/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      </div>
    </motion.div>
  );
}

function TransactionRow({ id, client, amount, status, date }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors px-2 -mx-2 rounded-lg group">
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-medium text-black/20 group-hover:text-black/40 transition-colors">{id}</span>
        <div>
          <p className="text-[11px] font-medium text-black">{client}</p>
          <p className="text-[9px] text-black/30 uppercase tracking-widest mt-0.5">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-12 text-right">
        <div>
          <p className="text-[11px] font-medium text-black">{amount}</p>
          <p className="text-[9px] text-black/30 uppercase tracking-widest mt-0.5">{status}</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-black/10 group-hover:bg-black/30 transition-colors" />
      </div>
    </div>
  );
}

function CollectionProgress({ label, value }) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 group-hover:text-black transition-colors">{label}</span>
        <span className="text-[10px] text-black/20">{value}%</span>
      </div>
      <div className="h-[2px] bg-black/5 w-full">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-black/40 group-hover:bg-black transition-colors"
        />
      </div>
    </div>
  );
}
