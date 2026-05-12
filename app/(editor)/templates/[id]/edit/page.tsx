"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditorContainer from '@/components/builder/EditorContainer';
import { toast } from 'sonner';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch('/api/templates');
        const list = await res.json();
        const found = list.find((t: any) => t.id === id);
        if (found) setTemplate(found);
      } catch (e) {
        console.error("Fetch breach:", e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTemplate();
  }, [id]);

  const handleSave = async (data: { design: any, html: string }) => {
    try {
      const response = await fetch(`/api/templates/${id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: data.design,
          html: data.html
        })
      });

      if (response.ok) {
        toast.success("Structural Integrity Persisted.");
      } else {
        throw new Error("Commit Refused");
      }
    } catch (error) {
      toast.error("Persist Failure: Connection disrupted.");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#111113] flex items-center justify-center text-emerald-500/50 font-mono text-xs tracking-widest">
      MATERIALIZING ARTIFACT DATA...
    </div>
  );

  return (
    <EditorContainer 
      templateId={id}
      initialDesign={template?.blocks}
      onSave={handleSave}
    />
  );
}
