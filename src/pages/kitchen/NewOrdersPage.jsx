import { useEffect, useMemo, useState } from "react";
import { Ban, Check, Clock, Printer, Radio, RefreshCw } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import OrderCard from "../../components/orders/OrderCard.jsx";
import { orderApi } from "../../services/api.js";
import { normalizeApiList } from "../../utils/helpers.js";
import { isNewOrder } from "../../utils/orderStatus.js";

export default function NewOrdersPage() {
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
      console.error("Failed to fetch live new orders:", err);
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

  const newOrders = useMemo(() => orders.filter(isNewOrder), [orders]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-400">
              <Radio size={13} className="animate-ping" />
              Incoming Acceptance Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Placed Tickets Awaiting Review ({newOrders.length})
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Accept orders immediately to route ticket instructions to hot cooking stations.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition active:scale-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Sync Now</span>
        </button>
      </div>

      {loading && <LoadingSpinner label="Polling KDS incoming server queue..." fullHeight />}

      {!loading && newOrders.length === 0 && (
        <div className="py-20 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto text-3xl">
            🔔
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">Queue is Completely Caught Up!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
            There are zero unconfirmed customer tickets right now. The buzzer will sound when a customer checks out on the web app.
          </p>
        </div>
      )}

      {!loading && newOrders.length > 0 && (
        <div className="grid gap-6">
          {newOrders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              variant="kitchen"
              actions={
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    disabled={updatingId !== ""}
                    onClick={() => updateStatus(order.order_id, "reject")}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white active:scale-95 transition disabled:opacity-50"
                  >
                    <Ban size={15} />
                    <span>{updatingId === order.order_id ? "..." : "Reject Ticket"}</span>
                  </button>

                  <button
                    disabled={updatingId !== ""}
                    onClick={() => updateStatus(order.order_id, "accept")}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-95 transition disabled:opacity-50"
                  >
                    <Printer size={16} className="stroke-[2.5]" />
                    <span>{updatingId === order.order_id ? "Printing..." : "Accept & Print POS"}</span>
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
