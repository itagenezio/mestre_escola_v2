import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Shared Sidebar across all dashboard sub-pages */}
      <Sidebar />
      <main className="flex-1 max-h-screen overflow-y-auto px-6 py-10 md:px-12 scrollbar-none">
        {children}
      </main>
    </div>
  );
}
