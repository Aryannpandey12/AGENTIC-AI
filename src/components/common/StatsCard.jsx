export default function StatsCard({ title, value, icon: Icon, accent = "emerald" }) {
  const accentClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    stone: "bg-stone-50 text-stone-700 border-stone-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100"
  };

  const borderHoverClasses = {
    emerald: "hover:border-emerald-300",
    amber: "hover:border-amber-300",
    red: "hover:border-red-300",
    blue: "hover:border-sky-300",
    stone: "hover:border-stone-300",
    green: "hover:border-emerald-300"
  };

  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 ${borderHoverClasses[accent] || borderHoverClasses.emerald}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-stone-900 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl border p-3.5 ${accentClasses[accent] || accentClasses.emerald}`}>
            <Icon size={24} className="stroke-[2.25]" />
          </div>
        )}
      </div>
    </div>
  );
}

