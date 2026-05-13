"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Eye, 
  MousePointerClick, Ban, AlertOctagon, ShieldCheck 
} from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = [
    { 
      label: "Opens (M6)", 
      val: data?.openRate || '0.0%', 
      icon: Eye, 
      color: "emerald", 
      sub: "Global interaction metric" 
    },
    { 
      label: "Clicks (M6)", 
      val: data?.clickRate || '0.0%', 
      icon: MousePointerClick, 
      color: "blue", 
      sub: "Call-to-action CTR" 
    },
    { 
      label: "Bounces (M7)", 
      val: data?.bounceRate || '0.0%', 
      icon: Ban, 
      color: "amber", 
      sub: "Hard and soft delivery fails" 
    },
    { 
      label: "Complaints (M7)", 
      val: data?.complaintRate || '0.00%', 
      icon: AlertOctagon, 
      color: "rose", 
      sub: "Inbox spam flags" 
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Premium Compliance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/20 border border-card-border p-6 rounded-3xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Core (M9)</h1>
            <p className="text-slate-400 text-sm mt-0.5">Full spectrum delivery audit and tracking telemetry.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300 font-mono tracking-tight uppercase">RFC 8058 List-Unsub (M8) Active</span>
        </div>
      </div>

      {/* Core KPI Metric Grid (M6 & M7 Visualized) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-[0.02] text-white transition-opacity group-hover:opacity-[0.05]`}>
                <Icon className="h-20 w-20" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">{item.label}</span>
                <div className={`p-1.5 rounded-lg border bg-${item.color}-500/10 border-${item.color}-500/20 text-${item.color}-400`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-slate-100">
                  {loading ? <span className="animate-pulse text-slate-700">--.-</span> : item.val}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">{item.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Breakdown Grid (M9 Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Campaign Performance Ranking */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Top Broadcast Vectors
            </h3>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm font-mono animate-pulse">Aggregating vector performance metrics...</div>
            ) : !data?.topCampaigns || data.topCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-600 italic text-sm flex flex-col items-center gap-3">
                <BarChart3 className="h-10 w-10 opacity-20" />
                No dispatched payloads identified in active history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-slate-400 text-xs font-mono uppercase">
                      <th className="px-6 py-4 font-medium">Payload Name</th>
                      <th className="px-6 py-4 font-medium">Total Relayed</th>
                      <th className="px-6 py-4 font-medium text-right">Open Rate</th>
                      <th className="px-6 py-4 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {data.topCampaigns.map((camp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition">
                        <td className="px-6 py-4 font-semibold text-slate-200">{camp.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{camp.sends.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400 font-mono">{camp.openRate}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-400 font-mono">{camp.clickRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Volume Stats Matrix */}
        <div className="space-y-6 flex flex-col justify-start">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-4">
            <PieChart className="h-4 w-4 text-blue-400" /> Coverage Analytics
          </h3>
          
          <div className="glass-panel p-6 space-y-6 bg-slate-950/20 border border-card-border rounded-2xl">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Absolute Reach</span>
                <span className="text-slate-200">{loading ? "..." : (data?.contacts || 0).toLocaleString()}</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Total Relays Dispatched</span>
                <span className="text-slate-200">{loading ? "..." : (data?.sends || 0).toLocaleString()}</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-xs text-slate-600 leading-relaxed italic">
              Telemetry aggregate operates in near real-time. Interactive heatmaps generate automatically upon dispatch volume scaling thresholds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
