import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Compass, Home, Search, ShoppingBag, User, Sparkles, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/helpers.js";
import logo from "../../logo.png";

export default function Navbar() {
  const { getCartCount, getCartTotal } = useCart();
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const [showProfile, setShowProfile] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
      isActive
        ? "bg-[#7B2D26] text-[#FFF8EE] shadow-md shadow-[#7B2D26]/30 scale-105"
        : "text-[#3E2723] hover:bg-[#E4A11B]/25 hover:text-[#7B2D26]"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#E4A11B]/40 bg-[#FFF8EE]/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Location badge */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1 border-2 border-[#E4A11B] shadow-md group-hover:scale-105 transition duration-300 overflow-hidden">
              <img src={logo} alt="रसोई माँ के हाथों की" className="h-full w-full object-contain" />
            </span>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#7B2D26] font-desi-head leading-none">
                रसोई माँ के हाथों की
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-[#E4A11B] uppercase mt-1">
                Powered by Amigos
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            <Home size={16} className="text-[#E4A11B]" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/menu" className={navLinkClass}>
            <Compass size={16} className="text-[#E4A11B]" />
            <span>Menu</span>
          </NavLink>
          <NavLink to="/track-order" className={navLinkClass}>
            <Search size={16} className="text-[#E4A11B]" />
            <span>Track Order</span>
          </NavLink>
        </nav>

        {/* Action / Cart & Profile Buttons */}
        <div className="flex items-center gap-3 relative">
          <Link
            to="/cart"
            className={`relative flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 shadow-md active:scale-95 ${
              cartCount > 0
                ? "bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-[#7B2D26]/20 hover:scale-105"
                : "border-2 border-[#7B2D26]/40 bg-[#F8F1E7] text-[#7B2D26] hover:border-[#7B2D26] hover:bg-[#FFF8EE]"
            }`}
            aria-label="View shopping cart"
          >
            <ShoppingBag size={18} className={cartCount > 0 ? "text-[#E4A11B] animate-bounce" : "text-[#7B2D26]"} />
            <span className="hidden sm:inline font-black">Cart</span>
            {cartCount > 0 && (
              <div className="flex items-center gap-1.5 border-l border-current pl-2 ml-0.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4A11B] text-[11px] font-extrabold text-[#3E2723]">
                  {cartCount}
                </span>
                <span className="text-xs font-bold hidden sm:inline">{formatCurrency(cartTotal)}</span>
              </div>
            )}
          </Link>

          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-2xl border-2 border-[#7B2D26] bg-[#F8F1E7] px-3.5 py-2 text-sm font-bold text-[#7B2D26] hover:bg-[#7B2D26] hover:text-[#FFF8EE] transition-all duration-300 shadow-sm active:scale-95"
              title="Customer Profile"
            >
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Profile Dropdown Modal */}
            {showProfile && (
              <div className="absolute right-0 mt-3 w-72 rounded-3xl border-2 border-[#E4A11B] bg-[#FFF8EE] p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-[#3E2723]">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E4A11B]/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7B2D26] text-[#FFF8EE] font-black text-lg shadow-inner">
                    🙏
                  </div>
                  <div>
                    <h4 className="font-black text-base text-[#7B2D26] font-desi-head">नमस्ते अतिथि (Guest)</h4>
                    <p className="text-[11px] font-bold text-[#3D7A3A]">पारंपरिक भारतीय रसोई</p>
                  </div>
                </div>
                <div className="py-3 space-y-2 text-xs font-medium text-[#3E2723]/90">
                  <p className="flex items-center gap-2">
                    <span>❤️</span> आप बिना लॉगिन के सीधे ताज़ा भोजन ऑर्डर कर सकते हैं।
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🍲</span> 100% घर जैसा स्वाद और स्वच्छता।
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E4A11B]/30">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="w-full rounded-xl bg-[#7B2D26] py-2 text-xs font-bold text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition"
                  >
                    धन्यवाद (Close)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom-ish or secondary nav bar */}
      <nav className="flex gap-1 overflow-x-auto border-t border-[#E4A11B]/30 bg-[#F8F1E7] px-4 py-2 md:hidden scrollbar-none justify-around">
        <NavLink to="/" end className={navLinkClass}>
          <Home size={16} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/menu" className={navLinkClass}>
          <Compass size={16} />
          <span>Menu</span>
        </NavLink>
        <NavLink to="/track-order" className={navLinkClass}>
          <Search size={16} />
          <span>Track</span>
        </NavLink>
      </nav>
    </header>
  );
}
