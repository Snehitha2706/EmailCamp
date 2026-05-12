"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Play, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock,
  PauseCircle,
  Loader2,
  Copy,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const router = useRouter();
  const { orgRole } = useAuth();
  const isViewer = orgRole === 'org:viewer';

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [testDest, setTestDest] = useState('');
  const [stats, setStats] = useState<any>({ activeSends: 0, sends: 0, openRate: '0.0%', clickRate: '0.0%' });

  async function loadStream() {
    setLoading(true);
    try {
      const [campRes, statRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/dashboard/stats')
      ]);
      
      if (campRes.ok) {
        const data = await campRes.json();
        if (Array.isArray(data)) setCampaigns(data);
      }

      if (statRes.ok) {
        const statData = await statRes.json();
        setStats(statData);
      }
    } catch (e) {
      console.error("Metrics linkage failure:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStream();
  }, []);

  const handleTriggerSend = async (id: string) => {
    if (!confirm("CONFIRM COMMAND: Execute physical campaign release sequence now? This will transmit live emails to all targets.")) return;
    
    setIsSending(true);
    const loadingToast = toast.loading("Ignition Sequence Initialized. Dispatched Payload Processing...");
    
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
      const resData = await res.json();
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        toast.success(`TRANSMISSION COMPLETE! Successfully processed targets.`, {
          description: `Delivered: ${resData.summary.delivered}, Failed: ${resData.summary.rejected}`
        });
        loadStream(); // Refresh list to reflect sent status!
      } else {
        toast.error(resData.error || "Blockade encountered during relay.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Critical signal fragmentation. Could not communicate with sender server.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        loadStream();
        toast.success("Template Replicated Successfully.");
      }
    } catch(e){}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ABSOLUTE PURGE WARNING: Committed deletions are non-reversible. Proceed?")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadStream();
        toast.success("Target Partition Cleared.");
      } else {
        toast.error("Purge Blocked.");
      }
    } catch(e){}
  };

  const handleQuickTest = async () => {
    if (!testDest || !testDest.includes('@')) return alert("Enter absolute destination address.");
    
    setIsSending(true);
    try {
      const res = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: testDest, 
          subject: "Direct Ecosystem Broadcast Success",
          content: "<h2>Operation Completed.</h2><p>Your physical platform is now 100% fully active and operational.</p>" 
        })
      });

      if (res.ok) {
        alert("🔥 ROCKET FIRED. Real physical email injected into AWS SES successfully.");
        setTestDest('');
        loadStream(); // Refresh to see the new log entry
      } else {
        const err = await res.json();
        alert(`Ecosystem Error: ${err.details || 'Check your verified sender setup.'}`);
      }
    } catch (err) {
      alert("Transmission failure across edge.");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Dispatch Terminal</h1>
          <p className="text-slate-400 text-sm">Initialize physical campaign releases and monitor pipeline flow.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          {!isViewer && (
            <>
              <button 
                onClick={() => window.location.assign('/campaigns/new')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 text-white flex items-center gap-2 text-sm font-bold transition transform hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </button>

              <div className="glass-panel rounded-xl p-1.5 flex items-center border border-card-border bg-slate-900/30 shadow-lg shadow-black/20">
                <input 
                  type="email" 
                  placeholder="Recipient for Test Dispatch..." 
                  value={testDest}
                  onChange={(e) => setTestDest(e.target.value)}
                  className="bg-transparent text-xs px-3 py-1.5 w-56 outline-none text-slate-200 placeholder:text-slate-600 font-medium"
                />
                <button 
                  onClick={handleQuickTest}
                  disabled={isSending}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                >
                  {isSending ? 'FIRING...' : 'LAUNCH TEST'}
                  <Play className="h-3 w-3 fill-current" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Fast Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Sends', val: stats.activeSends, color: 'blue' },
          { label: 'Delivered (30d)', val: stats.sends.toLocaleString(), color: 'emerald' },
          { label: 'Avg Open Rate', val: stats.openRate, color: 'purple' },
          { label: 'Click Velocity', val: stats.clickRate, color: 'cyan' }
        ].map((m, i) => (
          <div key={i} className="glass-panel px-5 py-4 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</span>
            <span className="text-2xl font-bold text-white">{m.val}</span>
          </div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="glass-panel overflow-hidden border border-card-border rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Campaign Details</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reach</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Engagement</th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Initializing visual stream...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No prior launches found in history.</td></tr>
              ) : campaigns.map((camp, i) => (
                <motion.tr 
                  key={camp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex gap-3">
                      <div className="p-2.5 h-fit rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 leading-tight">{camp.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{camp.subject || 'No Subject'}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1.5">
                          <Calendar className="h-3 w-3" />
                          Physical Sync
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <StatusBadge status={camp.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="font-medium text-slate-300">{camp._count?.sends || 0}</div>
                    <div className="text-xs text-slate-500">targets</div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">{camp._count?.events || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Hits</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {camp.status.toLowerCase() === 'draft' && !isViewer && (
                        <button 
                          onClick={() => handleTriggerSend(camp.id)}
                          disabled={isSending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          LAUNCH
                        </button>
                      )}
                      <button 
                        onClick={() => router.push(`/campaigns/${camp.id}/report`)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all flex items-center gap-1.5"
                      >
                        View
                      </button>

                      {!isViewer && (
                        <>
                          <button 
                            onClick={() => handleDuplicate(camp.id)}
                            title="Replicate Campaign"
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-center"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(camp.id)}
                            title="Purge Entity"
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'sent':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> Delivered</span>;
    case 'sending':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"><Play className="h-3 w-3" /> Dispatching</span>;
    case 'scheduled':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"><Clock className="h-3 w-3" /> Queued</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><PauseCircle className="h-3 w-3" /> Draft</span>;
  }
}
