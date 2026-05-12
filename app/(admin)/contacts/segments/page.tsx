"use client";

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Save, Loader2, Terminal, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Rule = {
  id: string;
  field: 'status' | 'source' | 'created_at';
  operator: 'equals' | 'not_equals' | 'contains';
  value: string;
};

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Builder State
  const [name, setName] = useState('');
  const [rules, setRules] = useState<Rule[]>([
    { id: crypto.randomUUID(), field: 'status', operator: 'equals', value: 'active' }
  ]);

  async function loadSegments() {
    setLoading(true);
    try {
      const res = await fetch('/api/segments');
      if (res.ok) setSegments(await res.json());
    } catch (e) {
      toast.error("Query deficit.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSegments();
  }, []);

  const addRule = () => {
    setRules([...rules, { id: crypto.randomUUID(), field: 'status', operator: 'equals', value: 'active' }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, key: keyof Rule, val: any) => {
    setRules(rules.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Provide discrete identifier.");
    if (rules.length === 0) return toast.error("Filter sequence is Null.");

    setSaving(true);
    try {
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rules })
      });
      if (res.ok) {
        toast.success("Dynamic Logic Compiled.");
        setName('');
        setRules([{ id: crypto.randomUUID(), field: 'status', operator: 'equals', value: 'active' }]);
        loadSegments();
      } else {
        toast.error("Compilation rupture.");
      }
    } catch(e) {
      toast.error("Protocol failure.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if(!confirm("Dissolve logic matrix permanently?")) return;
    try {
      const res = await fetch(`/api/segments?id=${id}`, { method: 'DELETE' });
      if(res.ok) {
        toast.success("Logic partition dissolved.");
        loadSegments();
      }
    } catch(e) {}
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
          <Layers className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dynamic Segments</h1>
          <p className="text-slate-500 text-sm">Programmatic query clusters slicing audience sets live at runtime.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Saved Matrices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest">Compiled Matrices</h3>
            <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-white/5">{segments.length}</span>
          </div>

          {loading ? (
            <div className="glass-panel p-6 text-center animate-pulse text-slate-500 text-sm">Synchronizing core segments...</div>
          ) : segments.length === 0 ? (
            <div className="glass-panel p-6 text-center italic text-slate-600 text-sm border-dashed border-white/5">
              No logic schemas instantiated.
            </div>
          ) : (
            <div className="space-y-3">
              {segments.map(seg => (
                <div key={seg.id} className="glass-panel p-4 border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-indigo-400" />
                      {seg.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex gap-2 items-center">
                      <span>{(seg.rules as any[]).length} Rules</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span>Active Ready</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(seg.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Col: Rule Builder */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-panel border border-white/10 overflow-hidden">
            <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center gap-3">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <input 
                type="text" 
                required
                placeholder="DESIGNATE LOGIC ALIAS (e.g., High Value Bounces)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-transparent border-none outline-none font-mono text-sm text-white w-full placeholder:text-slate-600 uppercase tracking-wider"
              />
            </div>

            <div className="p-6 space-y-4 bg-black/20 min-h-[250px]">
              <AnimatePresence initial={false}>
                {rules.map((rule, idx) => (
                  <motion.div 
                    key={rule.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-950/50 border border-white/5 p-4 rounded-xl relative"
                  >
                    <div className="absolute -left-2.5 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono border border-white/10 text-slate-500">
                      {idx === 0 ? 'WHERE' : 'AND'}
                    </div>
                    
                    <div className="flex-1 space-y-1 sm:space-y-0 sm:flex sm:gap-3 w-full pl-2">
                      <select 
                        value={rule.field}
                        onChange={e => updateRule(rule.id, 'field', e.target.value as any)}
                        className="bg-black/40 text-slate-300 border border-white/10 rounded-lg px-3 py-2 text-xs w-full sm:w-40 focus:outline-none"
                      >
                        <option value="status">Contact Status</option>
                        <option value="source">Ingress Source</option>
                        <option value="created_at">Creation Date</option>
                      </select>

                      <select 
                        value={rule.operator}
                        onChange={e => updateRule(rule.id, 'operator', e.target.value as any)}
                        className="bg-black/40 text-slate-300 border border-white/10 rounded-lg px-3 py-2 text-xs w-full sm:w-40 focus:outline-none font-mono"
                      >
                        <option value="equals">EQUALS</option>
                        <option value="not_equals">NOT EQUAL</option>
                        <option value="contains">CONTAINS</option>
                      </select>

                      {rule.field === 'status' ? (
                        <select 
                          value={rule.value}
                          onChange={e => updateRule(rule.id, 'value', e.target.value)}
                          className="flex-1 bg-black/40 text-emerald-400 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs w-full focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="bounced">Bounced</option>
                          <option value="complained">Complained</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Target Value..."
                          value={rule.value}
                          onChange={e => updateRule(rule.id, 'value', e.target.value)}
                          className="flex-1 bg-black/40 text-slate-200 border border-white/10 rounded-lg px-3 py-2 text-xs w-full focus:outline-none"
                        />
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      disabled={rules.length === 1}
                      className="text-slate-600 hover:text-rose-400 disabled:opacity-0 transition p-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button 
                type="button"
                onClick={addRule}
                className="w-full border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 rounded-xl py-4 flex items-center justify-center gap-2 text-xs font-medium transition-all font-mono"
              >
                <Plus className="h-3 w-3" />
                APPEND CONDITION (AND)
              </button>
            </div>

            <div className="border-t border-white/5 p-6 bg-slate-950/40 flex items-center justify-end">
              <button 
                disabled={saving || !name}
                className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Commit Segment
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
