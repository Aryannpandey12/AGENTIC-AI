import { useState, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/helpers.js";
import { getCategoryMeta } from "./customerHelper.js";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const catMeta = getCategoryMeta(item?.category);
  const [imgSrc, setImgSrc] = useState(item?.image_url || catMeta.fallback);

  useEffect(() => {
    setImgSrc(item?.image_url || catMeta.fallback);
  }, [item?.image_url, catMeta.fallback]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border-2 border-[#E4A11B]/50 bg-[#F8F1E7] p-4 shadow-md transition hover:border-[#7B2D26]">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#3E2723] border border-[#E4A11B]">
          <img
            src={imgSrc}
            onError={() => setImgSrc(catMeta.fallback)}
            alt={item?.item_name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-[#3E2723] truncate text-sm sm:text-base font-desi-head">{item?.item_name}</h4>
          <p className="text-[11px] text-[#7B2D26] font-extrabold uppercase tracking-wider mt-0.5">{catMeta.badge}</p>
          <p className="mt-1 text-xs sm:text-sm font-black text-[#3D7A3A]">{formatCurrency(item?.price)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 shrink-0">
        <div className="flex items-center rounded-2xl border-2 border-[#7B2D26]/40 bg-[#FFF8EE] p-1 shadow-sm">
          <button
            onClick={() => onDecrease(item.item_id)}
            className="rounded-xl p-1.5 text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FFF8EE] active:scale-95 transition"
            aria-label="Decrease quantity"
          >
            <Minus size={14} className="stroke-[3]" />
          </button>
          <span className="w-8 text-center text-xs font-black text-[#3E2723]">{item.qty}</span>
          <button
            onClick={() => onIncrease(item.item_id)}
            className="rounded-xl p-1.5 text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FFF8EE] active:scale-95 transition"
            aria-label="Increase quantity"
          >
            <Plus size={14} className="stroke-[3]" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <p className="w-20 text-right font-black text-[#7B2D26] text-sm sm:text-base">
            {formatCurrency(item.price * item.qty)}
          </p>
          <button
            onClick={() => onRemove(item.item_id)}
            className="rounded-2xl p-2 text-red-700 hover:bg-red-100 transition active:scale-95"
            aria-label="Remove item"
            title="थाली से हटाएँ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
