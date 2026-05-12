"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Mail, 
  Users, Layout, Send, Loader2, Eye, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4;

export default function NewCampaignPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [lists, setLists] = useState<any[]>([]);

  // Physical Campaign Payload
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '',
    fromName: '',
    fromEmail: '',
    targetAll: true,
    targetListId: '',
    templateId: '',
    scheduledAt: '' // Mandatory Step 4 scheduling inclusion
  });

  // Step Validations
  const isStep1Valid = formData.name.trim().length > 0 && formData.subject.trim().length > 0;
  const isStep2Valid = formData.targetAll === true || formData.targetListId !== ''; 
  const isStep3Valid = formData.templateId !== '';

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error("Load failure:", e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadLists = async () => {
    try {
      const res = await fetch('/api/lists');
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (e) {
      console.error("List load error:", e);
    }
  };

  // Load Templates on Mount for the final step selection
  useEffect(() => {
    loadTemplates();
    loadLists();
  }, []);

  const handleFinalize = async () => {
    if (!isStep3Valid) return;
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Campaign Sequence Fully Instantiated!");
        router.push('/campaigns');
      } else {
        toast.error("Sequence Creation Vector Collapsed.");
      }
    } catch (err) {
      toast.error("Critical Transmission Failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Setup', icon: Mail },
    { id: 2, label: 'Audience', icon: Users },
    { id: 3, label: 'Design', icon: Layout },
    { id: 4, label: 'Review', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Navbar/Return */}
        <button 
          onClick={() => router.push('/campaigns')}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Abort Construction
        </button>

        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Construct Active Campaign</h1>
          <p className="text-slate-500 text-sm">Provision routing configuration and target assignment steps below.</p>
        </div>

        {/* STEP INDICATOR TRACK */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isDone = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div 
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    isCurrent 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : isDone 
                        ? 'bg-slate-900 border-emerald-500/50 text-emerald-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium uppercase tracking-wider ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ACTIVE PANEL VIEW */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-card-border bg-[#131316] mb-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: METRICS */}
            {activeStep === 1 && (
              <motion.div 
                key="s1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-slate-800 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-white">Envelope Configuration</h2>
                  <p className="text-slate-500 text-xs mt-1">Define internal tracking details and recipient visual subject lines.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Internal Campaign Alias</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Q2 Product Update"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-4 text-slate-200 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Sender Origin Name</label>
                      <input 
                        type="text" 
                        placeholder="Acme Marketing"
                        value={formData.fromName}
                        onChange={e => setFormData({...formData, fromName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Reply-To Address</label>
                      <input 
                        type="email" 
                        placeholder="noreply@acme.com"
                        value={formData.fromEmail}
                        onChange={e => setFormData({...formData, fromEmail: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Email Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="The latest update has arrived..."
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-4 text-white font-medium focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Preview Preheader Text (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Open to read the final summary report..."
                      value={formData.previewText}
                      onChange={e => setFormData({...formData, previewText: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm focus:outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: AUDIENCE */}
            {activeStep === 2 && (
              <motion.div 
                key="s2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Target Assignment</h2>
                  <p className="text-slate-500 text-xs mt-1">Determine the subset of your matrix that will receive this payload.</p>
                </div>

                <div 
                  onClick={() => setFormData({...formData, targetAll: true, targetListId: ''})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 mb-4 ${
                    formData.targetAll 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${formData.targetAll ? 'border-emerald-500' : 'border-slate-700'}`}>
                    {formData.targetAll && <div className="h-3 w-3 rounded-full bg-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">All System Contacts</h4>
                    <p className="text-slate-500 text-xs">Distribute to every active record located within this workspace partition.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setFormData({...formData, targetAll: false})}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    !formData.targetAll 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4 cursor-pointer mb-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${!formData.targetAll ? 'border-emerald-500' : 'border-slate-700'}`}>
                      {!formData.targetAll && <div className="h-3 w-3 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">Target Specific Segment</h4>
                      <p className="text-slate-500 text-xs">Restrict physical broadcasts to a defined list or group.</p>
                    </div>
                  </div>

                  {!formData.targetAll && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-10 overflow-hidden"
                    >
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Select Active List</label>
                      <select 
                        value={formData.targetListId}
                        onChange={(e) => setFormData({...formData, targetListId: e.target.value, targetAll: false})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"
                      >
                        <option value="">-- Choose A List --</option>
                        {lists.map(list => (
                          <option key={list.id} value={list.id}>{list.name} ({list._count?.members || 0} contacts)</option>
                        ))}
                      </select>
                      {lists.length === 0 && <p className="text-xs text-amber-500/70 mt-2">No lists found. Please create one in Contacts dashboard first.</p>}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DESIGN SELECTION */}
            {activeStep === 3 && (
              <motion.div 
                key="s3" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Active Canvas</h2>
                    <p className="text-slate-500 text-xs mt-1">Pick from your library of visually composed email structures.</p>
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); loadTemplates(); }}
                    disabled={loadingTemplates}
                    className="text-xs bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-400 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    {loadingTemplates ? <Loader2 className="h-3 w-3 animate-spin" /> : "🔄"} Sync Updates
                  </button>
                </div>

                {loadingTemplates ? (
                  <div className="py-20 flex justify-center text-slate-500 text-sm animate-pulse">Hydrating Template Grid...</div>
                ) : templates.length === 0 ? (
                  <div className="py-16 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                    <Layout className="h-8 w-8 text-slate-700" />
                    <p className="text-slate-500 text-sm italic">No saved templates detected in registry.</p>
                    <button onClick={() => router.push('/templates')} className="px-4 py-2 bg-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition">
                      Return & Design One
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {templates.map(tpl => (
                      <div 
                        key={tpl.id}
                        onClick={() => setFormData({...formData, templateId: tpl.id})}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                          formData.templateId === tpl.id 
                            ? 'border-emerald-500 bg-emerald-500/5' 
                            : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                        }`}
                      >
                        <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-200 text-sm truncate">{tpl.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">{tpl.category || 'Design'}</span>
                            {formData.templateId === tpl.id && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/templates/${tpl.id}/edit`, '_blank');
                                }}
                                className="text-[10px] text-emerald-400 flex items-center gap-1 hover:text-emerald-300 underline decoration-emerald-500/30 font-bold ml-2"
                              >
                                ✏️ Modify in Editor
                              </button>
                            )}
                          </div>
                        </div>
                        {formData.templateId === tpl.id && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: FINAL REVIEW & SEAL */}
            {activeStep === 4 && (
              <motion.div 
                key="s4" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Pre-Flight Verification</h2>
                  <p className="text-slate-500 text-xs mt-1">Verify absolute parameters prior to system-level persistent commit.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Transmission Details</span>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Display Name: <span className="text-slate-200 font-medium">{formData.fromName || '(Default)'}</span></div>
                      <div className="text-xs text-slate-400">Sender Email: <span className="text-slate-200 font-medium">{formData.fromEmail || '(Default)'}</span></div>
                      <div className="text-sm text-white font-bold mt-2">Subject: "{formData.subject}"</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Target Registry</span>
                    <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 h-full">
                      <Users className="h-5 w-5" />
                      <div className="text-sm font-bold">ALL ACTIVE SYSTEM CONTACTS</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-white text-sm font-bold">
                       <ClipboardCheck className="h-4 w-4 text-emerald-500" /> Deployment Strategy
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Schedule Execution (Leave empty for manual trigger)</label>
                    <input 
                      type="datetime-local" 
                      value={formData.scheduledAt}
                      onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="flex items-center justify-between">
          <button
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => (prev - 1) as Step)}
            className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
              activeStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {activeStep < 4 ? (
            <button
              onClick={() => setActiveStep((prev) => (prev + 1) as Step)}
              disabled={
                activeStep === 1 ? !isStep1Valid :
                activeStep === 2 ? !isStep2Valid :
                !isStep3Valid
              }
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition transform active:scale-95"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={submitting}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {submitting ? "Persisting..." : "Commit Broadcast Configuration"}
            </button>
          )}
        </div>

      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
