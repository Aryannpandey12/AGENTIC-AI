import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading", fullHeight = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 p-6 text-stone-600 ${fullHeight ? "min-h-[50vh]" : "min-h-40"}`}>
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-3 shadow-sm">
        <Loader2 className="animate-spin text-emerald-700" size={20} />
        <span className="text-sm font-semibold text-stone-700">{label}...</span>
      </div>
    </div>
  );
}

