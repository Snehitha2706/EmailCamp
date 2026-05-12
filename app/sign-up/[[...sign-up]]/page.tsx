import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 glass-panel p-2">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-slate-900/80 border border-slate-800/50 shadow-2xl",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800 hover:bg-slate-700 text-white border-slate-700",
              formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
              footerActionLink: "text-emerald-400 hover:text-emerald-300"
            }
          }}
        />
      </div>
    </div>
  );
}
