import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass, Flame, Leaf, Search, Sparkles, UtensilsCrossed, Clock } from "lucide-react";
import MenuCard from "../../components/customer/MenuCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { menuApi } from "../../services/api.js";
import { normalizeApiList } from "../../utils/helpers.js";
import { getCategoryMeta, getItemDescription } from "../../components/customer/customerHelper.js";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("ALL"); // ALL, VEG, BESTSELLER, FAST
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const catFromUrl = searchParams.get("category");
    if (catFromUrl) {
      setCategory(catFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const response = await menuApi.getMenu();
        const apiData = normalizeApiList(response);
        setMenu(apiData || []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch live menu:", err);
        setError("Failed to load menu catalog from server.");
        setMenu([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  // Dynamic unique categories generated strictly from API response
  const dynamicCategories = useMemo(() => {
    const cats = ["All"];
    const seen = new Set(["all"]);
    menu.forEach((item) => {
      if (item?.category) {
        const key = String(item.category).trim();
        if (!seen.has(key.toLowerCase())) {
          seen.add(key.toLowerCase());
          cats.push(key);
        }
      }
    });
    return cats;
  }, [menu]);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      // 1. Category Match
      const matchesCategory = category === "All" || String(item?.category || "").trim().toLowerCase() === String(category).trim().toLowerCase();
      
      // 2. Search match across item_name, description, category simultaneously
      const q = search.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const nameStr = String(item?.item_name || "").toLowerCase();
        const descStr = String(getItemDescription(item)).toLowerCase();
        const catStr = String(item?.category || "").toLowerCase();
        matchesSearch = nameStr.includes(q) || descStr.includes(q) || catStr.includes(q);
      }

      // 3. Quick Dietary Filter
      let matchesQuick = true;
      if (quickFilter === "VEG") {
        matchesQuick = !String(`${item?.item_name} ${item?.category}`).toLowerCase().match(/chicken|mutton|fish|prawn|egg|non-veg/);
      } else if (quickFilter === "BESTSELLER") {
        matchesQuick = String(item?.category || "").toLowerCase().includes("bestseller") || Number(item?.price) > 280;
      } else if (quickFilter === "FAST") {
        matchesQuick = Number(item?.prep_time || 20) <= 15;
      }

      return matchesCategory && matchesSearch && matchesQuick;
    });
  }, [menu, search, category, quickFilter]);

  return (
    <div className="page-shell space-y-10 pt-6 bg-[#FFF8EE] pb-16">
      {/* Page Header / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7B2D26] via-[#5C1F1A] to-[#3E2723] px-6 py-12 text-[#FFF8EE] shadow-2xl sm:px-10 sm:py-16 border-4 border-[#E4A11B]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E4A11B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E4A11B]/20 border-2 border-[#E4A11B] px-4 py-1.5 text-xs font-black tracking-wider text-[#E4A11B] uppercase shadow-sm">
            <Compass size={15} className="animate-spin text-[#E4A11B]" />
            <span>माँ के हाथों का संपूर्ण मेनू (Full Menu)</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl font-desi-head leading-tight drop-shadow-md text-white">
            पारंपरिक और ताज़ा घरेलू भोजन
          </h1>
          <p className="text-sm sm:text-lg text-[#FFF8EE]/90 font-medium leading-relaxed">
            अपनी पसंद के अनुसार व्यंजन चुनें। मिट्टी की हांडी और पीतल के बर्तनों में धीमी आंच पर पकाए गए घर के स्वाद का आनंद लें।
          </p>
        </div>
      </div>

      {/* Wooden Category Platter Buttons (Generated dynamically from API) */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#7B2D26] font-desi-head flex items-center gap-2">
          <span>🍽️</span> व्यंजन श्रेणियां (Quick Filters)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {dynamicCategories.map((cat) => {
            const isSelected = category.toLowerCase() === cat.toLowerCase();
            const catMeta = getCategoryMeta(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`group relative flex flex-col items-center justify-center rounded-3xl p-4 text-center transition-all duration-300 shadow-md cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-[#7B2D26] to-[#5C1F1A] text-[#FFF8EE] border-4 border-[#E4A11B] scale-105 shadow-2xl ring-4 ring-[#E4A11B]/30"
                    : "bg-gradient-to-b from-[#6B3E26] to-[#5C3317] text-[#FFF8EE] border-2 border-[#E4A11B]/70 hover:border-[#E4A11B] hover:bg-[#7B2D26] hover:scale-105"
                }`}
              >
                <span className="text-3xl mb-1.5 group-hover:scale-125 transition duration-300 block relative z-10">
                  {catMeta.icon}
                </span>
                <span className="font-black text-sm tracking-wide font-desi-head relative z-10 text-[#E4A11B] group-hover:text-white truncate max-w-full">
                  {catMeta.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar Board */}
      <div className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E4A11B]/30 pb-5">
          {/* Quick Dietary Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-black uppercase tracking-wider text-[#7B2D26] mr-1 shrink-0">विशेष फ़िल्टर:</span>
            
            <button
              onClick={() => setQuickFilter("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                quickFilter === "ALL"
                  ? "bg-[#7B2D26] text-[#FFF8EE] shadow-md border border-[#E4A11B]"
                  : "bg-[#FFF8EE] text-[#3E2723] border border-[#7B2D26]/30 hover:bg-[#E4A11B]/20"
              }`}
            >
              <Sparkles size={14} className="text-[#E4A11B]" />
              <span>सभी व्यंजन</span>
            </button>

            <button
              onClick={() => setQuickFilter("VEG")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                quickFilter === "VEG"
                  ? "bg-[#3D7A3A] text-white shadow-md border border-[#E4A11B]"
                  : "bg-[#FFF8EE] text-[#3D7A3A] border border-[#3D7A3A]/40 hover:bg-[#3D7A3A]/10"
              }`}
            >
              <Leaf size={14} className="fill-current" />
              <span>शुद्ध शाकाहारी</span>
            </button>

            <button
              onClick={() => setQuickFilter("BESTSELLER")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                quickFilter === "BESTSELLER"
                  ? "bg-[#E4A11B] text-[#3E2723] shadow-md border border-[#7B2D26] font-extrabold"
                  : "bg-[#FFF8EE] text-[#7B2D26] border border-[#E4A11B] hover:bg-[#E4A11B]/20"
              }`}
            >
              <Flame size={14} className="fill-current text-[#7B2D26]" />
              <span>शेफ की पसंद</span>
            </button>

            <button
              onClick={() => setQuickFilter("FAST")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                quickFilter === "FAST"
                  ? "bg-[#5C3317] text-[#FFF8EE] shadow-md border border-[#E4A11B]"
                  : "bg-[#FFF8EE] text-[#5C3317] border border-[#5C3317]/30 hover:bg-[#5C3317]/10"
              }`}
            >
              <Clock size={14} className="text-[#E4A11B]" />
              <span>तुरंत तैयार</span>
            </button>
          </div>

          {/* Search bar requirement: Simultaneous search across item_name, description, category */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-3.5 text-[#7B2D26]" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="खोजें पनीर, थाली, लस्सी, घी..."
              className="w-full rounded-2xl border-2 border-[#7B2D26]/40 bg-[#FFF8EE] pl-11 pr-10 py-3 text-sm font-bold text-[#3E2723] placeholder:text-[#7B2D26]/70 shadow-inner outline-none transition duration-200 focus:border-[#7B2D26] focus:ring-2 focus:ring-[#E4A11B]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-3 text-xs font-black text-[#7B2D26] hover:text-[#5C1F1A]">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-xs font-black text-[#3E2723] mr-2 shrink-0">अन्य श्रेणियां:</span>
          {dynamicCategories.map((cat) => {
            const catMeta = getCategoryMeta(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`rounded-2xl px-4 py-2 text-xs font-black transition whitespace-nowrap shrink-0 border border-[#E4A11B] cursor-pointer ${
                  category === cat
                    ? "bg-[#7B2D26] text-[#FFF8EE] shadow-md scale-105"
                    : "bg-[#FFF8EE] text-[#3E2723] hover:bg-[#E4A11B]/20"
                }`}
              >
                {catMeta.icon} {catMeta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head">
            {category === "All" ? "माँ की रसोई का पूरा मेनू" : `${getCategoryMeta(category).label} व्यंजन`}
          </h2>
          <p className="text-xs font-bold text-[#3E2723] mt-1">
            Showing {filteredMenu.length} traditional dish{filteredMenu.length === 1 ? "" : "es"} ready for ordering
          </p>
        </div>
        
        {category !== "All" && (
          <button onClick={() => handleCategorySelect("All")} className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition shadow-sm cursor-pointer">
            सभी दिखाएँ (Show All)
          </button>
        )}
      </div>

      {loading && <LoadingSpinner label="माँ की रसोई से व्यंजन लोड हो रहे हैं..." fullHeight />}
      
      {!loading && error && (
        <EmptyState title="सर्वर कनेक्शन त्रुटि" description={error} icon={UtensilsCrossed} />
      )}

      {!loading && !error && filteredMenu.length === 0 && (
        <div className="text-center py-16 bg-[#F8F1E7] rounded-3xl border-2 border-[#E4A11B] p-8 space-y-4 shadow-sm">
          <span className="text-5xl block">🫙</span>
          <h3 className="text-xl font-black text-[#7B2D26] font-desi-head">कोई व्यंजन नहीं मिला</h3>
          <p className="text-xs text-[#3E2723] max-w-sm mx-auto font-bold">
            आपके चुने हुए फ़िल्टर और खोज के अनुसार अभी कोई व्यंजन उपलब्ध नहीं है। कृपया कोई अन्य श्रेणी चुनें।
          </p>
          <button
            onClick={() => {
              setSearch("");
              setQuickFilter("ALL");
              handleCategorySelect("All");
            }}
            className="rounded-2xl bg-[#7B2D26] px-8 py-3 text-xs font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition duration-300 shadow-md cursor-pointer"
          >
            फ़िल्टर रीसेट करें (Reset Filters)
          </button>
        </div>
      )}
      
      {!loading && !error && filteredMenu.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMenu.map((item) => (
            <MenuCard key={item.item_id} item={item} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
