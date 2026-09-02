import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame, Leaf, Search, Sparkles, Plus } from "lucide-react";
import MenuCard from "../../components/customer/MenuCard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { menuApi } from "../../services/api.js";
import { normalizeApiList, formatCurrency } from "../../utils/helpers.js";
import { getCategoryMeta, checkIsAvailable, getItemDescription } from "../../components/customer/customerHelper.js";

export default function HomePage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quickFilter, setQuickFilter] = useState("ALL"); // ALL, VEG, BESTSELLER, FAST
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const response = await menuApi.getMenu();
        const apiData = normalizeApiList(response);
        
        setMenu(apiData || []);
      } catch (err) {
        console.error("Homepage catalog load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Dynamic available dishes
  const availableDishes = useMemo(() => {
    return menu.filter(item => checkIsAvailable(item));
  }, [menu]);

  // Dynamic Today's Special: First available Thali OR First available Punjabi dish
  const todaysSpecial = useMemo(() => {
    const thali = availableDishes.find(i => String(i?.category || "").toLowerCase().includes("thali"));
    if (thali) return thali;
    const punjabi = availableDishes.find(i => String(i?.category || "").toLowerCase().includes("punjabi"));
    if (punjabi) return punjabi;
    return availableDishes[0] || menu[0] || null;
  }, [availableDishes, menu]);

  // Dynamic Unique Categories from API response
  const dynamicCategories = useMemo(() => {
    const cats = ["All"];
    const seen = new Set(["all"]);
    menu.forEach(item => {
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

  // Dynamic Featured Dishes Priority: 1. Thali, 2. Punjabi, 3. Breakfast, 4. Main Course. Max 6.
  const featuredDishes = useMemo(() => {
    const thalis = availableDishes.filter(i => String(i?.category || "").toLowerCase().includes("thali"));
    const punjabis = availableDishes.filter(i => String(i?.category || "").toLowerCase().includes("punjabi") && !thalis.includes(i));
    const breakfasts = availableDishes.filter(i => (String(i?.category || "").toLowerCase().includes("breakfast") || String(i?.category || "").toLowerCase().includes("snack") || String(i?.category || "").toLowerCase().includes("nashta")) && !thalis.includes(i) && !punjabis.includes(i));
    const mainCourses = availableDishes.filter(i => (String(i?.category || "").toLowerCase().includes("main course") || String(i?.category || "").toLowerCase().includes("curry") || String(i?.category || "").toLowerCase().includes("rice") || String(i?.category || "").toLowerCase().includes("roti")) && !thalis.includes(i) && !punjabis.includes(i) && !breakfasts.includes(i));
    const rest = availableDishes.filter(i => !thalis.includes(i) && !punjabis.includes(i) && !breakfasts.includes(i) && !mainCourses.includes(i));
    
    return [...thalis, ...punjabis, ...breakfasts, ...mainCourses, ...rest].slice(0, 6);
  }, [availableDishes]);

  // Filtered Dishes for Complete Menu (Category + Search simultaneously)
  const filteredDishes = useMemo(() => {
    return menu.filter(item => {
      // 1. Category Filter Logic
      const matchCat = activeCategory === "All" || String(item?.category || "").trim().toLowerCase() === String(activeCategory).trim().toLowerCase();
      
      // 2. Quick dietary/prep filter
      let matchQuick = true;
      if (quickFilter === "VEG") {
        matchQuick = !String(`${item?.item_name} ${item?.category}`).toLowerCase().match(/chicken|mutton|fish|prawn|egg|non-veg/);
      } else if (quickFilter === "BESTSELLER") {
        matchQuick = String(item?.category || "").toLowerCase().includes("bestseller") || Number(item?.price) > 280;
      } else if (quickFilter === "FAST") {
        matchQuick = Number(item?.prep_time || 20) <= 15;
      }

      // 3. Search simultaneous matching across item_name, description, category
      const q = search.toLowerCase().trim();
      let matchSearch = true;
      if (q) {
        const nameStr = String(item?.item_name || "").toLowerCase();
        const descStr = String(getItemDescription(item)).toLowerCase();
        const catStr = String(item?.category || "").toLowerCase();
        matchSearch = nameStr.includes(q) || descStr.includes(q) || catStr.includes(q);
      }

      return matchCat && matchQuick && matchSearch;
    });
  }, [menu, activeCategory, quickFilter, search]);

  const handleCategoryClick = (catName) => {
    setActiveCategory(catName);
    const element = document.getElementById("complete-menu-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const heroShowcaseItems = menu.slice(0, 4);

  return (
    <div className="space-y-16 pb-16 bg-[#FFF8EE]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7B2D26] via-[#5C1F1A] to-[#3E2723] text-[#FFF8EE] pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#E4A11B] shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E4A11B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Textual Hero */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E4A11B]/20 border-2 border-[#E4A11B] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#E4A11B] shadow-sm">
              <Sparkles size={15} className="animate-spin text-[#E4A11B]" />
              <span>पारंपरिक भारतीय घरेलू रसोई (Authentic Kitchen)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-desi-head leading-[1.15] text-white drop-shadow-md">
              "घर जैसा स्वाद, <br />
              <span className="text-[#E4A11B] ">माँ के हाथों का प्यार"</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#FFF8EE]/90 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              Freshly prepared homemade meals made with love. Experience the warmth of traditional brass utensils, clay pots, and slow-cooked family heritage recipes.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-[#E4A11B] pt-2">
              <span className="flex items-center gap-1.5 bg-[#3E2723]/80 px-3.5 py-2 rounded-xl border border-[#E4A11B]/40 shadow-sm">
                <span>🫙</span> Clay Handi Preparation
              </span>
              <span className="flex items-center gap-1.5 bg-[#3E2723]/80 px-3.5 py-2 rounded-xl border border-[#E4A11B]/40 shadow-sm">
                <span>🌿</span> Pure Desi Ghee & Spices
              </span>
              <span className="flex items-center gap-1.5 bg-[#3E2723]/80 px-3.5 py-2 rounded-xl border border-[#E4A11B]/40 shadow-sm">
                <span>🍽️</span> Traditional Thali Warmth
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#complete-menu-section"
                className="rounded-2xl px-8 py-4 text-base font-black uppercase tracking-wider bg-[#E4A11B] text-[#3E2723] hover:bg-[#FFF8EE] hover:text-[#7B2D26] shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-[#E4A11B]"
              >
                <span>आज का मेनू देखें (Order Now)</span>
                <ArrowRight size={18} className="stroke-[3]" />
              </a>
              
              <Link
                to="/track-order"
                className="rounded-2xl border-2 border-[#FFF8EE]/40 bg-[#3E2723]/60 px-6 py-4 text-sm font-bold text-[#FFF8EE] hover:bg-[#3E2723] hover:border-[#E4A11B] transition duration-300"
              >
                Track Live Order
              </Link>
            </div>
          </div>

          {/* Right Dynamic Visual Collage from API */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative">
            {heroShowcaseItems.length > 0 ? (
              heroShowcaseItems.map((item, idx) => {
                const catMeta = getCategoryMeta(item.category);
                const rotClass = idx % 2 === 0 ? (idx === 0 ? "-rotate-2" : "rotate-3") : (idx === 1 ? "rotate-2" : "-rotate-3");
                return (
                  <div key={item.item_id || idx} className={`overflow-hidden rounded-3xl border-4 border-[#E4A11B] shadow-2xl group transform ${rotClass} hover:rotate-0 transition duration-300 bg-[#3E2723] ${idx % 2 === 0 ? "pt-2" : ""}`}>
                    <img
                      src={item.image_url || catMeta.fallback}
                      onError={(e) => { e.target.src = catMeta.fallback; }}
                      alt={item.item_name}
                      className="h-40 sm:h-44 w-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="p-2.5 text-center bg-[#5C3317] text-[#FFF8EE] text-xs font-black truncate">
                      <span>{catMeta.icon} {item.item_name}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              // Loading placeholders before API resolves
              [1, 2, 3, 4].map((num) => (
                <div key={num} className="h-44 rounded-3xl border-4 border-[#E4A11B]/40 bg-[#3E2723]/60 animate-pulse flex items-center justify-center text-[#E4A11B] font-black text-xs">
                  <span>🍳 रसोई तैयारी...</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promotional Banners Strip */}
      <section className="page-shell !mt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#7B2D26] to-[#5C1F1A] p-6 text-[#FFF8EE] border-2 border-[#E4A11B] shadow-md transition hover:-translate-y-1">
            <div className="space-y-1.5">
              <span className="rounded-lg bg-[#E4A11B] text-[#3E2723] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                पहली थाली पर छूट
              </span>
              <h4 className="text-xl font-black tracking-tight font-desi-head">FLAT ₹120 OFF</h4>
              <p className="text-xs font-bold text-[#E4A11B]">Code: MAAKAPYAAR</p>
            </div>
            <span className="text-4xl shrink-0">🎁</span>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#5C3317] to-[#3E2723] p-6 text-[#FFF8EE] border-2 border-[#E4A11B] shadow-md transition hover:-translate-y-1">
            <div className="space-y-1.5">
              <span className="rounded-lg bg-[#3D7A3A] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                पारंपरिक पकाने की विधि
              </span>
              <h4 className="text-xl font-black tracking-tight font-desi-head">मिट्टी व पीतल बर्तन</h4>
              <p className="text-xs font-bold text-[#E4A11B]">धीमी आंच पर तैयार शुद्ध भोजन</p>
            </div>
            <span className="text-4xl shrink-0">🫙</span>
          </div>

          <div className="hidden lg:flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#3D7A3A] to-[#2A5728] p-6 text-[#FFF8EE] border-2 border-[#E4A11B] shadow-md transition hover:-translate-y-1">
            <div className="space-y-1.5">
              <span className="rounded-lg bg-[#E4A11B] text-[#3E2723] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                सुचित्रा परिवार
              </span>
              <h4 className="text-xl font-black tracking-tight font-desi-head">मुफ़्त होम डिलीवरी</h4>
              <p className="text-xs font-bold text-[#FFF8EE]">₹199 से ऊपर के हर ऑर्डर पर</p>
            </div>
            <span className="text-4xl shrink-0">🛵</span>
          </div>
        </div>
      </section>

      {/* 2. ❤️ आज की स्पेशल (Today's Special) */}
      {todaysSpecial && (
        <section className="page-shell space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">❤️</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head">
              आज की स्पेशल (Today's Special)
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-4 border-[#E4A11B] bg-gradient-to-r from-[#7B2D26] via-[#5C1F1A] to-[#3E2723] p-6 sm:p-10 text-[#FFF8EE] shadow-2xl grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E4A11B] px-3.5 py-1 text-xs font-black text-[#3E2723] shadow-md">
                <span>🔥 शेफ द्वारा अनुशंसित विशेष थाली</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-bold tracking-widest text-[#E4A11B] uppercase block">
                  {getCategoryMeta(todaysSpecial.category).badge}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black font-desi-head tracking-tight text-white">
                  {todaysSpecial.item_name}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-[#FFF8EE]/90 leading-relaxed font-medium max-w-xl">
                {todaysSpecial.description || getItemDescription(todaysSpecial) }
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div>
                  <span className="block text-[10px] font-black uppercase text-[#E4A11B]">विशेष मूल्य (Special Price)</span>
                  <span className="text-3xl font-black text-white">{formatCurrency(todaysSpecial.price)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-[#E4A11B]">तैयारी का समय</span>
                  <span className="text-lg font-bold flex items-center gap-1 text-white">
                    <Clock size={16} className="text-[#E4A11B]" /> {todaysSpecial.prep_time || "20"} मिनट
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => addToCart(todaysSpecial)}
                  className="rounded-2xl bg-[#E4A11B] px-8 py-4 text-base font-black text-[#3E2723] hover:bg-white hover:text-[#7B2D26] transition duration-300 shadow-xl flex items-center gap-2 border-2 border-[#E4A11B] cursor-pointer"
                >
                  <Plus size={20} className="stroke-[3]" />
                  <span>तुरंत ऑर्डर करें (Add to Cart)</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border-4 border-[#E4A11B] shadow-2xl bg-[#3E2723]">
                <img
                  src={todaysSpecial.image_url || getCategoryMeta(todaysSpecial.category).fallback}
                  onError={(e) => { e.target.src = getCategoryMeta(todaysSpecial.category).fallback; }}
                  alt={todaysSpecial.item_name}
                  className="h-full w-full object-cover transform hover:scale-105 transition duration-700"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. 🍽️ Quick Filters (Dynamically generated from API categories) */}
      <section className="page-shell space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E4A11B]/30 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head flex items-center gap-2">
              <span>🍽️</span> व्यंजन श्रेणियां (Quick Filters)
            </h2>
            <p className="text-xs font-bold text-[#3E2723]/70 mt-1">
              अपनी पसंद की श्रेणी चुनने के लिए नीचे दिए गए लकड़ी के प्लैटर पर क्लिक करें
            </p>
          </div>
          {activeCategory !== "All" && (
            <button
              onClick={() => setActiveCategory("All")}
              className="rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition self-start sm:self-auto shadow-sm cursor-pointer"
            >
              सभी व्यंजन दिखाएँ (Reset Filter)
            </button>
          )}
        </div>

        {/* Dynamic Wooden / Platter Style Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
          {dynamicCategories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            const catMeta = getCategoryMeta(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`group relative flex flex-col items-center justify-center rounded-3xl p-5 text-center transition-all duration-300 shadow-md cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-[#7B2D26] to-[#5C1F1A] text-[#FFF8EE] border-4 border-[#E4A11B] scale-105 shadow-2xl ring-4 ring-[#E4A11B]/30"
                    : "bg-gradient-to-b from-[#6B3E26] to-[#5C3317] text-[#FFF8EE] border-2 border-[#E4A11B]/70 hover:border-[#E4A11B] hover:bg-[#7B2D26] hover:scale-105 hover:shadow-xl"
                }`}
              >
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                <span className="text-4xl mb-2.5 group-hover:scale-125 transition duration-300 drop-shadow-md block relative z-10">
                  {catMeta.icon}
                </span>
                <span className="font-black text-sm sm:text-base tracking-wide font-desi-head relative z-10 text-[#E4A11B] group-hover:text-white truncate max-w-full">
                  {catMeta.label}
                </span>
                <span className="text-[10px] font-bold opacity-90 mt-1 relative z-10 truncate max-w-full">
                  {cat === "All" ? "Explore Catalog" : cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. 🥘 Featured Dishes (Dynamic API priority: Thali, Punjabi, Breakfast, Main Course. Max 6) */}
      {featuredDishes.length > 0 && (
        <section className="page-shell space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#E4A11B]/30 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head flex items-center gap-2">
                <span>🥘</span> खास आपके लिए (Featured Dishes)
              </h2>
              <p className="text-xs font-bold text-[#3E2723]/70 mt-1">
                रसोई के सबसे लोकप्रिय और स्वादिष्ट व्यंजन
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDishes.map((item) => (
              <MenuCard key={item.item_id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </section>
      )}

      {/* 5. 🍛 Complete Menu (Search + Simultaneous Filters) */}
      <section id="complete-menu-section" className="page-shell scroll-mt-28 space-y-8">
        
        {/* Filter & Search Bar Board */}
        <div className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Title */}
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B2D26] text-[#E4A11B] shadow-md shrink-0 border-2 border-[#E4A11B] text-2xl">
                🍛
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head">
                  {activeCategory === "All" ? "सम्पूर्ण रसोई मेनू (Complete Menu)" : `${getCategoryMeta(activeCategory).label} व्यंजन`}
                </h2>
                <p className="text-xs font-bold text-[#3E2723]">
                  Showing {filteredDishes.length} traditional homemade dish{filteredDishes.length === 1 ? "" : "es"} ready for ordering
                </p>
              </div>
            </div>

            {/* Right Search Input Requirement: Simultaneous across item_name, description, category */}
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

          {/* Quick Dietary Chips Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pt-3 border-t border-[#E4A11B]/30 scrollbar-none">
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
              <span>सभी व्यंजन (All)</span>
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
              <span>शुद्ध शाकाहारी (Pure Veg)</span>
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
              <span>शेफ की पसंद (Bestseller)</span>
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
              <span>तुरंत तैयार (Under 15m)</span>
            </button>

            {(activeCategory !== "All" || quickFilter !== "ALL" || search !== "") && (
              <button
                onClick={() => { setActiveCategory("All"); setQuickFilter("ALL"); setSearch(""); }}
                className="ml-auto text-xs font-black text-red-700 hover:underline shrink-0 px-3 py-1.5 rounded-lg bg-red-100/80 cursor-pointer"
              >
                फ़िल्टर हटाएँ (Reset)
              </button>
            )}
          </div>
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <LoadingSpinner label="माँ की रसोई से गरमा-गरम व्यंजन लोड हो रहे हैं..." fullHeight />
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F1E7] rounded-3xl border-2 border-[#E4A11B] p-8 space-y-4 shadow-sm">
            <span className="text-5xl block">🫙</span>
            <h3 className="text-xl font-black text-[#7B2D26] font-desi-head">कोई व्यंजन नहीं मिला</h3>
            <p className="text-xs text-[#3E2723] max-w-sm mx-auto font-bold">
              आपके चुने हुए फ़िल्टर और खोज के अनुसार अभी कोई व्यंजन उपलब्ध नहीं है। कृपया कोई अन्य श्रेणी चुनें या खोज बदलें।
            </p>
            <button
              onClick={() => { setActiveCategory("All"); setQuickFilter("ALL"); setSearch(""); }}
              className="rounded-2xl bg-[#7B2D26] px-8 py-3 text-xs font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition duration-300 shadow-md cursor-pointer"
            >
              पूरा मेनू देखें (View Full Catalog)
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map((item) => (
              <MenuCard key={item.item_id} item={item} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
