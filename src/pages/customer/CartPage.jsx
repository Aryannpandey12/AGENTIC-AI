import { Link } from "react-router-dom";
import { ArrowLeft, Clock, ShieldCheck, ShoppingBag, Sparkles, Trash2, Utensils } from "lucide-react";
import CartItem from "../../components/customer/CartItem.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/helpers.js";

export default function CartPage() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="page-shell py-16 bg-[#FFF8EE]">
        <EmptyState
          title="आपकी थाली अभी खाली है"
          description="ऐसा लगता है कि आपने अभी तक कोई स्वादिष्ट व्यंजन नहीं चुना है। माँ के हाथों से बने गरमा-गरम भोजन ऑर्डर करने के लिए मेनू देखें।"
          icon={ShoppingBag}
          action={
            <Link to="/menu" className="rounded-2xl px-8 py-4 text-sm font-black bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-lg transition duration-300 font-desi-head">
              मेनू देखें (Explore Menu)
            </Link>
          }
        />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const packagingFee = 25; // 25 INR flat gourmet container fee
  const deliveryFee = subtotal > 199 ? 0 : 35; // Free delivery above 199
  const grandTotal = subtotal + packagingFee + deliveryFee;

  return (
    <div className="page-shell space-y-8 pt-6 bg-[#FFF8EE]">
      {/* Top Nav Back Link */}
      <div className="flex items-center justify-between border-b-2 border-[#E4A11B]/30 pb-4">
        <Link to="/menu" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#7B2D26] hover:text-[#5C1F1A] transition font-desi-head">
          <ArrowLeft size={16} />
          <span>और व्यंजन जोड़ें (Add More Dishes)</span>
        </Link>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs font-black text-red-700 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-xl transition"
        >
          <Trash2 size={16} />
          <span>थाली खाली करें (Clear Cart)</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head flex items-center gap-2">
              <span>🍛</span> आपकी चयनित थाली
            </h1>
            <span className="rounded-full bg-[#E4A11B] px-3.5 py-1 text-xs font-black text-[#3E2723] shadow-sm">
              {cartItems.length} व्यंजन
            </span>
          </div>

          {/* Free Delivery progress bar promo */}
          <div className="rounded-3xl border-2 border-[#E4A11B] bg-gradient-to-r from-[#F8F1E7] via-[#FFF8EE] to-[#F8F1E7] p-5 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3D7A3A] text-white shadow-md text-xl">
                🛵
              </span>
              <div>
                <h4 className="text-sm font-black text-[#7B2D26] font-desi-head">
                  {deliveryFee === 0 ? "🎉 बधाई हो! मुफ़्त होम डिलीवरी अनलॉक हो गई है।" : `मुफ़्त डिलीवरी के लिए ${formatCurrency(200 - subtotal)} का और ऑर्डर करें`}
                </h4>
                <p className="text-xs text-[#3E2723]/80 font-bold">मिट्टी की हांडी व थर्मल पैकेजिंग में सुरक्षित डिलीवरी</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {cartItems.map((item) => (
              <CartItem
                key={item.item_id}
                item={item}
                onIncrease={increaseQty}
                onDecrease={decreaseQty}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Micro assurances strip */}
          <div className="pt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border-2 border-[#E4A11B]/40 bg-[#F8F1E7] p-3 shadow-sm">
              <Clock size={20} className="mx-auto text-[#E4A11B] mb-1" />
              <span className="block text-xs font-black text-[#3E2723]">30 मिनट डिलीवरी</span>
            </div>
            <div className="rounded-2xl border-2 border-[#E4A11B]/40 bg-[#F8F1E7] p-3 shadow-sm">
              <ShieldCheck size={20} className="mx-auto text-[#3D7A3A] mb-1" />
              <span className="block text-xs font-black text-[#3E2723]">100% शुद्ध व ताज़ा</span>
            </div>
            <div className="rounded-2xl border-2 border-[#E4A11B]/40 bg-[#F8F1E7] p-3 shadow-sm">
              <Utensils size={20} className="mx-auto text-[#7B2D26] mb-1" />
              <span className="block text-xs font-black text-[#3E2723]">माँ के हाथों का स्वाद</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Bill Breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <aside className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xl font-black text-[#7B2D26] border-b-2 border-[#E4A11B]/30 pb-4 font-desi-head flex items-center gap-2">
              <span>🧾</span> बिल विवरण (Bill Summary)
            </h3>
            
            <div className="space-y-3.5 text-xs text-[#3E2723] font-bold">
              <div className="flex justify-between items-center">
                <span>व्यंजन मूल्य (Item Total)</span>
                <span className="font-black text-sm">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>पारंपरिक पैकेजिंग शुल्क</span>
                <span className="font-black">{formatCurrency(packagingFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>होम डिलीवरी शुल्क</span>
                {deliveryFee === 0 ? (
                  <span className="font-black text-[#3D7A3A] uppercase tracking-wider">मुफ़्त (FREE)</span>
                ) : (
                  <span className="font-black">{formatCurrency(deliveryFee)}</span>
                )}
              </div>
              
              <div className="border-t-2 border-[#E4A11B]/40 pt-4 mt-2 flex justify-between items-center">
                <div>
                  <span className="block text-lg font-black text-[#7B2D26] font-desi-head">कुल देय राशि (To Pay)</span>
                  <span className="text-[10px] text-[#3E2723]/70 font-bold uppercase tracking-wider">सभी कर सहित</span>
                </div>
                <span className="text-2xl font-black text-[#3D7A3A] tracking-tight">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/checkout"
                className="w-full py-4 rounded-2xl flex items-center justify-center font-black text-base tracking-wide bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-xl hover:scale-102 active:scale-95 transition-all font-desi-head border-2 border-[#7B2D26]"
              >
                ऑर्डर देने के लिए आगे बढ़ें (Checkout)
              </Link>
              <p className="mt-3 text-center text-xs font-bold text-[#3D7A3A]">
                🔒 100% सुरक्षित और भरोसेमंद भुगतान
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
