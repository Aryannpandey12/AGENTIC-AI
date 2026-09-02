import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChefHat, ChevronDown, ChevronUp, ShieldCheck, Utensils, Zap } from "lucide-react";

export default function PortalSwitcher() {
  const [minimized, setMinimized] = useState(false);

  const getPortalBadgeClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-2xs ${
      isActive
        ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-white/20"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur transition hover:bg-slate-800 hover:scale-105 active:scale-95"
          title="Open Portal Switcher"
        >
          <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
          <span>Portals</span>
          <ChevronUp size={14} className="text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-32px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-2 text-white shadow-2xl backdrop-blur-md ring-1 ring-white/10">
        <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 text-[11px] font-bold tracking-wider uppercase text-amber-400 border-r border-slate-700/80">
          <Zap size={13} className="fill-amber-400" />
          <span>Demo Modes</span>
        </div>

        <nav className="flex items-center gap-1.5">
          <NavLink to="/" end className={getPortalBadgeClass}>
            <Utensils size={13} />
            <span>Customer</span>
          </NavLink>

          <NavLink to="/kitchen" className={getPortalBadgeClass}>
            <ChefHat size={13} />
            <span>Kitchen</span>
          </NavLink>

          <NavLink to="/admin" className={getPortalBadgeClass}>
            <ShieldCheck size={13} />
            <span>Admin</span>
          </NavLink>
        </nav>

        <button
          onClick={() => setMinimized(true)}
          className="ml-1 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title="Minimize switcher"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </div>
  );
}
