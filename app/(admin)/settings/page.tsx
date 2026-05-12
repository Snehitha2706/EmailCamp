"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Mail, Globe, Save, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';

export default function SettingsPage() {
  const { orgRole, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fromEmail: '',
    fromName: '',
    awsRegion: 'us-east-1',
    sesAccessKey: '',
    sesSecretKey: ''
  });

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings/organisation');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          fromEmail: data.fromEmail || '',
          fromName: data.fromName || '',
          awsRegion: data.awsRegion || 'us-east-1',
          sesAccessKey: data.sesAccessKey || '',
          sesSecretKey: data.sesSecretKey || ''
        });
      } else {
        const errorData = await res.json();
        toast.error("Telemetry Deficit: " + (errorData.error || "Unknown Error"));
      }
    } catch (err: any) {
      toast.error("Interface Breach: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/organisation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Parameters successfully committed to core.");
      } else {
        const errorData = await res.json();
        toast.error("Commit Failure: " + (errorData.error || "Unknown Block"));
      }
    } catch (err: any) {
      toast.error("Protocol Breach: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 text-sm gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        Initializing Control Cache...
      </div>
    );
  }

  // 🛡️ HARDLOCK: If clerk session isn't confirmed yet, wait.
  if (!isLoaded) return null;

  // Only Super Admin (org:admin) or Personal Owner (no orgRole) can access this calibration bay.
  const isAdmin = orgRole === 'org:admin' || !orgRole;

  if (!isAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[70vh] text-center gap-4">
        <div className="h-24 w-24 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mb-4">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Access Denied</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Your authorization tier is insufficient to access direct system calibration. 
          Please contact your primary **Super Admin** to adjust root infrastructure keys.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-24">
      
      {/* Header Vector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 shadow-xl">
            <Settings className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Universal Control</h1>
            <p className="text-slate-500 text-sm mt-1">Calibrate workspace metrics & transmission physics.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Committing..." : "Commit Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: Settings Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Block 1: Workspace Matrix */}
          <div className="glass-panel p-8 rounded-3xl border border-card-border bg-[#131316] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-slate-400 group-hover:opacity-10 transition-opacity">
              <Globe className="h-24 w-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                <Globe className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Environment Base</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Organization Alias</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Physical Deployment Zone (Region)</label>
                <select 
                  value={formData.awsRegion}
                  onChange={e => setFormData({...formData, awsRegion: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                  <option value="eu-central-1">Europe (Frankfurt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Block 2: Physical Transmission Logic */}
          <div className="glass-panel p-8 rounded-3xl border border-card-border bg-[#131316]">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Routing Geometry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Default Sender Name</label>
                <input 
                  type="text" 
                  value={formData.fromName}
                  onChange={e => setFormData({...formData, fromName: e.target.value})}
                  placeholder="Support Team"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Primary Origin E-Mail</label>
                <input 
                  type="email" 
                  value={formData.fromEmail}
                  onChange={e => setFormData({...formData, fromEmail: e.target.value})}
                  placeholder="noreply@yourdomain.com"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Block 3: Secure Authentication Matrix (SES) */}
          <div className="glass-panel p-8 rounded-3xl border border-card-border bg-[#131316] border-t-emerald-500/20">
            <div className="flex items-center gap-3 mb-2 pb-1">
              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-white">AWS SES Authority Bridge</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6 ml-11">Provision identity tokens enabling physical mail forwarding via Amazon SES.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">AWS Access Key ID</label>
                <input 
                  type="password" 
                  value={formData.sesAccessKey}
                  onChange={e => setFormData({...formData, sesAccessKey: e.target.value})}
                  placeholder="AKIAXXXXXXXXXXXXXXXX"
                  className="w-full font-mono bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">AWS Secret Access Key</label>
                <input 
                  type="password" 
                  value={formData.sesSecretKey}
                  onChange={e => setFormData({...formData, sesSecretKey: e.target.value})}
                  placeholder="Secure Hash Boundary"
                  className="w-full font-mono bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-slate-200 focus:outline-none transition text-sm"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Column 3: Static Info Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-card-border bg-emerald-500/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Shield className="h-5 w-5" />
              Infrastructure Status
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your credentials remain encrypted and strictly isolated to your secure database tenant container. Transmission occurs over verified physical TLS layers only.
            </p>
            
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-900 flex items-center gap-3 text-xs text-slate-300">
              <div className={`h-2 w-2 rounded-full ${formData.sesAccessKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              {formData.sesAccessKey ? "Access Vector Identified" : "Provisioning Incomplete"}
            </div>
          </div>

          <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-600 italic">
             Need custom dedicated IP pools? <br/>
             Contact system administrative support.
          </div>
        </div>

      </form>
    </div>
  );
}
