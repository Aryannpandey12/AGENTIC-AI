import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Clock, Compass, MapPin, Phone, Radio, RefreshCw, Search, ShieldCheck, ShoppingBag, Truck, User, UtensilsCrossed } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { orderApi } from "../../services/api.js";
import { formatCurrency, getOrderTotal, normalizeApiObject, normalizeOrderResponse } from "../../utils/helpers.js";
import OrderTimeline from "../../components/orders/OrderTimeline.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function TrackOrderPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(
    location.state?.orderId || location.state?.order_id || searchParams.get("order_id") || ""
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const trackOrder = async (id = orderId) => {
    const trimmedId = id?.trim();
    if (!trimmedId) return;

    setSearchParams({ order_id: trimmedId });

    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      setOrder(null);
      setSearched(true);

      const response = await orderApi.trackOrder(trimmedId);
      const data = normalizeApiObject(response);

      if (!data || data.success === false || data.found === false || data.error === "not_found") {
        setNotFound(true);
        setError(data?.message || "Order ticket not found");
      } else {
        const normalized = normalizeOrderResponse(data);
        if (normalized) {
          setOrder(normalized);
        } else {
          setNotFound(true);
        }
      }
    } catch (err) {
      setNotFound(true);
      setError(
        err?.response?.data?.message ||
          "We encountered an error locating this order ticket. Please verify your ID."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = location.state?.orderId || location.state?.order_id || searchParams.get("order_id");
    if (initialId) {
      setOrderId(initialId);
      trackOrder(initialId);
    }
  }, [searchParams, location.state]);

  const grandTotal = order ? Number(order.total_amount || getOrderTotal(order)) : 0;
  const itemsSubtotal = order
    ? (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0)
    : 0;
  const deliveryFee = grandTotal > itemsSubtotal ? 35 : 0;
  const packagingFee = grandTotal > itemsSubtotal ? 25 : 0;

  // Status descriptive headline helper
  const getLiveHeadline = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "rejected") return { title: "ऑर्डर रद्द हुआ (Cancelled)", desc: "क्षमा करें, किसी कारणवश रसोई से यह ऑर्डर रद्द कर दिया गया है।", tone: "red" };
    if (s === "completed" || s === "delivered") return { title: "भोजन पहुँच गया! (Delivered)", desc: "माँ के हाथों का गरमा-गरम खाना आपके घर पहुँच गया है। आनंद लें!", tone: "green" };
    if (s === "out for delivery") return { title: "रास्ते में है 🛵 (Out for Delivery)", desc: "डिलीवरी पार्टनर हांडी लेकर आपके घर की ओर निकल चुके हैं।", tone: "blue" };
    if (s === "ready") return { title: "पैकिंग तैयार है 🎒 (Ready)", desc: "रसोई में खाना पारंपरिक तरीके से पैक कर दिया गया है। राइडर का इंतज़ार है।", tone: "teal" };
    if (s === "preparing") return { title: "धीमी आंच पर पक रहा है 🔥 (Cooking)", desc: "माँ की रसोई में ताज़ा मसाला भूनकर आपका स्वादिष्ट भोजन तैयार किया जा रहा है।", tone: "amber" };
    return { title: "ऑर्डर रसोई में प्राप्त हुआ 📋 (Received)", desc: "आपका ऑर्डर माँ की रसोई में पहुँच गया है और जल्द ही तैयारी शुरू होगी।", tone: "amber" };
  };

  const liveMeta = order ? getLiveHeadline(order.order_status) : null;

  return (
    <div className="page-shell space-y-8 bg-[#FFF8EE] pt-6 pb-16">
      {/* Tracker Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#7B2D26] px-6 py-10 text-[#FFF8EE] shadow-xl sm:px-10 border-4 border-[#E4A11B]">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E4A11B] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#3E2723] shadow-sm">
            <Radio size={14} className="animate-pulse text-[#7B2D26]" />
            <span>लाइव रसोई ट्रैकिंग (Live Kitchen Tracking)</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl font-desi-head">
            अपने व्यंजन की स्थिति जानें
          </h1>
          <p className="text-sm text-[#FFF8EE]/90 font-bold leading-relaxed">
            अपना ऑर्डर टिकट नंबर (Ticket ID) नीचे दर्ज करें और जानें कि माँ की रसोई में आपका भोजन किस चरण में है।
          </p>
        </div>
      </div>

      {/* Tracker Search Bar Shell */}
      <div className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 shadow-md max-w-2xl">
        <form onSubmit={(e) => { e.preventDefault(); trackOrder(); }} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-[#7B2D26]" size={20} />
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="जैसे: ORD-12345"
              className="w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] pl-12 pr-4 py-3.5 text-base font-mono font-bold uppercase tracking-wider text-[#3E2723] outline-none focus:border-[#7B2D26] focus:ring-2 focus:ring-[#E4A11B]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="rounded-2xl px-8 py-3.5 font-black text-sm uppercase tracking-wider bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-md transition duration-300 font-desi-head border-2 border-[#7B2D26] cursor-pointer disabled:opacity-50"
          >
            {loading ? "खोजा जा रहा है..." : "ट्रैक करें (Track)"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-12">
          <LoadingSpinner label="माँ की रसोई से जानकारी ली जा रही है..." fullHeight />
        </div>
      )}

      {!loading && error && (
        <div className="max-w-2xl">
          <EmptyState title="ट्रैकिंग सूचना" description={error} icon={UtensilsCrossed} />
        </div>
      )}

      {!loading && notFound && (
        <div className="max-w-2xl">
          <EmptyState
            title="ऑर्डर टिकट नहीं मिला"
            description={`हमें आईडी "${orderId}" से जुड़ा कोई सक्रिय ऑर्डर नहीं मिला। कृपया अपना टिकट नंबर दोबारा जांचें।`}
            icon={Search}
          />
        </div>
      )}

      {!searched && !order && !loading && (
        <div className="max-w-2xl py-8">
          <EmptyState
            title="टिकट नंबर दर्ज करें"
            description="लाइव ट्रैकिंग शुरू करने के लिए ऊपर अपना ऑर्डर टिकट नंबर (जैसे ORD-XXXX) दर्ज करें।"
            icon={ShoppingBag}
          />
        </div>
      )}

      {order && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Live Status Highlight Card */}
          <div className="rounded-3xl border-4 border-[#E4A11B] bg-[#7B2D26] p-6 sm:p-8 text-[#FFF8EE] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E4A11B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E4A11B]" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-[#E4A11B] font-desi-head">लाइव रसोई स्थिति (Live Status)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-desi-head">{liveMeta?.title}</h2>
              <p className="text-sm text-[#FFF8EE]/90 font-bold max-w-xl leading-relaxed">{liveMeta?.desc}</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 relative z-10 shrink-0 bg-[#FFF8EE]/10 backdrop-blur px-5 py-4 rounded-2xl border border-[#E4A11B]/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E4A11B]">वर्तमान स्थिति</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.order_status} />
              </div>
              <button onClick={() => trackOrder()} className="mt-2 text-xs font-black text-[#E4A11B] hover:underline flex items-center gap-1.5 transition cursor-pointer">
                <RefreshCw size={14} className="animate-spin-slow" />
                <span>ताज़ा करें (Refresh)</span>
              </button>
            </div>
          </div>

          {/* Detailed 2-Column Grid */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Timeline & Recipient */}
            <div className="lg:col-span-7 space-y-6">
              {/* Timeline Card */}
              <div className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#E4A11B]/30 pb-4">
                  <h3 className="text-xl font-black text-[#7B2D26] font-desi-head flex items-center gap-2">
                    <span>🍳</span> तैयारी और डिलीवरी का सफर
                  </h3>
                  <span className="text-xs font-mono font-black text-[#FFF8EE] bg-[#3D7A3A] px-3 py-1 rounded-xl shadow-sm">माँ की रसोई</span>
                </div>
                <OrderTimeline order={order} />
              </div>

              {/* Recipient Coordinates Card */}
              <div className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-md space-y-5">
                <h3 className="text-xl font-black text-[#7B2D26] font-desi-head border-b-2 border-[#E4A11B]/30 pb-4 flex items-center gap-2">
                  <span>🏠</span> डिलीवरी का पता (Destination)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 pt-1">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE]">
                      <User size={18} />
                    </span>
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-wider text-[#7B2D26]">प्राप्तकर्ता (Name)</span>
                      <span className="block font-black text-[#3E2723] text-sm mt-0.5">{order.customer_name}</span>
                    </div>
                  </div>

                  {order.phone && (
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE]">
                        <Phone size={18} />
                      </span>
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-wider text-[#7B2D26]">संपर्क नंबर (Phone)</span>
                        <span className="block font-black text-[#3E2723] text-sm mt-0.5">{order.phone}</span>
                      </div>
                    </div>
                  )}

                  {order.address && (
                    <div className="sm:col-span-2 flex items-start gap-3.5 pt-3 border-t-2 border-[#E4A11B]/30">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE] mt-1">
                        <MapPin size={18} />
                      </span>
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-wider text-[#7B2D26]">पूरा पता (Address)</span>
                        <span className="block font-bold text-[#3E2723] text-sm mt-0.5 leading-relaxed">{order.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Itemized Ticket Bill Summary */}
            <aside className="lg:col-span-5 rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#E4A11B]/30 pb-4">
                <h3 className="text-xl font-black text-[#7B2D26] font-desi-head flex items-center gap-2">
                  <span>🧾</span> बिल विवरण
                </h3>
                <span className="font-mono text-xs font-black bg-[#E4A11B] text-[#3E2723] px-3 py-1 rounded-xl shadow-sm">
                  {order.order_id}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-[#E4A11B]/20 pr-1 space-y-2.5 scrollbar-none">
                {(order.items || []).map((item) => (
                  <div key={item.item_id} className="flex justify-between items-start gap-3 pt-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#7B2D26] font-mono">{item.qty}x</span>
                      <span className="font-bold text-[#3E2723] leading-tight">{item.item_name}</span>
                    </div>
                    <span className="font-black text-[#3D7A3A] shrink-0">
                      {formatCurrency(Number(item.price || 0) * Number(item.qty || 0))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t-2 border-[#E4A11B]/30 pt-4 space-y-3 text-xs text-[#3E2723] font-bold">
                <div className="flex justify-between">
                  <span>व्यंजन मूल्य (Subtotal)</span>
                  <span className="font-black text-[#3E2723]">{formatCurrency(itemsSubtotal)}</span>
                </div>
                {packagingFee > 0 && (
                  <div className="flex justify-between">
                    <span>पारंपरिक पैकेजिंग शुल्क</span>
                    <span className="font-black text-[#3E2723]">{formatCurrency(packagingFee)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>डिलीवरी शुल्क</span>
                    <span className="font-black text-[#3E2723]">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}

                <div className="border-t-2 border-[#E4A11B]/40 pt-4 flex justify-between items-center">
                  <span className="text-lg font-black text-[#7B2D26] font-desi-head">कुल भुगतान (Total)</span>
                  <span className="text-2xl font-black text-[#3D7A3A]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Footer info badges */}
              <div className="pt-3 border-t-2 border-[#E4A11B]/30 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-[#FFF8EE] p-3.5 border border-[#E4A11B]">
                  <span className="block text-[10px] font-black uppercase text-[#7B2D26]">भुगतान का माध्यम</span>
                  <span className="block font-black text-[#3E2723] mt-0.5">{order.payment_mode || "COD"}</span>
                </div>
                <div className="rounded-2xl bg-[#FFF8EE] p-3.5 border border-[#E4A11B] flex flex-col items-end">
                  <span className="block text-[10px] font-black uppercase text-[#7B2D26] mb-0.5">रसोई स्थिति</span>
                  <StatusBadge status={order.kitchen_status || "Queued"} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
