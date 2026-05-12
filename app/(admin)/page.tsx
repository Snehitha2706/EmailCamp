"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowUpRight,
  Send,
  MousePointerClick,
  Eye,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as any }
  })
};

export default function Dashboard() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const stats = [
    { 
      label: 'Total Contacts', 
      value: loading ? '...' : (data?.contacts || 0).toLocaleString(), 
      icon: Users, 
      change: '+0%', 
      color: 'emerald' 
    },
    { 
      label: 'Physical Dispatches', 
      value: loading ? '...' : (data?.sends || 0).toLocaleString(), 
      icon: Send, 
      change: '+0%', 
      color: 'blue' 
    },
    { 
      label: 'Avg. Open Rate', 
      value: loading ? '...' : (data?.openRate || '0.0%'), 
      icon: Eye, 
      change: '+0%', 
      color: 'purple' 
    },
    { 
      label: 'Bounce Limit', 
      value: '0.0%', 
      icon: MousePointerClick, 
      change: 'SAFE', 
      color: 'amber' 
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Core Console</h1>
        <p className="text-slate-400 text-sm">Aggregating physical signals from your local node repository.</p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="glass-panel glass-panel-hover p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.change} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 lg:col-span-2 space-y-6 min-h-[350px] flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Campaign Metrics</h3>
              <p className="text-slate-400 text-xs">Live monitoring over the last 30 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded bg-white/5 border border-white/10 hover:bg-white/10 transition">Day</button>
              <button className="px-3 py-1 text-xs rounded bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20">Month</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 pt-4">
            {[40, 70, 45, 90, 65, 85, 30, 60, 75, 55, 95, 70, 80, 45, 60, 50, 75, 85, 90].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: 0.5 + (i * 0.02), ease: "easeOut" }}
                className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500/80 rounded-t-sm relative group cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                  {h}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 space-y-6"
        >
          <h3 className="font-semibold text-lg">Live Stream Monitor</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-xs text-slate-500 animate-pulse">Synchronizing nodes...</div>
            ) : (!data?.recentStreams || data?.recentStreams.length === 0) ? (
              <div className="text-xs italic text-slate-600 py-4">No recent propagation activities detected.</div>
            ) : data.recentStreams.map((act: any, i: number) => {
              const s = act.status.toLowerCase();
              const pct = s === 'sent' ? 100 : (s === 'sending' ? 65 : 15);
              
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300 truncate pr-2">{act.name}</span>
                    <span className={pct === 100 ? 'text-emerald-400 text-xs' : 'text-blue-400 text-xs animate-pulse uppercase tracking-wider font-mono font-bold'}>
                      {s}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${pct === 100 ? 'from-emerald-500 to-teal-400' : 'from-blue-500 to-indigo-400'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
