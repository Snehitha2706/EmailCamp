"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { 
      icon: TrendingUp, 
      label: "Engagement Vector", 
      val: loading ? "Syncing..." : `Avg Open Rate: ${data?.openRate || '0.0%'}` 
    },
    { 
      icon: PieChart, 
      label: "Audience Coverage", 
      val: loading ? "Mapping..." : `${(data?.contacts || 0).toLocaleString()} Contacts Registered` 
    },
    { 
      icon: BarChart3, 
      label: "Relay Volume", 
      val: loading ? "Quantifying..." : `${(data?.sends || 0).toLocaleString()} Total Transmission Records` 
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Analytics Core</h1>
          <p className="text-slate-400 text-sm">Deep-spectrum visibility into your channel performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ icon: Icon, label, val }, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border border-card-border rounded-2xl flex flex-col gap-4 bg-slate-900/20"
          >
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Icon className="h-4 w-4 text-emerald-500/50" />
              {label}
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden relative">
              <div className={`absolute inset-0 bg-emerald-500/40 ${loading ? 'w-1/3 animate-pulse' : 'w-full'}`} />
            </div>
            <span className="text-xs font-mono text-emerald-500/70 tracking-wide uppercase">{val}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="aspect-[16/7] glass-panel rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 gap-2 italic text-sm">
        <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-2">
           <BarChart3 className="h-4 w-4 opacity-50" />
        </div>
        Primary Data Matrix Offline. Deploy campaigns to initiate telemetry feed.
      </div>
    </div>
  );
}
