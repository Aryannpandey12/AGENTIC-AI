import { useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCw, Search } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { orderApi } from "../../services/api.js";
import { formatCurrency, formatDate, getOrderTotal, normalizeApiList } from "../../utils/helpers.js";

export default function OrdersOverviewPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getKitchenOrders();
      setOrders(normalizeApiList(response) || []);
    } catch (err) {
      console.error("Enterprise orders load error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statuses = useMemo(() => ["ALL", ...new Set(orders.map((o) => o.order_status).filter(Boolean))], [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        String(o.order_id).toLowerCase().includes(q) ||
        String(o.customer_name).toLowerCase().includes(q) ||
        String(o.phone).includes(q);
      const matchStatus = statusFilter === "ALL" || o.order_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Global Enterprise Order Logs
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Auditable database of all historical transactions, fulfillment statuses, and gross INR billings.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn-secondary px-4 py-2.5 text-xs font-bold"
        >
          <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ticket or phone..."
            className="form-input pl-10 py-2 bg-slate-50 text-xs"
          />
        </div>
      </div>

      {loading && <LoadingSpinner label="Compiling database order audit logs..." fullHeight />}

      {!loading && filteredOrders.length === 0 && (
        <EmptyState title="No Logged Orders" description="No orders match your filter criteria right now." icon={ClipboardList} />
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-3">Ticket ID</th>
                  <th className="py-4 px-3">Customer Info</th>
                  <th className="py-4 px-3">Items Count</th>
                  <th className="py-4 px-3">Total (INR)</th>
                  <th className="py-4 px-3">Payment</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 pl-3 pr-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredOrders.map((order) => {
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + Number(i.qty || 1), 0);
                  const total = getOrderTotal(order);
                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 pl-6 pr-3 font-mono font-black text-slate-900 text-sm">
                        {order.order_id}
                      </td>

                      <td className="py-4 px-3">
                        <span className="font-bold text-slate-800 block">{order.customer_name}</span>
                        {order.phone && <span className="font-mono text-[10px] text-slate-400 font-medium">{order.phone}</span>}
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-bold">
                        {itemsCount} Dishes
                      </td>

                      <td className="py-4 px-3 font-mono font-black text-emerald-700 text-sm">
                        {formatCurrency(total)}
                      </td>

                      <td className="py-4 px-3 font-mono font-bold text-slate-500">
                        {order.payment_mode || "COD"}
                      </td>

                      <td className="py-4 px-3">
                        <StatusBadge status={order.order_status} />
                      </td>

                      <td className="py-4 pl-3 pr-6 text-right text-[11px] text-slate-400 font-medium">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
