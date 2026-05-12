"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  FileText, 
  BarChart3, 
  Settings, 
  Bell,
  RefreshCw
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Fixed Glass Sidebar */}
      <aside className="w-64 fixed h-screen border-r border-card-border bg-card backdrop-blur-xl hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-card-border flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
            <Mail className="h-4 w-4" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-gradient">EmailCamp</h1>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-500 px-3 mb-2 mt-2 uppercase tracking-wider">Control</div>
          <NavLink href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === "/"} />
          <NavLink href="/contacts" icon={Users} label="Contacts" active={pathname.startsWith("/contacts")} />
          <NavLink href="/templates" icon={FileText} label="Templates" active={pathname.startsWith("/templates")} />
          <NavLink href="/campaigns" icon={Mail} label="Campaigns" active={pathname.startsWith("/campaigns")} />
          
          <div className="text-xs font-semibold text-slate-500 px-3 mb-2 mt-6 uppercase tracking-wider">Analytics</div>
          <NavLink href="/reports" icon={BarChart3} label="Reports" active={pathname.startsWith("/reports")} />
          <NavLink href="/automation" icon={RefreshCw} label="Automation" active={pathname.startsWith("/automation")} />
        </nav>

        <div className="p-4 border-t border-card-border">
          <NavLink href="/settings" icon={Settings} label="Settings" active={pathname.startsWith("/settings")} />
        </div>
      </aside>

      {/* Viewport Frame */}
      <main className="md:ml-64 flex-1 relative min-h-screen">
        {/* Global Glass Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-card-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-400">Operational Core</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white glass-panel border border-card-border rounded-full relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            {/* Collaborative Team Switcher */}
            <OrganizationSwitcher 
              hidePersonal={true} 
              afterCreateOrganizationUrl="/" 
              afterSelectOrganizationUrl="/"
              appearance={{
                variables: { colorText: '#f8fafc' },
                elements: {
                  organizationSwitcherTrigger: "bg-slate-900 border border-slate-800 hover:bg-slate-800/50 px-3 py-1.5 rounded-xl text-slate-200 transition-colors",
                  organizationPreviewMainIdentifier: "text-slate-50 font-semibold",
                  organizationPreviewSecondaryIdentifier: "text-slate-400",
                }
              }}
            />
            
            {/* Standard Clerk User Controls */}
            <UserButton />
          </div>
        </header>

        <div className="relative z-0">
          {children}
        </div>
      </main>
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}

function NavLink({ href, icon: Icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
        active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}>
        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${active ? 'text-emerald-400' : ''}`} />
        <span className="text-sm font-medium">{label}</span>
        {active && (
          <motion.div layoutId="navIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
        )}
      </div>
    </Link>
  );
}
