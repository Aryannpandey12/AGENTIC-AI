import { Outlet, Link } from "react-router-dom";
import { Heart, Sparkles, Utensils, Flame, ShieldCheck } from "lucide-react";
import Navbar from "../components/common/Navbar.jsx";
import logo from "../logo.png";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col font-sans antialiased text-[#3E2723] selection:bg-[#E4A11B] selection:text-[#3E2723]">
      <Navbar />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Traditional Indian Desi Footer */}
      <footer className="border-t-4 border-[#E4A11B] bg-[#F8F1E7] pt-14 pb-10 mt-auto shadow-inner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4 pb-10 border-b border-[#E4A11B]/30">
            {/* Brand Column */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1 border-2 border-[#E4A11B] shadow-md overflow-hidden">
                  <img src={logo} alt="रसोई माँ के हाथों की" className="h-full w-full object-contain" />
                </span>
                <div>
                  <h3 className="text-xl font-black tracking-tight font-desi-head text-[#7B2D26] leading-none">
                    रसोई माँ के हाथों की
                  </h3>
                  <p className="text-[11px] font-extrabold tracking-widest text-[#E4A11B] uppercase mt-1">
                    Powered by Amigos
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#3E2723]/80 leading-relaxed font-medium">
                "घर जैसा खाना" — Authentic Indian homemade recipes cooked slowly in traditional brass and clay utensils with pure desi ghee and motherly love.
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black uppercase tracking-wider text-[#7B2D26] font-desi-head text-sm flex items-center gap-1.5">
                <span>🥘</span> पारंपरिक रसोई (Menu)
              </h4>
              <ul className="space-y-2.5 text-[#3E2723] font-bold">
                <li><Link to="/" className="hover:text-[#7B2D26] transition flex items-center gap-1.5"><span className="text-[#E4A11B]">◈</span> मुख्य पृष्ठ (Home)</Link></li>
                <li><Link to="/menu" className="hover:text-[#7B2D26] transition flex items-center gap-1.5"><span className="text-[#E4A11B]">◈</span> पूरा मेनू (Explore Menu)</Link></li>
                <li><Link to="/track-order" className="hover:text-[#7B2D26] transition flex items-center gap-1.5"><span className="text-[#E4A11B]">◈</span> ऑर्डर ट्रैक करें (Track Order)</Link></li>
                <li><Link to="/cart" className="hover:text-[#7B2D26] transition flex items-center gap-1.5"><span className="text-[#E4A11B]">◈</span> आपकी थाली (Cart)</Link></li>
              </ul>
            </div>

            {/* Kitchen Promises */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black uppercase tracking-wider text-[#7B2D26] font-desi-head text-sm flex items-center gap-1.5">
                <span>🪔</span> हमारी विशेषताएँ (Promises)
              </h4>
              <ul className="space-y-2.5 text-[#3E2723] font-semibold">
                <li className="flex items-center gap-2"><span className="text-lg">🫓</span> ताज़ा गरम चपाती और पराठे</li>
                <li className="flex items-center gap-2"><span className="text-lg">🫙</span> मिट्टी की हांडी में बनी दाल</li>
                <li className="flex items-center gap-2"><span className="text-lg">🌿</span> 100% शुद्ध और ताज़ा मसाले</li>
                <li className="flex items-center gap-2"><span className="text-lg">❤️</span> माँ के हाथों का प्यार</li>
              </ul>
            </div>

            {/* Traditional Note */}
            <div className="space-y-3 text-xs bg-[#FFF8EE] p-5 rounded-2xl border-2 border-dashed border-[#7B2D26]/30 shadow-xs">
              <h4 className="font-black text-[#7B2D26] font-desi-head text-sm flex items-center gap-1.5">
                <span>📜</span> रसोई का संदेश
              </h4>
              <p className="text-[#3E2723]/90 leading-relaxed italic">
                "जैसे घर में माँ हर खाने में अपना प्यार मिलाती है, वैसे ही हमारी रसोई का हर निवाला आपको आपके घर की याद दिलाएगा।"
              </p>
              <div className="pt-2 font-bold text-[#3D7A3A] flex items-center gap-1 text-[11px]">
                <Sparkles size={14} /> Fresh Homemade Food Every Day
              </div>
            </div>
          </div>

          {/* Bottom Footer Credits */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3E2723] gap-4 font-bold">
            <p className="flex items-center gap-1.5 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-[#7B2D26] fill-[#7B2D26] animate-pulse" />
              <span>in India</span>
            </p>
            
            <div className="flex items-center gap-3 bg-[#FFF8EE] px-4 py-2 rounded-full border border-[#E4A11B]/40 shadow-xs">
              <span className="text-[#7B2D26] font-black tracking-wide">Fresh Homemade Food</span>
              <span className="text-[#E4A11B]">•</span>
              <span className="text-[#3D7A3A] font-black">Powered by Amigos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
