import { getStatusTone } from "../../utils/orderStatus.js";

const toneClasses = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/10",
  stone: "bg-stone-50 text-stone-600 ring-stone-600/10"
};

const dotClasses = {
  green: "bg-emerald-600",
  amber: "bg-amber-600",
  red: "bg-red-600",
  blue: "bg-sky-600",
  stone: "bg-stone-500"
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const tone = getStatusTone(status);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone] || toneClasses.stone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone] || dotClasses.stone}`} />
      {status}
    </span>
  );
}

