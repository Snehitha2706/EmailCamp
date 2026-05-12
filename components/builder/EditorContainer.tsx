"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically decouple the viewport from SSR completely.
const DynamicVisualEditor = dynamic(
  () => import('./VisualEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#111113] text-slate-500 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-xs font-mono tracking-widest">INITIALIZING CLIENT GRAPHICS ENGINE...</span>
      </div>
    )
  }
);

export default DynamicVisualEditor;
