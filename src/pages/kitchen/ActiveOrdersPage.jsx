import { useEffect, useMemo, useState } from "react";
import { Check, Flame, Package, Radio, RefreshCw, Truck } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import OrderCard from "../../components/orders/OrderCard.jsx";
import { orderApi } from "../../services/api.js";
import { normalizeApiList } from "../../utils/helpers.js";
import { isActiveOrder } from "../../utils/orderStatus.js";

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getKitchenOrders();
      const apiData = normalizeApiList(response);
      setOrders(apiData || []);
    } catch (err) {
      console.error("Failed to fetch live active orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 8000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, action) => {
    setUpdatingId(orderId);
    try {
      await orderApi.updateOrderStatus({ order_id: orderId, action });
      await fetchOrders();
    } catch (err) {
      console.error("Failed server status update:", err);
    } finally {
      setUpdatingId("");
    }
  };

  const activeOrders = useMemo(() => orders.filter(isActiveOrder), [orders]);

  const renderPipelineActions = (order) => {
    const oStatus = order.order_status || "";
    const kStatus = order.kitchen_status || "";
    const dStatus = order.delivery_status || "";

    const isDeliveredCompleted = dStatus === "Delivered" || oStatus === "Delivered" || oStatus === "Completed";
    const isOutForDeliveryCompleted = isDeliveredCompleted || dStatus === "Out for Delivery" || oStatus === "Out for Delivery";
    const isReadyCompleted = isOutForDeliveryCompleted || kStatus === "Ready" || oStatus === "Ready";
    const isPreparingCompleted = isReadyCompleted || kStatus === "Preparing" || oStatus === "Preparing";

    const nextStep =
      !isPreparingCompleted ? "preparing" :
      !isReadyCompleted ? "ready" :
      !isOutForDeliveryCompleted ? "out_for_delivery" :
      !isDeliveredCompleted ? "delivered" : null;

    const buttons = [
      { label: "Preparing 🔥", action: "preparing", completed: isPreparingCompleted, next: nextStep === "preparing", color: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20" },
      { label: "Ready 🎒", action: "ready", completed: isReadyCompleted, next: nextStep === "ready", color: "bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-teal-400/20" },
      { label: "Out for Delivery 🛵", action: "out_for_delivery", completed: isOutForDeliveryCompleted, next: nextStep === "out_for_delivery", color: "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20" },
      { label: "Delivered ✓", action: "delivered", completed: isDeliveredCompleted, next: nextStep === "delivered", color: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20" }
    ];

    return (
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {buttons.map((btn) => {
          if (btn.completed) {
            return (
              <span
                key={btn.action}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2 text-xs font-bold text-slate-500 select-none"
              >
                <Check size={13} className="text-emerald-500 shrink-0" />
                <span className="line-through opacity-75">{btn.label.split(" ")[0]}</span>
              </span>
            );
          }

          if (btn.next) {
            return (
              <button
                key={btn.action}
                disabled={updatingId !== ""}
                onClick={() => updateStatus(order.order_id, btn.action)}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider shadow-lg transition active:scale-95 animate-pulse ${btn.color}`}
              >
                <span>{updatingId === order.order_id ? "Saving..." : `Click -> ${btn.label}`}</span>
              </button>
            );
          }

          return (
            <button
              key={btn.action}
              disabled
              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-xs font-bold text-slate-600 cursor-not-allowed opacity-50"
            >
              <span>{btn.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-sky-400">
            <Flame size={13} className="text-sky-400" />
            Active Cooking Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Active Prep & Dispatch Board ({activeOrders.length})
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Advance tickets through preparation milestones to trigger webhook rider notifications.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition active:scale-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Sync Board</span>
        </button>
      </div>

      {loading && <LoadingSpinner label="Loading active KDS tickets..." fullHeight />}

      {!loading && activeOrders.length === 0 && (
        <div className="py-20 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 mx-auto text-3xl">
            🍳
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">Zero Tickets in Active Cooking</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
            Accept incoming web orders from the "New Incoming" tab to populate this cooking workflow board.
          </p>
        </div>
      )}

      {!loading && activeOrders.length > 0 && (
        <div className="space-y-5">
          {activeOrders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              variant="kitchen"
              actions={renderPipelineActions(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
