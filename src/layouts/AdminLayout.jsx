import { Outlet } from "react-router-dom";
import { ClipboardList, LayoutDashboard, ShieldCheck, Utensils } from "lucide-react";
import Sidebar from "../components/common/Sidebar.jsx";

const links = [
  { to: "/admin", label: "Executive Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/menu", label: "Catalog & Pricing", icon: Utensils },
  { to: "/admin/orders", label: "Global Order Logs", icon: ClipboardList }
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex font-sans antialiased">
      <Sidebar title="Admin SaaS" links={links} variant="admin" />
      <main className="min-w-0 flex-1 flex flex-col">
        {/* SaaS Top Shell Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase ring-1 ring-emerald-600/20">
                HQ Workspace
              </span>
              <h2 className="text-lg font-black tracking-tight text-slate-950">Management Console</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time menu control, pricing overrides, and enterprise order monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Admin Access</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
