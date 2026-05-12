"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MailWarning, Loader2, ArrowRight } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('cid');
  const campaignId = searchParams.get('camp');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const executeUnsubscribe = async () => {
    if (!contactId) return setStatus('error');
    
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, campaignId })
      });
      
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md relative">
        {/* Ambient Background Blur */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-[#121214] border border-white/5 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Top Identity Bar */}
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-center">
             <h2 className="text-white font-bold tracking-wide uppercase text-sm flex items-center gap-2">
               <span className="text-emerald-500">Email</span>Camp
             </h2>
          </div>

          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            
            {status === 'idle' && (
              <>
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <MailWarning className="h-8 w-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Revoke Subscription?</h1>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Please confirm you desire total removal from future communication broadcast relays.
                </p>
                <button 
                  onClick={executeUnsubscribe}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 transform active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm Unsubscribe <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {status === 'loading' && (
              <div className="py-10 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <p className="text-slate-500 text-sm font-mono tracking-widest">PROCESSING REVOCATION...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-emerald-400 mb-2">Successfully Removed</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your preferences have been synchronized. You will no longer receive broadcasts to this address.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <h1 className="text-xl font-bold text-red-400 mb-2">Validation Fault</h1>
                <p className="text-slate-400 text-sm">
                  We could not identify an active route token. Please follow the direct link provided in your message footer.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
