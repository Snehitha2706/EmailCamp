import { OrganizationList } from "@clerk/nextjs";

export default function SelectOrgPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <div className="glass-panel p-8 max-w-md w-full flex flex-col items-center gap-6 border border-slate-800/50 relative overflow-hidden">
        
        {/* Vector background flare */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="text-center space-y-1 mb-2 z-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">Deploy Organization</h1>
          <p className="text-sm text-slate-400">To access the dashboard, you must define a Workspace context.</p>
        </div>

        <div className="clerk-enforcement z-10 w-full flex justify-center">
          <OrganizationList 
            hidePersonal 
            afterCreateOrganizationUrl="/" 
            afterSelectOrganizationUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
