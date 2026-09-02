import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Search } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import OrderCard from "../../components/orders/OrderCard.jsx";
import { orderApi } from "../../services/api.js";
import { normalizeApiList } from "../../utils/helpers.js";

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getKitchenOrders();
      const apiData = normalizeApiList(response);
      setOrders(apiData || []);
    } catch (err) {
      console.error("Failed to fetch live completed orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const completedOrders = useMemo(() => {
    return orders
      .filter((o) => o.order_status === "Completed" || o.order_status === "Delivered" || o.delivery_status === "Delivered")
      .filter((o) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          String(o.order_id).toLowerCase().includes(q) ||
          String(o.customer_name).toLowerCase().includes(q) ||
          String(o.phone).includes(q)
        );
      });
  }, [orders, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
            <CheckCircle2 size={13} />
            Shift Historical Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Completed & Delivered Log ({completedOrders.length})
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Auditable record of dispatched tickets and fulfilled KDS telemetry states.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID or Customer..."
              className="form-input bg-slate-900 border-slate-800 text-white pl-9 py-2 text-xs focus:bg-slate-900"
            />
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-400 hover:text-white transition"
            title="Refresh Archive"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner label="Archiving KDS historical logs..." fullHeight />}

      {!loading && completedOrders.length === 0 && (
        <div className="py-20 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-3">
          <span className="text-4xl block">📦</span>
          <h3 className="text-xl font-black text-white">No Archive Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {search ? `No completed tickets match query "${search}".` : "No orders have reached delivered status during this shift."}
          </p>
        </div>
      )}

      {!loading && completedOrders.length > 0 && (
        <div className="space-y-4">
          {completedOrders.map((order) => (
            <OrderCard key={order.order_id} order={order} variant="kitchen" />
          ))}
        </div>
      )}
    </div>
  );
}
