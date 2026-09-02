import { PackageOpen } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description, action, icon: Icon = PackageOpen }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm max-w-lg mx-auto my-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-50 text-stone-400">
        <Icon size={30} className="stroke-[1.5]" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-stone-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-stone-500 leading-relaxed">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

