"use client";

import React, { useRef, useEffect } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { Loader2, Save, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  templateId: string;
  initialDesign?: any;
  onSave: (data: { design: any, html: string }) => Promise<void>;
}

export default function VisualEditor({ templateId, initialDesign, onSave }: Props) {
  const emailEditorRef = useRef<EditorRef>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const router = useRouter();

  const onLoad = () => {
    setIsLoaded(true);
    // Inject initial design payload if present on mount
    if (initialDesign && emailEditorRef.current?.editor) {
      emailEditorRef.current.editor.loadDesign(initialDesign);
    }
  };

  const handleExport = async () => {
    if (!emailEditorRef.current?.editor) return;

    setIsSaving(true);
    try {
      emailEditorRef.current.editor.exportHtml(async (data) => {
        const { design, html } = data;
        await onSave({ design, html });
        setIsSaving(false);
      });
    } catch (err) {
      console.error("Export sequence violation:", err);
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#18181b]">
      {/* High-Signal Editor Control Bar */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#111113] backdrop-blur-xl z-20 shadow-lg shadow-black/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">DESIGN EDITOR</h1>
            <p className="text-xs text-emerald-400/70 font-mono">REV: {templateId.substring(0,8)}</p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          disabled={isSaving || !isLoaded}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "SYNCHRONIZING..." : "PERSIST DESIGN"}
        </button>
      </div>

      {/* Pure Containment Canvas */}
      <div className="flex-1 relative bg-[#18181b] flex flex-col">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111113] z-10 text-slate-500 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs font-mono tracking-widest animate-pulse">MATERIALIZING EDITOR VIEWPORT...</span>
          </div>
        )}
        
        <EmailEditor
          ref={emailEditorRef}
          onLoad={onLoad}
          minHeight="100%"
          style={{ height: '100%' }}
          projectId={process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID ? Number(process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID) : undefined}
          options={{
            appearance: {
              theme: 'modern_dark',
              panels: {
                tools: { dock: 'right' }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
