import { Calendar, Clock, MapPin, Phone, ReceiptText, User } from "lucide-react";
import { formatCurrency, formatDate, getOrderTotal } from "../../utils/helpers.js";
import StatusBadge from "../common/StatusBadge.jsx";

export default function OrderCard({ order, actions, variant = "kitchen" }) {
  const totalAmount = getOrderTotal(order);
  const items = order.items || [];
  const isKitchen = variant === "kitchen";

  return (
    <article
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isKitchen
          ? "border-slate-800 bg-slate-900/90 text-white shadow-xl shadow-black/20 hover:border-slate-700"
          : "border-slate-200/80 bg-white text-slate-900 shadow-2xs hover:shadow-md hover:border-slate-300"
      }`}
    >
      {/* Ticket Header */}
      <div className={`flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between ${isKitchen ? "border-slate-800" : "border-slate-100"}`}>
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono font-black text-sm shadow-sm ${
                isKitchen
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
                  : "bg-slate-900 text-white"
              }`}
            >
              <ReceiptText size={18} />
            </span>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest block ${isKitchen ? "text-amber-400" : "text-slate-400"}`}>
                Ticket ID
              </span>
              <h3 className="text-lg font-black font-mono tracking-wider">{order.order_id}</h3>
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${isKitchen ? "text-slate-200" : "text-slate-800"}`}>
              <User size={14} className={isKitchen ? "text-amber-400" : "text-slate-400"} />
              <span>{order.customer_name}</span>
            </div>
            {order.phone && (
              <div className={`flex items-center gap-1.5 ${isKitchen ? "text-slate-400 font-mono" : "text-slate-500"}`}>
                <Phone size={13} className={isKitchen ? "text-slate-500" : "text-slate-400"} />
                <span>{order.phone}</span>
              </div>
            )}
          </div>

          {order.address && (
            <div className={`mt-2 flex items-start gap-1.5 text-xs font-medium max-w-xl ${isKitchen ? "text-slate-400" : "text-slate-500"}`}>
              <MapPin size={13} className="shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-relaxed">{order.address}</span>
            </div>
          )}
        </div>

        {/* Status flags */}
        <div className="flex flex-wrap gap-1.5 sm:flex-col sm:items-end shrink-0">
          <span className={`text-[10px] font-black uppercase tracking-widest mb-0.5 hidden sm:block ${isKitchen ? "text-slate-500" : "text-slate-400"}`}>
            Telemetry State
          </span>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={order.order_status} />
            {order.kitchen_status && <StatusBadge status={order.kitchen_status} />}
          </div>
        </div>
      </div>

      {/* Ticket Body: Items List */}
      <div className="mt-4.5">
        <span className={`text-[11px] font-black uppercase tracking-widest block mb-2.5 ${isKitchen ? "text-amber-400/90" : "text-slate-400"}`}>
          Order Items ({items.reduce((acc, i) => acc + Number(i.qty || 1), 0)} Qty)
        </span>

        <div className={`divide-y rounded-xl border p-3 ${isKitchen ? "divide-slate-800/80 border-slate-800 bg-slate-950/50" : "divide-slate-100 border-slate-100 bg-slate-50/50"}`}>
          {items.map((item) => (
            <div key={`${order.order_id}-${item.item_id}`} className="flex justify-between items-center gap-4 py-2 text-sm font-bold">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-black shrink-0 ${isKitchen ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-100 text-emerald-800"}`}>
                  {item.qty}x
                </span>
                <span className={`truncate ${isKitchen ? "text-slate-100 text-base" : "text-slate-800"}`}>
                  {item.item_name}
                </span>
              </div>
              <span className={`font-mono shrink-0 ${isKitchen ? "text-slate-300 font-semibold" : "text-slate-900"}`}>
                {formatCurrency(Number(item.price || 0) * Number(item.qty || 0))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Footer & Actions */}
      <div className={`mt-5 flex flex-col gap-4 pt-4 border-t sm:flex-row sm:items-center sm:justify-between ${isKitchen ? "border-slate-800" : "border-slate-100"}`}>
        <div className={`flex flex-wrap items-center gap-3 text-xs font-medium ${isKitchen ? "text-slate-400" : "text-slate-500"}`}>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{formatDate(order.created_at)}</span>
          </div>
          <span>•</span>
          <div>
            <span>Paid: </span>
            <strong className={`font-mono font-black text-sm ${isKitchen ? "text-emerald-400" : "text-emerald-700"}`}>
              {formatCurrency(totalAmount)}
            </strong>
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </article>
  );
}
