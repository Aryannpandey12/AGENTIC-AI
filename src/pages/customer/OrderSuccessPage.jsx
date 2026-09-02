import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronRight, Copy, Sparkles, Utensils } from "lucide-react";

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = location.state?.orderId || location.state?.order_id || searchParams.get("order_id");
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center min-h-[75vh] py-12 bg-[#FFF8EE]">
      <div className="mx-auto max-w-lg w-full rounded-3xl border-4 border-[#E4A11B] bg-[#F8F1E7] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top glowing celebration halo */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#E4A11B]/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#3D7A3A] text-white shadow-xl ring-8 ring-[#3D7A3A]/20 mb-6 animate-bounce text-4xl">
            🎉
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-[#E4A11B]/30 border border-[#E4A11B] px-4 py-1.5 text-xs font-black tracking-wider text-[#7B2D26] uppercase shadow-sm">
            <Sparkles size={14} className="text-[#7B2D26]" />
            <span>माँ की रसोई में तैयारी शुरू</span>
          </span>
          
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-[#7B2D26] tracking-tight font-desi-head">बधाई हो! ऑर्डर दर्ज हो गया है</h1>
          <p className="mt-3 text-sm text-[#3E2723] max-w-sm mx-auto font-bold leading-relaxed">
            आपका ऑर्डर माँ की रसोई तक पहुँच गया है। मिट्टी की हांडी में पारंपरिक तरीके से आपका भोजन तैयार किया जा रहा है।
          </p>

          {orderId ? (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-[#7B2D26] bg-[#FFF8EE] p-5 text-center relative group shadow-inner">
              <span className="block text-xs font-black uppercase tracking-widest text-[#7B2D26] font-desi-head">आपका ऑर्डर टिकट नंबर (Ticket ID)</span>
              
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#3E2723] tracking-wider select-all">
                  {orderId}
                </span>
                <button
                  onClick={copyRef}
                  className="p-2.5 rounded-xl bg-[#F8F1E7] hover:bg-[#E4A11B] text-[#7B2D26] hover:text-[#3E2723] transition shadow-sm active:scale-95"
                  title="Copy Ticket ID"
                >
                  <Copy size={18} />
                </button>
              </div>

              {copied && (
                <span className="absolute -top-3 right-6 rounded-md bg-[#7B2D26] px-2 py-0.5 text-[10px] font-black text-white shadow">
                  Copied!
                </span>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border-2 border-[#E4A11B] bg-[#FFF8EE] p-4 text-xs text-[#7B2D26] font-black">
              ऑर्डर कन्फर्म हो चुका है। लाइव ट्रैकिंग पैनल से स्थिति देखें।
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-2">
            {orderId ? (
              <Link
                to={`/track-order?order_id=${encodeURIComponent(orderId)}`}
                state={{ orderId, order_id: orderId }}
                className="flex-1 py-4 rounded-2xl flex items-center justify-center font-black text-sm tracking-wide bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-xl hover:scale-102 transition-all font-desi-head border-2 border-[#7B2D26]"
              >
                <span>ऑर्डर ट्रैक करें (Track Flow)</span>
                <ChevronRight size={18} className="stroke-[3] ml-1" />
              </Link>
            ) : (
              <Link
                to="/track-order"
                className="flex-1 py-4 rounded-2xl flex items-center justify-center font-black text-sm tracking-wide bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-xl hover:scale-102 transition-all font-desi-head border-2 border-[#7B2D26]"
              >
                <span>ट्रैकर पर जाएं</span>
              </Link>
            )}
            
            <Link
              to="/menu"
              className="flex-1 py-4 rounded-2xl flex items-center justify-center font-black text-sm tracking-wide bg-[#FFF8EE] text-[#7B2D26] border-2 border-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FFF8EE] transition-all font-desi-head shadow-md"
            >
              और व्यंजन ऑर्डर करें
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
