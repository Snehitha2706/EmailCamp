"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Layout, 
  FileEdit, 
  Trash2, 
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function TemplatesPage() {
  const router = useRouter();
  const { orgRole } = useAuth();
  const isViewer = orgRole === 'org:viewer';
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  const executeCreation = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName.trim(), 
          category: 'General',
          html: '<div style="padding: 20px;"><h1>Draft Frame Ready</h1></div>' 
        })
      });

      if (res.ok) {
        setNewName('');
        setShowModal(false);
        loadTemplates();
      } else {
        alert("Injection failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const executeDelete = async (id: string) => {
    if(!confirm("Are you positive you desire physical erasion of this asset?")) return;
    
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
      
      if(res.ok) {
        loadTemplates();
      } else {
        alert("Removal protocol aborted by server.");
      }
    } catch (e) {
      alert("Communication fracture encountered during destruction.");
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
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Template Library</h1>
          <p className="text-slate-400 text-sm">Craft and orchestrate visually stunning, responsive email canvases.</p>
        </motion.div>
        
        {!isViewer && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 text-white flex items-center gap-2 text-sm font-medium transition transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </motion.div>
        )}
      </div>

      {/* Search & Filter Banner */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Newsletters', 'Promos'].map(cat => (
            <button key={cat} className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:border-slate-600 transition bg-transparent">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty State / Create Card */}
        {!isViewer && (
          <motion.div 
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.01 }}
            className="aspect-[4/3] glass-panel flex flex-col items-center justify-center gap-4 border-dashed border-2 border-slate-800 cursor-pointer group hover:border-emerald-500/40 transition-all"
          >
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
              <Layout className="h-8 w-8 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">Create Blank Canvas</span>
          </motion.div>
        )}

        {/* Rendered Card Grid */}
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span>Loading visual library...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-slate-800/50 rounded-2xl bg-slate-900/20 text-slate-600 italic">
            No saved templates identified in the physical partition.
          </div>
        ) : templates.map((tpl, i) => (
          <motion.div 
            key={tpl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel overflow-hidden group flex flex-col min-h-[240px]"
          >
            {/* Top Preview Area */}
            <div className="flex-1 bg-gradient-to-br from-slate-800/50 to-slate-900 relative overflow-hidden flex items-center justify-center p-6 min-h-[160px]">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
              <div className="w-32 h-40 bg-slate-900 rounded shadow-2xl border border-white/5 flex flex-col p-3 gap-2 transform rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                 <div className="h-4 w-1/2 bg-slate-800 rounded" />
                 <div className="h-12 w-full bg-slate-800/50 rounded" />
                 <div className="h-2 w-3/4 bg-slate-800 rounded" />
                 <div className="h-2 w-full bg-slate-800 rounded" />
                 <div className="h-6 w-1/2 bg-emerald-500/20 border border-emerald-500/30 rounded mx-auto mt-auto" />
              </div>
              
              {/* Hover overlay actions */}
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-200">
                <button 
                  onClick={() => router.push(`/templates/${tpl.id}/edit`)}
                  className="p-2.5 rounded-full bg-emerald-500 text-white hover:scale-110 hover:bg-emerald-400 shadow-xl transition"
                >
                  <FileEdit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert("👁️ Accessing Live Rendering Gateway...")}
                  className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 hover:scale-110 transition"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Details Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-card-border flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">{tpl.name}</h3>
                <button 
                  onClick={() => executeDelete(tpl.id)}
                  className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{tpl.category || 'General'}</span>
                <span>Physical Sync</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Creation Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl border border-card-border shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2">Create New Canvas</h2>
            <p className="text-slate-400 text-sm mb-6">Enter a distinctive name for your dynamic layout.</p>
            
            <input 
              type="text" 
              placeholder="e.g. Monthly Pulse Newsletter" 
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeCreation()}
              className="w-full bg-slate-950 border border-card-border rounded-xl p-4 text-slate-200 mb-6 focus:outline-none focus:border-emerald-500/50 transition text-sm"
            />

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => { setShowModal(false); setNewName(''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeCreation}
                disabled={isCreating || !newName.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
              >
                {isCreating ? 'Drafting...' : 'Build Canvas'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
