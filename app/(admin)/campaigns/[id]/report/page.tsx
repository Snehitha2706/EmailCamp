"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BarChart3, Eye, Mail, 
  ShieldAlert, Users, Calendar, Clock, 
  TrendingUp, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/campaigns/${resolvedParams.id}/report`);
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
    fetchReport();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm font-mono tracking-widest">HYDRATING ANALYTICS MATRIX...</span>
      </div>
    );
  }

  if (!data?.campaign) {
    return (
      <div className="p-8 text-center text-slate-500">
        Campaign node trace missing from active registry.
      </div>
    );
  }

  const statsRow = [
    { label: "Absolute Reach", val: data.stats.sends, icon: Users, color: "blue" },
    { label: "Engagement (Opens)", val: data.stats.opens, icon: Eye, color: "emerald" },
    { label: "Open Velocity", val: data.stats.openRate, icon: TrendingUp, color: "purple" },
    { label: "Opt-Out Vector", val: data.stats.unsubscribes, icon: ShieldAlert, color: "red" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Navigation Bar */}
      <button 
        onClick={() => router.push('/campaigns')}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Dispatch Terminal
      </button>

      {/* Header Definition */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
             {data.campaign.name}
             <span className="text-xs uppercase font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md tracking-wider">
               {data.campaign.status}
             </span>
          </h1>
          <p className="text-slate-400 text-lg">"{data.campaign.subject}"</p>
        </div>
        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-500">Binding Asset</span>
            <span className="text-sm font-bold text-slate-200">{data.campaign.template?.name || 'No Template'}</span>
          </div>
        </div>
      </div>

      {/* Numerical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsRow.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className={`absolute right-0 top-0 h-24 w-24 bg-${item.color}-500/5 blur-3xl rounded-full pointer-events-none`} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{item.label}</span>
              <item.icon className={`h-4 w-4 text-${item.color}-500/50`} />
            </div>
            <span className="text-4xl font-bold tracking-tight text-white">{item.val}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Visual Timeline Stubs */}
        <div className="lg:col-span-2 glass-panel p-6 min-h-[300px] flex flex-col justify-center items-center border-dashed border-slate-800 text-slate-600">
           <BarChart3 className="h-10 w-10 opacity-20 mb-4" />
           <p className="text-sm italic">Geospatial density distribution initializing...</p>
        </div>

        {/* Real-Time Interaction Feed */}
        <div className="glass-panel flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-white/[0.02] flex items-center gap-2 font-bold text-slate-200 text-sm">
             <Clock className="h-4 w-4 text-emerald-500" /> Real-Time Stream
          </div>
          <div className="p-4 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
            {(!data.stream || data.stream.length === 0) ? (
              <div className="text-xs text-slate-600 italic py-8 text-center">No signals recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {data.stream.map((evt: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                    <div className={`mt-1 h-2 w-2 rounded-full ${evt.eventType === 'open' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                       <p className="text-xs text-slate-300 font-medium truncate">{evt.contact?.email}</p>
                       <p className="text-[10px] text-slate-500 mt-0.5 capitalize flex items-center gap-1">
                         Executed <span className="text-slate-400 font-bold">{evt.eventType}</span> 
                         • {new Date(evt.occurredAt).toLocaleTimeString()}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `}</style>
    </div>
  );
}
