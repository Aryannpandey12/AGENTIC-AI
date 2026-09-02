import { Outlet } from "react-router-dom";
import { CheckCircle2, Clock3, Flame, LayoutDashboard, ListChecks, Radio } from "lucide-react";
import Sidebar from "../components/common/Sidebar.jsx";
import { useEffect, useState } from "react";

const links = [
  { to: "/kitchen", label: "Operations Board", icon: LayoutDashboard, end: true },
  { to: "/kitchen/new-orders", label: "New Incoming", icon: Clock3 },
  { to: "/kitchen/active-orders", label: "Active Pipeline", icon: Flame },
  { to: "/kitchen/completed-orders", label: "Completed Log", icon: CheckCircle2 }
];

export default function KitchenLayout() {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTimeString(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }).format(new Date())
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex font-sans selection:bg-amber-500 selection:text-slate-950">
      <Sidebar title="Kitchen Ops" links={links} variant="kitchen" />
      <main className="min-w-0 flex-1 flex flex-col">
        {/* Kitchen Top Status Bar */}
        <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>KITCHEN DISPATCH TERMINAL</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-slate-700">HUB #04</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Auto-polling incoming web orders every 5 seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>SYNC ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="text-sm font-mono font-black text-amber-400 tracking-wider">
              {timeString || "00:00:00"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
