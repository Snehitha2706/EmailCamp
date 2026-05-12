"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Clock, Plus, CheckCircle2, Trash2, Server, Terminal, X, Loader2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomationPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    triggerType: 'CONTACT_CREATED',
    actionTemplateId: ''
  });

  async function loadCoreData() {
    setLoading(true);
    try {
      const [autoRes, tempRes] = await Promise.all([
        fetch('/api/automations'),
        fetch('/api/templates')
      ]);
      if (autoRes.ok) setAutomations(await autoRes.json());
      if (tempRes.ok) setTemplates(await tempRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCoreData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.actionTemplateId) return toast.error("Specify distinct action output template.");
    
    setSaving(true);
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Automation Construct Online.");
        setIsWizardOpen(false);
        setFormData({ name: '', triggerType: 'CONTACT_CREATED', actionTemplateId: '' });
        loadCoreData();
      }
    } catch(e) {
      toast.error("Signal failure.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <RefreshCw className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Automation Hub</h1>
            <p className="text-slate-500 text-sm">Orchestrate real-time behavioural triggers and iterative dispatch trees.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition shadow-lg shadow-emerald-600/20 active:scale-95 text-sm"
        >
          <Plus className="h-4 w-4" />
          Engage Sequence
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass-panel animate-pulse border border-white/5" />
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-24 glass-panel border border-dashed border-white/10 rounded-3xl flex flex-col items-center">
          <Server className="h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-slate-200 font-bold text-lg">Logical Engine Stagnant</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-2">Initiate your first behavioral chain. For example, automatically spooling a Welcome Sequence when a unique user registers.</p>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="mt-6 text-emerald-400 font-mono text-xs tracking-widest uppercase border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-lg hover:bg-emerald-500/10 transition"
          >
            [ INITIALIZE_SEQ_01 ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {automations.map((auto) => (
            <motion.div 
              key={auto.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 relative group overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white font-mono">{auto.totalRuns}</div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Fired Events</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{auto.name}</h3>
              
              <div className="mt-6 space-y-2 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 border-l border-dashed border-slate-800" />
                
                <div className="flex items-center gap-3 text-xs relative z-10">
                  <div className="h-3.5 w-3.5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">Trigger: {auto.triggerType}</span>
                </div>

                <div className="flex items-center gap-3 text-xs relative z-10">
                  <div className="h-3.5 w-3.5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  </div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">Dispatch: {auto.template?.name || 'Template'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Creation Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0f0f11] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white tracking-wide uppercase text-sm">Configure Sequence</h2>
                </div>
                <button onClick={() => setIsWizardOpen(false)} className="text-slate-500 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Internal Directive Alias</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. 'Welcome Drip - New Recruits'"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-3 w-3 text-amber-400" /> 
                      System Ingress
                    </label>
                    <select 
                      value={formData.triggerType}
                      onChange={e => setFormData({...formData, triggerType: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
                    >
                      <option value="CONTACT_CREATED">User Ingested</option>
                      {/* Future hooks can easily drop in here */}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Server className="h-3 w-3 text-blue-400" />
                      Action Target
                    </label>
                    <select 
                      required
                      value={formData.actionTemplateId}
                      onChange={e => setFormData({...formData, actionTemplateId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
                    >
                      <option value="">Select Asset...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Validation Logic: Immediately upon <strong className="text-emerald-300">System Ingest</strong>, the internal relay will capture the identity, resolve the Template payload, and inject it directly into the <strong className="text-emerald-300">AWS SQS spooler</strong>.
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saving || !formData.name || !formData.actionTemplateId}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Server className="h-5 w-5" />}
                  Engage Core Logic
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
