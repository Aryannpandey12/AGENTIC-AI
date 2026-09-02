import { useState, useEffect } from "react";
import { Clock, Plus, Star, X, Info } from "lucide-react";
import { formatCurrency } from "../../utils/helpers.js";
import { getCategoryMeta, checkIsAvailable, getItemDescription } from "./customerHelper.js";

export default function MenuCard({ item, onAdd }) {
  const available = checkIsAvailable(item);
  const catMeta = getCategoryMeta(item?.category);
  const isBestseller = String(item?.category || "").toLowerCase().includes("bestseller") || Number(item?.price) > 280;
  const isVeg = !String(`${item?.item_name} ${item?.category}`).toLowerCase().match(/chicken|mutton|fish|prawn|egg|non-veg/);
  
  const [imgSrc, setImgSrc] = useState(item?.image_url || catMeta.fallback);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setImgSrc(item?.image_url || catMeta.fallback);
  }, [item?.image_url, catMeta.fallback]);

  const descVal = item?.description || getItemDescription(item);
  const displayDesc = (descVal && String(descVal).trim() !== "") ? String(descVal).trim() : "स्वादिष्ट घर का बना भोजन";

  return (
    <>
      <article className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#E4A11B]/50 bg-[#F8F1E7] shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#7B2D26] hover:shadow-2xl ${
        available ? "" : "opacity-60"
      }`}>
        {/* Food Image Container */}
        <div 
          onClick={() => setShowModal(true)}
          className="relative aspect-[16/11] w-full overflow-hidden bg-[#3E2723] cursor-pointer"
          title="पूरा विवरण देखने के लिए क्लिक करें (Click to view full details)"
        >
          <img
            src={imgSrc}
            onError={() => setImgSrc(catMeta.fallback)}
            alt={item?.item_name || "Food Item"}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              available ? "" : "grayscale brightness-75"
            }`}
            loading="lazy"
          />
          
          {/* Traditional Chef Recommended Ribbon */}
          {isBestseller && available && (
            <div className="absolute top-3 left-0 z-10">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#7B2D26] to-[#5C1F1A] px-3 py-1 text-[11px] font-black tracking-wide text-[#FFF8EE] shadow-lg border-y border-r border-[#E4A11B] rounded-r-full font-desi-head">
                <span>⭐</span> शेफ की पसंद (Chef Recommended)
              </span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-[#FFF8EE]/95 backdrop-blur px-2.5 py-1 text-xs font-black text-[#3E2723] shadow-md border border-[#E4A11B]">
            <Star size={12} className="fill-[#E4A11B] text-[#E4A11B]" />
            <span>4.{Math.floor(Number(item?.price || 150) % 6) + 3}</span>
          </div>

          {/* Sold out mask / Availability Badge */}
          {!available && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#3E2723]/75 backdrop-blur-xs z-20">
              <span className="rounded-2xl border-2 border-[#E4A11B] bg-[#7B2D26] px-5 py-2 text-xs font-black uppercase tracking-widest text-[#FFF8EE] shadow-2xl">
                Sold Out (आज उपलब्ध नहीं)
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Veg/Non-Veg Mark */}
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 p-[2px] bg-white ${isVeg ? "border-[#3D7A3A]" : "border-[#7B2D26]"}`} title={isVeg ? "100% शाकाहारी (Pure Veg)" : "मांसाहारी (Non-Veg)"}>
                    <span className={`h-full w-full rounded-full ${isVeg ? "bg-[#3D7A3A]" : "bg-[#7B2D26]"}`} />
                  </span>
                  
                  {/* Beautiful Category Badge */}
                  <span className="truncate rounded-md bg-[#E4A11B]/20 border border-[#E4A11B]/60 px-2 py-0.5 text-[11px] font-black tracking-wider text-[#7B2D26] font-desi-head">
                    {catMeta.badge}
                  </span>
                </div>

                <button 
                  onClick={() => setShowModal(true)}
                  className="text-[#7B2D26] hover:text-[#E4A11B] transition p-1 rounded-full hover:bg-[#7B2D26]/10 shrink-0"
                  title="विवरण देखें"
                >
                  <Info size={16} />
                </button>
              </div>

              <h3 
                onClick={() => setShowModal(true)}
                className="text-lg font-black tracking-tight text-[#3E2723] truncate group-hover:text-[#7B2D26] transition-colors cursor-pointer" 
                title={item?.item_name}
              >
                {item?.item_name}
              </h3>
            </div>
          </div>

          {/* Hindi Description (Exactly 2 lines clamped) */}
          <p 
            onClick={() => setShowModal(true)}
            className="text-xs text-[#3E2723]/85 line-clamp-2 leading-relaxed font-medium cursor-pointer hover:text-[#7B2D26] transition"
          >
            {displayDesc}
          </p>
          
          {/* Cooking Time & Price Row */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E4A11B]/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C3317]">
              <Clock size={14} className="text-[#E4A11B]" />
              <span>{item?.prep_time || "20"} मिनट (mins)</span>
            </div>

            <span className="text-xl font-black text-[#7B2D26] tracking-tight">
              {formatCurrency(item?.price)}
            </span>
          </div>

          {/* Large Add to Cart Button */}
          <div className="pt-2 mt-auto">
            <button
              disabled={!available}
              onClick={() => onAdd(item)}
              className="w-full relative inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B2D26] px-5 py-3.5 text-sm font-black tracking-wide text-[#FFF8EE] shadow-md transition-all duration-300 hover:bg-[#E4A11B] hover:text-[#3E2723] hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none border-2 border-[#7B2D26] hover:border-[#E4A11B]"
            >
              <Plus size={18} className="stroke-[3]" />
              <span className="font-desi-head text-base">{available ? "थाली में जोड़ें" : "Sold Out"}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Full Description Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-[#E4A11B] bg-[#FFF8EE] p-6 text-[#3E2723] shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#7B2D26] text-white font-black hover:bg-[#E4A11B] hover:text-[#3E2723] transition shadow-md"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border-2 border-[#E4A11B] bg-[#3E2723]">
              <img
                src={imgSrc}
                onError={() => setImgSrc(catMeta.fallback)}
                alt={item?.item_name}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="rounded-xl bg-[#7B2D26] px-3 py-1 text-xs font-black text-[#FFF8EE] border border-[#E4A11B] shadow-sm font-desi-head">
                  {catMeta.badge}
                </span>
                {!available && (
                  <span className="rounded-xl bg-red-700 px-3 py-1 text-xs font-black text-white shadow-sm">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#7B2D26] font-desi-head">{item?.item_name}</h3>
                <span className="text-2xl font-black text-[#3D7A3A]">{formatCurrency(item?.price)}</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[#5C3317] border-y border-[#E4A11B]/30 py-2.5">
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-[#E4A11B]" /> तैयारी का समय: {item?.prep_time || "20"} मिनट
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="fill-[#E4A11B] text-[#E4A11B]" /> शेफ रेटिंग: 4.8 / 5
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7B2D26]">व्यंजन विवरण (Full Description):</h4>
                <p className="text-sm font-medium text-[#3E2723] leading-relaxed bg-[#F8F1E7] p-4 rounded-2xl border border-[#E4A11B]/40">
                  {displayDesc}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={!available}
                onClick={() => {
                  onAdd(item);
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#7B2D26] px-6 py-4 text-base font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-desi-head border-2 border-[#7B2D26]"
              >
                <Plus size={20} className="stroke-[3]" />
                <span>{available ? "थाली में जोड़ें (Add to Cart)" : "Sold Out (उपलब्ध नहीं)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
