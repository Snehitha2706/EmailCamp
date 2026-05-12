"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { Users } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto flex flex-col min-h-[80vh]">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
          <Users className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Seat Governance</h1>
          <p className="text-slate-500 text-sm">Calibrate organizational rosters and operational tier privilege sets.</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <OrganizationProfile 
          appearance={{
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#131316',
              colorInputBackground: '#0a0a0b',
              colorText: '#ffffff',
              colorTextSecondary: '#94a3b8',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: "w-full flex justify-center",
              card: "bg-[#131316] border border-white/5 shadow-2xl w-full",
              navbar: "bg-transparent border-r border-white/5",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-slate-400",
            }
          }}
        />
      </div>
    </div>
  );
}
