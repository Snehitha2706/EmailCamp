"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Fingerprint, 
  Activity, 
  Tag, 
  ExternalLink, 
  MousePointerClick, 
  Eye, 
  Send, 
  Loader2,
  Edit,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLists, setAllLists] = useState<any[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  async function fetchContact() {
    try {
      const res = await fetch(`/api/contacts/${params.id}`);
      if (res.ok) {
        setContact(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContact();
  }, [params.id]);

  async function openListEditor() {
    try {
      const res = await fetch('/api/lists');
      if (res.ok) {
        const lists = await res.json();
        setAllLists(lists);
        const current = contact?.listMemberships?.map((m: any) => m.listId) || [];
        setSelectedLists(current);
        setIsModalOpen(true);
      }
    } catch(e){}
  }

  function toggleList(id: string) {
    setSelectedLists(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function saveListChanges() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/contacts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listIds: selectedLists })
      });
      if (res.ok) {
        await fetchContact();
        setIsModalOpen(false);
      }
    } catch(e){}
    setIsSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        Loading Contact Profile...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-10 text-center text-slate-500">Identity footprint absent or removed from partition.</div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-24">
      {/* Header Nav */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-500 hover:text-white transition text-sm font-medium mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Audience
      </button>

      {/* Master Banner Profile */}
      <div className="glass-panel p-8 flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="h-24 w-24 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-xl shadow-slate-950/50 uppercase">
          {contact.firstName?.[0] || contact.email?.[0]}
        </div>

        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {contact.firstName || "Unnamed"} {contact.lastName || "User"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 opacity-50" /> {contact.email}</span>
            <span className="h-1 w-1 bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 opacity-50" /> Tracked since {new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            contact.status === 'active' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {contact.status}
          </span>
        </div>
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Properties */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-emerald-400" />
              Core Identity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Source</span>
                <span className="text-slate-300 font-medium capitalize">{contact.source || 'manual'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Actions</span>
                <span className="text-white font-bold">{contact._count?.events || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-400" />
                Mailing Lists
              </h3>
              <button 
                onClick={openListEditor}
                className="p-1 text-slate-500 hover:text-blue-400 transition"
                title="Manage Lists"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
            {contact.listMemberships?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {contact.listMemberships.map((m: any) => (
                  <span key={m.id} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                    {m.list?.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No active list designations found.</p>
            )}
          </div>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="lg:col-span-2 glass-panel p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              Engagement Timeline
            </h3>
          </div>

          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {contact.events?.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm italic">
                Zero lifetime events recorded for this specific vector.
              </div>
            ) : (
              contact.events.map((event: any, idx: number) => {
                const Icon = event.eventType === 'click' ? MousePointerClick : event.eventType === 'open' ? Eye : Send;
                const color = event.eventType === 'click' ? 'text-blue-400 bg-blue-500/10' : event.eventType === 'open' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={event.id} 
                    className="flex gap-4 relative"
                  >
                    {/* Thread Line */}
                    {idx !== contact.events.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-slate-800" />
                    )}

                    <div className={`h-10 w-10 rounded-full ${color} border border-white/5 flex items-center justify-center flex-shrink-0 shadow-lg relative z-10`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-white">
                          {event.eventType === 'click' ? 'Clicked Link' : event.eventType === 'open' ? 'Opened Email' : 'Sent'}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(event.occurredAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        Campaign: <span className="text-slate-200 font-medium">{event.campaign?.name || 'Unknown Broadcaster'}</span>
                      </p>
                      {event.metadata?.url && (
                        <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-[10px] text-slate-500 max-w-sm truncate">
                          <ExternalLink className="h-3 w-3 opacity-50" />
                          {event.metadata.url}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Advanced List Editing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel p-8 border border-white/5 rounded-3xl shadow-2xl bg-[#121214]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Recalibrate Listings</h3>
                  <p className="text-xs text-slate-500 tracking-wide mt-0.5">SELECT ACTIVE DEPLOYMENT VECTORS</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 mb-6">
                {allLists.length === 0 ? (
                  <p className="text-center text-slate-500 italic text-xs py-8">No Mailing Structures established.</p>
                ) : (
                  allLists.map((list) => {
                    const isAssigned = selectedLists.includes(list.id);
                    return (
                      <label
                        key={list.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${
                          isAssigned
                            ? 'bg-blue-600/10 border-blue-600/40 text-blue-300'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => toggleList(list.id)}
                          className="hidden"
                        />
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                          isAssigned 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-slate-700 text-transparent bg-slate-950'
                        }`}>
                          <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        </div>
                        <div className="flex-1 truncate text-sm font-medium">
                          {list.name}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={saveListChanges}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-blue-600/15 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Commit Config
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
