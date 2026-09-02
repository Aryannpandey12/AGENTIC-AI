import { NavLink } from "react-router-dom";
import logo from "../../logo.png";

export default function Sidebar({ title, links, variant = "admin" }) {
  const isKitchen = variant === "kitchen";

  const getLinkClass = ({ isActive }) => {
    if (isKitchen) {
      return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
        isActive
          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
      }`;
    }
    // Admin SaaS style
    return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
      isActive
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <aside
      className={`border-r lg:min-h-screen lg:w-64 flex flex-col shrink-0 ${
        isKitchen
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* Brand Header */}
      <div className={`border-b p-6 ${isKitchen ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white p-1 border border-slate-200/60 shadow-sm overflow-hidden">
            <img src={logo} alt="रसोई माँ के हाथों की" className="h-full w-full object-contain" />
          </span>
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight">रसोई माँ के हाथों की</h1>
            <p
              className={`text-[10px] font-extrabold uppercase tracking-widest mt-0.5 ${
                isKitchen ? "text-amber-400" : "text-emerald-600"
              }`}
            >
              Powered by Amigos
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-2 overflow-x-auto p-4 lg:flex-1 lg:flex-col lg:space-y-1.5 scrollbar-none">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={getLinkClass}>
            {link.icon && <link.icon size={18} className="shrink-0 stroke-[2.25]" />}
            <span className="whitespace-nowrap">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / System Status */}
      <div className={`hidden lg:block p-4 border-t mt-auto text-xs ${isKitchen ? "border-slate-800 text-slate-400 bg-slate-950/40" : "border-slate-100 text-slate-500 bg-slate-50/50"}`}>
        <div className="flex items-center gap-2 font-semibold">
          <span className={`h-2 w-2 rounded-full animate-pulse ${isKitchen ? "bg-amber-400" : "bg-emerald-500"}`} />
          <span>{isKitchen ? "Live Kitchen Feed" : "System Secure"}</span>
        </div>
        <p className="mt-1 text-[11px] opacity-75">रसोई माँ के हाथों की • Powered by Amigos</p>
      </div>
    </aside>
  );
}
