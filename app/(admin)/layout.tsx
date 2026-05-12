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
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // Close drawer automatically upon internal navigation trigger
  React.useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const NavContents = (
    <>
      <div className="p-6 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
            <Mail className="h-4 w-4" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-gradient">EmailCamp</h1>
        </div>
        <button onClick={() => setIsMobileNavOpen(false)} className="md:hidden text-slate-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      
      {/* Mobile Sidebar Overlay (Backdrop) */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 bg-card border-r border-card-border z-50 md:hidden flex flex-col"
            >
              {NavContents}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Glass Sidebar (Desktop) */}
      <aside className="w-64 fixed h-screen border-r border-card-border bg-card backdrop-blur-xl hidden md:flex flex-col z-20">
        {NavContents}
      </aside>

      {/* Viewport Frame */}
      <main className="md:ml-64 flex-1 relative min-h-screen w-full overflow-x-hidden">
        {/* Global Glass Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-card-border bg-background/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-2 text-slate-400 md:hidden hover:text-white transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-medium text-slate-400 hidden sm:block">Operational Core</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-slate-400 hover:text-white glass-panel border border-card-border rounded-full relative hidden xs:flex">
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
                  organizationSwitcherTrigger: "bg-slate-900 border border-slate-800 hover:bg-slate-800/50 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-200 transition-colors max-w-[140px] sm:max-w-none truncate",
                  organizationPreviewMainIdentifier: "text-slate-50 font-semibold text-xs sm:text-sm",
                  organizationPreviewSecondaryIdentifier: "text-slate-400 text-[10px]",
                }
              }}
            />
            
            {/* Standard Clerk User Controls */}
            <UserButton />
          </div>
        </header>

        <div className="relative z-0 px-2 sm:px-0">
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
