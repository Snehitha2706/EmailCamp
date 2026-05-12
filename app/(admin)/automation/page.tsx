"use client";

import { motion } from 'framer-motion';
import { RefreshCw, Zap, Clock } from 'lucide-react';

export default function AutomationPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
          <RefreshCw className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Automation Nodes</h1>
          <p className="text-slate-400 text-sm">Orchestrate low-latency behavioral communication sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        {[
          { icon: Zap, t: "Trigger-Based Sequences", d: "Respond instantly to system events." },
          { icon: Clock, t: "Scheduled Drips", d: "Maintain persistent temporal engagement." }
        ].map(({ icon: Icon, t, d }, i) => (
          <motion.div
            key={i}
            className="glass-panel p-8 border border-card-border rounded-3xl bg-gradient-to-br from-slate-900/40 to-slate-950 flex flex-col items-start gap-4 group"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t}</h3>
            <p className="text-slate-400 text-sm mb-4">{d}</p>
            <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-300 font-medium hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-all">
              Initiate Construct
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
