"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Trash2, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SuppressionPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/suppression?query=${encodeURIComponent(query)}`);
      if (res.ok) setEntries(await res.json());
    } catch (e) {
      toast.error("Query sync deficit.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadEntries(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!manualEmail) return;
    setCreating(true);
    try {
      const res = await fetch('/api/settings/suppression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: manualEmail, reason: 'manual' })
      });
      if (res.ok) {
        toast.success("Identity suppressed.");
        setManualEmail('');
        loadEntries();
      } else {
        const err = await res.json();
        toast.error(err.error || "Insertion rupture.");
      }
    } catch (e) {
      toast.error("Protocol breach.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permit full propagation to this identity? This manually overrides safety containment.")) return;
    try {
      const res = await fetch(`/api/settings/suppression?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Containment breached; identity cleared.");
        loadEntries();
      } else {
        toast.error("Erasure blocked.");
      }
    } catch (e) {
      toast.error("System error.");
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Suppression Grid</h1>
            <p className="text-slate-500 text-sm">Autonomous delivery exclusion matrices enforced by policy.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel flex items-center gap-3 px-4 py-2.5 border border-white/5">
            <Search className="h-4 w-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Locate specific identification string..."
              className="bg-transparent border-none outline-none text-sm text-slate-300 w-full focus:ring-0"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {loading && <RefreshCw className="h-3 w-3 text-slate-500 animate-spin" />}
          </div>

          <div className="glass-panel overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Banned Vector</th>
                    <th className="px-6 py-4 font-medium">Reason Code</th>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && entries.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500 animate-pulse">Syncing restriction database...</td></tr>
                  ) : entries.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-600 italic font-mono text-xs">Safety zone established: 0 identities trapped.</td></tr>
                  ) : entries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-white/[0.01] transition group">
                      <td className="px-6 py-4 font-mono text-slate-200">{entry.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          entry.reason === 'bounced' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          entry.reason === 'complaint' || entry.reason === 'complained' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {entry.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {new Date(entry.suppressedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 text-slate-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition"
                          title="Unsuppress Identity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Manual Ingestion */}
        <div className="space-y-6">
          <div className="glass-panel border border-rose-500/20 bg-rose-500/[0.02] p-6">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-widest mb-4">
              <AlertCircle className="h-4 w-4" />
              Force Containment
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Manually blacklist a destination vector. Direct transmission physics will immediately truncate attempts targeting this ID.
            </p>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                type="email" 
                required
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                placeholder="dest@domain.com"
                className="w-full bg-black/30 border border-white/10 focus:border-rose-500/40 rounded-xl p-3 text-sm text-white focus:outline-none transition font-mono"
              />
              <button 
                disabled={creating || !manualEmail}
                className="w-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Authorize Lockdown
              </button>
            </form>
          </div>
          
          <div className="text-xs text-slate-600 border border-dashed border-white/10 p-4 rounded-xl leading-loose italic">
            Notice: Automated suppression ingestion operates 24/7 via AWS SNS triggers listening on inbound bounce/complaint telemetry. Manual cleanup retains strict logs.
          </div>
        </div>

      </div>
    </div>
  );
}
