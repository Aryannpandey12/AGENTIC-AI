import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, CheckCircle2, Clock3, Flame, Radio, ReceiptText, RefreshCw } from "lucide-react";
import StatsCard from "../../components/common/StatsCard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import OrderCard from "../../components/orders/OrderCard.jsx";
import { orderApi } from "../../services/api.js";
import { normalizeApiList } from "../../utils/helpers.js";
import { isActiveOrder, isNewOrder } from "../../utils/orderStatus.js";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await orderApi.getKitchenOrders();
      const apiData = normalizeApiList(response);
      setOrders(apiData || []);
    } catch (err) {
      console.error("Failed to fetch live kitchen orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Connecting to KDS ticket stream..." fullHeight />
      </div>
    );
  }

  const placedOrders = orders.filter(isNewOrder);
  const activeOrders = orders.filter(isActiveOrder);
  const completedOrders = orders.filter((o) => o.order_status === "Completed" || o.order_status === "Delivered");
  const rejectedOrders = orders.filter((o) => o.order_status === "Rejected");
  const recentIncoming = [...orders].filter((o) => o.order_status !== "Delivered" && o.order_status !== "Completed").slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>OPERATIONAL KITCHEN HUD</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Live Ticket Telemetry • Hub #04 Master Kitchen Display System
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition shadow-sm active:scale-95"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "Polling Stream..." : "Manual Sync Now"}</span>
        </button>
      </div>

      {/* Operational Counter Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Shift Tickets</span>
            <p className="text-3xl font-black font-mono text-white mt-1">{orders.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800 text-slate-300"><ReceiptText size={22} /></div>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-center justify-between shadow-lg ring-1 ring-amber-500/20">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Awaiting Accept</span>
            <p className="text-3xl font-black font-mono text-amber-400 mt-1">{placedOrders.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400 animate-bounce"><Clock3 size={22} /></div>
        </div>

        <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-5 flex items-center justify-between shadow-lg ring-1 ring-sky-500/20">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Active Cooking</span>
            <p className="text-3xl font-black font-mono text-sky-400 mt-1">{activeOrders.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-sky-500/20 text-sky-400"><Flame size={22} /></div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Completed Logs</span>
            <p className="text-3xl font-black font-mono text-emerald-400 mt-1">{completedOrders.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400"><CheckCircle2 size={22} /></div>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Rejected Tickets</span>
            <p className="text-3xl font-black font-mono text-red-400 mt-1">{rejectedOrders.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-red-500/20 text-red-400"><Ban size={22} /></div>
        </div>
      </div>

      {/* Quick Jump Action Queue */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">Actionable Queue Monitor</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Jump directly to status-filtered operational workflow queues</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/kitchen/new-orders"
              className="relative flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
            >
              <span>Accept Queue</span>
              {placedOrders.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-[11px] font-mono">
                  {placedOrders.length}
                </span>
              )}
            </Link>

            <Link
              to="/kitchen/active-orders"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 active:scale-95 transition"
            >
              <span>Cooking Pipeline</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sky-900 text-[11px] font-mono">
                {activeOrders.length}
              </span>
            </Link>
          </div>
        </div>

        {/* Live Feed Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-1">
            <h3 className="text-lg font-black tracking-tight text-slate-200">Live Unresolved Tickets Feed</h3>
            <span className="text-xs font-mono font-bold text-amber-400">● REALTIME AUTO-REFRESH</span>
          </div>

          {recentIncoming.length === 0 ? (
            <div className="py-16 bg-slate-900/50 rounded-3xl border border-slate-800/80 text-center space-y-3">
              <span className="text-4xl block">✨</span>
              <h4 className="text-lg font-black text-white">All Clear on KDS!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                There are currently no unresolved tickets in the cooking station. New web orders will pop up here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIncoming.map((order) => (
                <OrderCard key={order.order_id} order={order} variant="kitchen" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
