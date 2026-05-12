"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileUp,
  Loader2,
  Trash2
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const { orgRole } = useAuth();
  const router = useRouter();
  const isViewer = orgRole === 'org:viewer';

  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', firstName: '', lastName: '' });
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadLists() {
    try {
      const res = await fetch('/api/lists');
      if (res.ok) setLists(await res.json());
    } catch(e){}
  }

  async function loadAudience() {
    setLoading(true);
    try {
      const query = selectedList ? `?listId=${selectedList}` : '';
      const res = await fetch(`/api/contacts${query}`);
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList() {
    const name = window.prompt("Enter a specific designation alias for this new audience grouping:");
    if (!name || !name.trim()) return;
    
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        loadLists();
        alert("Group definition successfully instantiated!");
      }
    } catch (e) {
      alert("Definition collapse.");
    }
  }

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    loadAudience();
  }, [selectedList]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/contacts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts: results.data, listId: selectedList })
          });
          
          if (res.ok) {
            alert("Bulk Synchronization Success!");
            loadAudience(); // reload
          } else {
            alert("Pipeline transmission aborted. Validate CSV mapping.");
          }
        } catch (err) {
          console.error(err);
          alert("Pipeline error.");
        } finally {
          setImporting(false);
          if(fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ email: '', firstName: '', lastName: '' });
        setIsModalOpen(false);
        loadAudience();
      } else {
        const err = await res.json();
        alert(err.error || "Physical insertion failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Transmission rupture.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (id: string) => {
    if (!confirm("Are you absolutely positive you wish to physically purge this identity from the partition?")) return;
    
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadAudience();
      } else {
        alert("Erasure blocked by authorization handler.");
      }
    } catch (err) {
      alert("Physical connection error.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Audience Center</h1>
          <p className="text-slate-400 text-sm">Manage directories, segment contacts, and track lifecycle growth.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {!isViewer && (
            <>
              <button 
                onClick={handleCreateList}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-white/5 flex items-center gap-2 text-sm font-medium text-slate-300 transition"
              >
                <FileUp className="h-4 w-4 opacity-60 rotate-180" />
                New List
              </button>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-4 py-2 rounded-xl border border-card-border glass-panel flex items-center gap-2 text-sm font-medium hover:bg-white/5 transition disabled:opacity-50"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {importing ? 'Processing...' : 'Import CSV'}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 text-white flex items-center gap-2 text-sm font-medium transition active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                Add Contact
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* Stats Preview Mini-Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', val: contacts.length.toLocaleString(), color: 'emerald' },
          { label: 'New This Month', val: 'Synchronizing', color: 'blue' },
          { label: 'Bounced', val: '0', color: 'amber' },
          { label: 'Clean Rate', val: '100%', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel px-4 py-3 flex flex-col gap-1 border-t-2" style={{ borderTopColor: `var(--color-${stat.color}-500)` }}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            <span className="text-xl font-bold">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-card-border rounded-2xl p-4 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or tag..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase">Group:</span>
            <select 
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none min-w-[140px]"
            >
              <option value="">All Contacts</option>
              {lists.map(lst => (
                <option key={lst.id} value={lst.id}>{lst.name}</option>
              ))}
            </select>
          </div>

          <button className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-center gap-2 text-xs font-medium hover:bg-white/5 transition text-slate-300">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-center gap-2 text-xs font-medium hover:bg-white/5 transition text-slate-300">
            Lists: All
          </button>
        </div>
      </div>

      {/* Dynamic Data Grid */}
      <div className="glass-panel overflow-hidden border border-card-border rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Lists</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Last Activity</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Syncing secure physical pool...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No active records identified.</td></tr>
              ) : contacts.map((contact, i) => (
                <motion.tr 
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                        {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || contact.email?.[0] || '')}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={contact.status.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {contact.listMemberships?.length > 0 ? contact.listMemberships.map((mem: any, j: number) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-300">
                          {mem.list.name}
                        </span>
                      )) : (
                        <span className="text-xs italic text-slate-600">Uncategorized</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    Recently Synced
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); executeDelete(contact.id); }}
                      className="p-1 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Addition Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel p-8 border border-card-border rounded-3xl shadow-2xl bg-[#111113]"
            >
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                Register Contact
              </h2>
              <p className="text-slate-400 text-xs mb-6 tracking-wide">MANUAL INSERTION MODE ACTIVE</p>
              
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">Physical Address (Required)</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950/50 border border-card-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">Given Name</label>
                    <input 
                      type="text" 
                      placeholder="Optional"
                      className="w-full bg-slate-950/50 border border-card-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">Family Name</label>
                    <input 
                      type="text" 
                      placeholder="Optional"
                      className="w-full bg-slate-950/50 border border-card-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !formData.email}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {isSubmitting ? 'Committing...' : 'Insert Identity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  }
  if (status === 'bounced') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="h-3 w-3" />
        Bounced
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
      <Clock className="h-3 w-3" />
      Unsubscribed
    </span>
  );
}
