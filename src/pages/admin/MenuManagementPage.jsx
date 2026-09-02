import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, RefreshCw, Search, UtensilsCrossed } from "lucide-react";
import MenuItemFormModal from "../../components/admin/MenuItemFormModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { menuApi } from "../../services/api.js";
import { formatCurrency, isAvailable, normalizeApiList } from "../../utils/helpers.js";

const fallbackImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

export default function MenuManagementPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [togglingId, setTogglingId] = useState("");

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuApi.getMenu();
      setMenu(normalizeApiList(response) || []);
    } catch (err) {
      console.error("Catalog load error:", err);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(() => ["All", ...new Set(menu.map((i) => i.category).filter(Boolean))], [menu]);

  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = `${item.item_name} ${item.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [menu, search, categoryFilter]);

  const handleToggleAvailable = async (item) => {
    const currentStatus = isAvailable(item);
    setTogglingId(item.item_id);
    try {
      await menuApi.updateMenuItem({
        ...item,
        available: !currentStatus
      });
      await loadMenu();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId("");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Catalog & Pricing Control
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Create new gourmet offerings, adjust INR pricing, and toggle instant KDS availability.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadMenu}
            disabled={loading}
            className="btn-secondary px-3.5 py-2.5"
            title="Reload Catalog"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="btn-primary rounded-xl px-6 py-3 font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-md flex-1 sm:flex-initial"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>+ Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search catalog..."
            className="form-input pl-10 py-2 bg-slate-50 text-xs"
          />
        </div>
      </div>

      {loading && <LoadingSpinner label="Indexing enterprise food catalog..." fullHeight />}

      {!loading && filteredItems.length === 0 && (
        <EmptyState
          title="Catalog Empty"
          description={search ? `No items found matching "${search}".` : "No items logged in backend database."}
          icon={UtensilsCrossed}
          action={
            <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} className="btn-secondary px-5 py-2">
              Reset Filters
            </button>
          }
        />
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 pl-6 pr-3">Dish Presentation</th>
                  <th className="py-4 px-3">Category</th>
                  <th className="py-4 px-3">Prep Time</th>
                  <th className="py-4 px-3">Price (INR)</th>
                  <th className="py-4 px-3 text-center">Status</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filteredItems.map((item) => {
                  const avail = isAvailable(item);
                  return (
                    <tr key={item.item_id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/60">
                            <img src={item.image_url || fallbackImage} alt={item.item_name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{item.item_name}</span>
                            <span className="font-mono text-[11px] text-slate-400 font-bold">{item.item_id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-xs text-slate-500 font-medium">
                        {item.prep_time || 20} mins
                      </td>

                      <td className="py-4 px-3 font-black text-slate-900 font-mono text-base">
                        {formatCurrency(item.price)}
                      </td>

                      <td className="py-4 px-3 text-center">
                        <button
                          disabled={togglingId === item.item_id}
                          onClick={() => handleToggleAvailable(item)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition active:scale-95 ${
                            avail
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 ring-1 ring-slate-300/40 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${avail ? "bg-emerald-600" : "bg-slate-400"}`} />
                          <span>{togglingId === item.item_id ? "..." : avail ? "Active" : "Hidden"}</span>
                        </button>
                      </td>

                      <td className="py-4 pl-3 pr-6 text-right">
                        <button
                          onClick={() => { setEditingItem(item); setModalOpen(true); }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <MenuItemFormModal
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadMenu(); }}
        />
      )}
    </div>
  );
}
