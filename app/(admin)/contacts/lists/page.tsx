"use client";

import React, { useState, useEffect } from 'react';
import { ListFilter, Plus, Users, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ListsGridPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/lists');
      if (res.ok) setLists(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    const name = window.prompt("Specify unique designation vector for this group:");
    if (!name?.trim()) return;
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if(res.ok) {
        toast.success("Identity group instantiation complete.");
        load();
      }
    } catch(e) {}
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <ListFilter className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Mailing Structures</h1>
            <p className="text-slate-500 text-sm">Discrete repository containers grouping verified identities.</p>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Generate Vector
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 glass-panel animate-pulse border border-white/5" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 glass-panel border-dashed border-white/10">
          <p className="text-slate-500 text-sm italic">No structured containers present. Initiate first pool.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list, i) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/contacts?listId=${list.id}`)}
              className="glass-panel p-6 group cursor-pointer hover:border-blue-500/30 relative overflow-hidden transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full blur-xl group-hover:bg-blue-500/10 transition-all" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors truncate pr-4">{list.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(list.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 group-hover:text-blue-400 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-end gap-4 border-t border-white/5 pt-4">
                <div>
                  <div className="text-2xl font-bold text-white">{list._count?.members || 0}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                    <Users className="h-3 w-3" /> Active Nodes
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    100% Health
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
