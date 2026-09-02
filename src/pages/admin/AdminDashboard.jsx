import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, ClipboardList, Utensils, Zap } from "lucide-react";
import StatsCard from "../../components/common/StatsCard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import OrderCard from "../../components/orders/OrderCard.jsx";
import { menuApi, orderApi } from "../../services/api.js";
import { formatCurrency, getOrderTotal, normalizeApiList } from "../../utils/helpers.js";

export default function AdminDashboard() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [menuRes, ordersRes] = await Promise.all([menuApi.getMenu(), orderApi.getKitchenOrders()]);
        setMenu(normalizeApiList(menuRes) || []);
        setOrders(normalizeApiList(ordersRes) || []);
      } catch (err) {
        console.error("Admin dashboard telemetry load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner label="Compiling executive enterprise metrics..." fullHeight />
      </div>
    );
  }

  const activeCatalog = menu.filter((i) => i.available === true || String(i.available).toLowerCase() === "true");
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const recentOrders = [...orders].reverse().slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Executive Operations HQ
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Real-time business telemetry across all cloud kitchen cooking stations and delivery networks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/menu"
            className="btn-primary rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            + Add New Dish
          </Link>
          <Link
            to="/admin/orders"
            className="btn-secondary rounded-xl px-5 py-2.5 text-xs font-bold"
          >
            Audit All Orders
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Gross Platform Revenue" value={formatCurrency(totalRevenue)} icon={Banknote} accent="emerald" />
        <StatsCard title="Total Dispatched Orders" value={totalOrdersCount} icon={ClipboardList} accent="blue" />
        <StatsCard title="Catalog Size" value={menu.length} icon={Utensils} accent="amber" />
        <StatsCard title="Active Dishes Sizzling" value={activeCatalog.length} icon={Zap} accent="green" />
      </div>

      {/* Quick Status Distribution Bar */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide text-xs">Platform Health Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Catalog Availability</span>
            <p className="text-2xl font-black text-emerald-900 mt-1">{Math.round((activeCatalog.length / (menu.length || 1)) * 100)}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">Average Dish Price</span>
            <p className="text-2xl font-black text-sky-900 mt-1">{formatCurrency(menu.reduce((acc, i) => acc + Number(i.price || 0), 0) / (menu.length || 1))}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Avg Ticket Value</span>
            <p className="text-2xl font-black text-amber-950 mt-1">{formatCurrency(totalRevenue / (totalOrdersCount || 1))}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Cooking Hubs</span>
            <p className="text-2xl font-black text-purple-900 mt-1">14 Hubs</p>
          </div>
        </div>
      </section>

      {/* Recent Enterprise Orders Feed */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Recent Dispatched Tickets</h2>
            <p className="text-xs font-bold text-slate-400">Real-time enterprise monitoring of customer orders</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-extrabold text-emerald-600 hover:underline">
            View Enterprise Table &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-400">No orders logged in Google Sheets backend yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard key={order.order_id} order={order} variant="admin" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
