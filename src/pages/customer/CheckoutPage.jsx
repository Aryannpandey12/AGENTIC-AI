import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, CreditCard, Lock, MapPin, Phone, ShieldCheck, ShoppingBag, Sparkles, User, Zap, Tag, CheckCircle2, XCircle } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { orderApi } from "../../services/api.js";
import { formatCurrency, normalizeApiObject } from "../../utils/helpers.js";
import { calculateGST, calculateDeliveryCharge, validateCoupon } from "../../components/customer/customerHelper.js";

const getLocalYYYYMMDD = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMinTimeForToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const calculateOffsetTime = (timeStr, offsetMins) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  let totalMins = h * 60 + m + offsetMins;
  while (totalMins < 0) totalMins += 1440;
  totalMins = totalMins % 1440;
  const outH = Math.floor(totalMins / 60);
  const outM = totalMins % 60;
  const ampm = outH >= 12 ? "PM" : "AM";
  const h12 = outH % 12 || 12;
  return `${h12}:${String(outM).padStart(2, "0")} ${ampm}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${day} ${months[month - 1]} ${year}`;
};

const formatDisplayTime = (timeStr) => {
  if (!timeStr) return "";
  return calculateOffsetTime(timeStr, 0);
};

const initialForm = {
  customer_name: "",
  phone: "",
  address: "",
  payment_mode: "COD",

  delivery_type: "now",
  scheduled_date: "",
  scheduled_time: ""
};

export default function CheckoutPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [animateTotal, setAnimateTotal] = useState(false);

  const subtotal = getCartTotal();

  const couponValidation = useMemo(() => {
    if (!appliedCode) return { valid: false, code: "", discount: 0, freeShip: false, message: "" };
    return validateCoupon(appliedCode, subtotal);
  }, [appliedCode, subtotal]);

  useEffect(() => {
    if (appliedCode && !couponValidation.valid) {
      setCouponMessage({ type: "error", text: couponValidation.message || "कार्ट बदलने के कारण कूपन अमान्य हो गया है।" });
      setAppliedCode("");
    }
  }, [appliedCode, couponValidation]);

  const triggerAnimation = () => {
    setAnimateTotal(true);
    setTimeout(() => setAnimateTotal(false), 600);
  };

  const handleApplyCoupon = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMessage({ type: "error", text: "कृपया कूपन कोड दर्ज करें (Enter coupon code)" });
      return;
    }
    const res = validateCoupon(code, subtotal);
    if (!res.valid) {
      setCouponMessage({ type: "error", text: res.message });
      setAppliedCode("");
    } else {
      setAppliedCode(code);
      setCouponMessage({ type: "success", text: res.message });
      setCouponInput("");
      triggerAnimation();
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode("");
    setCouponMessage({ type: "success", text: "कूपन हटा दिया गया है (Coupon removed)" });
    triggerAnimation();
  };

  const minDateStr = getLocalYYYYMMDD();
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 7);
  const maxDateStr = getLocalYYYYMMDD(maxDateObj);
  const minTimeTodayStr = getMinTimeForToday();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.customer_name.trim()) nextErrors.customer_name = "Recipient full name is required";
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) nextErrors.address = "Complete building and street address is required";

    if (form.delivery_type === "scheduled") {
      if (!form.scheduled_date) {
        nextErrors.scheduled_date = "Please select a delivery date";
      } else if (form.scheduled_date < minDateStr) {
        nextErrors.scheduled_date = "Cannot select past dates";
      } else if (form.scheduled_date > maxDateStr) {
        nextErrors.scheduled_date = "Can only schedule up to 7 days in advance";
      }

      if (!form.scheduled_time) {
        nextErrors.scheduled_time = "Please select a delivery time";
      } else if (form.scheduled_date === minDateStr) {
        if (form.scheduled_time < minTimeTodayStr) {
          nextErrors.scheduled_time = "Scheduled time for today must be at least 30 minutes from now";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const gstRate = 5;
  const gstAmount = calculateGST(subtotal, 0.05);
  const isFreeShip = couponValidation.valid && couponValidation.freeShip;
  const deliveryCharge = calculateDeliveryCharge(subtotal, isFreeShip);
  const discountAmount = couponValidation.valid ? couponValidation.discount : 0;
  const grandTotal = Math.max(0, subtotal + gstAmount + deliveryCharge - discountAmount);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      payment_mode: form.payment_mode,
      delivery_type: form.delivery_type,
      scheduled_date: form.delivery_type === "scheduled" ? form.scheduled_date : "",
      scheduled_time: form.delivery_type === "scheduled" ? form.scheduled_time : "",
      items: cartItems.map(({ item_id, item_name, price, qty }) => ({
        item_id,
        item_name,
        price: Number(price || 0),
        qty: Number(qty || 1)
      })),
      subtotal: Number(subtotal),
      gst_rate: Number(gstRate),
      gst_amount: Number(gstAmount),
      delivery_charge: Number(deliveryCharge),
      coupon_code: appliedCode || "",
      discount_amount: Number(discountAmount),
      final_amount: Number(grandTotal),
      total_amount: Number(grandTotal)
    };

    try {
      setSubmitting(true);
      setSubmitError("");
      const response = await orderApi.placeOrder(payload);
      const data = normalizeApiObject(response);
      
      if (data && data.success === false) {
        setSubmitError(data.message || "Failed to dispatch order. Please try again.");
        return;
      }

      const orderId = data?.order_id || data?.id || data?.order?.order_id;
      if (!orderId) {
        setSubmitError("Order dispatched successfully but no tracking reference ID was returned.");
        return;
      }

      clearCart();
      navigate(`/order-success?order_id=${encodeURIComponent(orderId)}`, {
        state: { orderId, order_id: orderId }
      });
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "We couldn't connect to the cooking hub. Please verify your connection and retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-shell py-16 bg-[#FFF8EE]">
        <EmptyState
          title="आपकी थाली अभी खाली है"
          description="ऑर्डर करने के लिए कृपया पहले मेनू से कोई स्वादिष्ट घरेलू व्यंजन चुनें।"
          icon={ShoppingBag}
          action={
            <Link to="/menu" className="rounded-2xl px-8 py-4 text-sm font-black bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-lg transition duration-300 font-desi-head">
              मेनू देखें (Browse Menu)
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 pt-6 bg-[#FFF8EE]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#E4A11B]/30 pb-4">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#7B2D26] hover:text-[#5C1F1A] transition font-desi-head">
          <ArrowLeft size={16} />
          <span>थाली पर वापस जाएं (Back to Cart)</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-black text-[#3D7A3A]">
          <Lock size={16} className="text-[#3D7A3A]" />
          <span>100% सुरक्षित और एन्क्रिप्टेड ऑर्डर</span>
        </div>
      </div>

      {/* Application Branding Header */}
      <div className="text-center py-2 border-b-2 border-[#E4A11B]/20 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-[#7B2D26] font-desi-head tracking-wide">
          🍛 रसोई – माँ के हाथों की
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#E4A11B] uppercase tracking-widest mt-1">
          Powered by Amigos
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form & Payment Selection */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#7B2D26] font-desi-head flex items-center gap-2">
              <span>📝</span> डिलीवरी और भुगतान विवरण
            </h1>
            <p className="text-xs font-bold text-[#3E2723]">कृपया अपना पता और भुगतान का तरीका चुनें</p>
          </div>

          {/* Delivery Coordinates Section */}
          <section className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2.5 border-b-2 border-[#E4A11B]/30 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE] font-black text-sm">
                1
              </span>
              <h2 className="text-lg font-black tracking-tight text-[#7B2D26] font-desi-head">डिलीवरी का पता (Delivery Info)</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3E2723] mb-1.5">
                  <User size={15} className="text-[#7B2D26]" />
                  <span>पूरा नाम (Full Name) *</span>
                </label>
                <input
                  placeholder="जैसे: राहुल शर्मा"
                  className={`w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] p-3.5 text-sm font-bold text-[#3E2723] outline-none focus:border-[#7B2D26] focus:ring-2 focus:ring-[#E4A11B] ${errors.customer_name ? "border-red-500 ring-2 ring-red-200" : ""}`}
                  value={form.customer_name}
                  onChange={(event) => updateField("customer_name", event.target.value)}
                />
                {errors.customer_name && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.customer_name}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3E2723] mb-1.5">
                  <Phone size={15} className="text-[#7B2D26]" />
                  <span>मोबाइल नंबर (Mobile Number) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm font-black text-[#7B2D26]">+91</span>
                  <input
                    type="tel"
                    placeholder="10 अंकों का मोबाइल नंबर"
                    maxLength="10"
                    className={`w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] py-3.5 pl-12 pr-4 text-sm font-bold text-[#3E2723] outline-none focus:border-[#7B2D26] focus:ring-2 focus:ring-[#E4A11B] ${errors.phone ? "border-red-500 ring-2 ring-red-200" : ""}`}
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3E2723] mb-1.5">
                  <MapPin size={15} className="text-[#7B2D26]" />
                  <span>पूरा पता (Complete Address) *</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="मकान नंबर, गली, मोहल्ला और नजदीकी पहचान (Landmark)"
                  className={`w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] p-3.5 text-sm font-bold text-[#3E2723] outline-none min-h-[90px] resize-none focus:border-[#7B2D26] focus:ring-2 focus:ring-[#E4A11B] ${errors.address ? "border-red-500 ring-2 ring-red-200" : ""}`}
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
                {errors.address && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.address}</p>}
              </div>
            </div>
          </section>

          {/* Delivery Preference Section */}
          <section className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2.5 border-b-2 border-[#E4A11B]/30 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE] font-black text-sm">
                2
              </span>
              <h2 className="text-lg font-black tracking-tight text-[#7B2D26] font-desi-head">डिलीवरी का समय (Delivery Preference)</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateField("delivery_type", "now")}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 transition-all duration-200 text-left cursor-pointer ${
                  form.delivery_type === "now"
                    ? "border-[#7B2D26] bg-[#FFF8EE] ring-4 ring-[#E4A11B]/30 shadow-md scale-102"
                    : "border-[#E4A11B]/50 bg-[#FFF8EE]/60 hover:bg-[#FFF8EE]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-black text-[#7B2D26] flex items-center gap-2 font-desi-head">
                    <span className="text-xl">🚀</span>
                    <span>तुरंत मंगवाएं (Deliver Now)</span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    form.delivery_type === "now" ? "border-[#7B2D26] bg-[#7B2D26]" : "border-[#7B2D26]/40 bg-white"
                  }`}>
                    {form.delivery_type === "now" && <span className="h-2 w-2 rounded-full bg-[#E4A11B]" />}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#3E2723]/80 pl-7 block">गरमा-गरम खाना तुरंत तैयार होगा।</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("delivery_type", "scheduled")}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 transition-all duration-200 text-left cursor-pointer ${
                  form.delivery_type === "scheduled"
                    ? "border-[#7B2D26] bg-[#FFF8EE] ring-4 ring-[#E4A11B]/30 shadow-md scale-102"
                    : "border-[#E4A11B]/50 bg-[#FFF8EE]/60 hover:bg-[#FFF8EE]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-black text-[#7B2D26] flex items-center gap-2 font-desi-head">
                    <span className="text-xl">📅</span>
                    <span>समय तय करें (Schedule)</span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    form.delivery_type === "scheduled" ? "border-[#7B2D26] bg-[#7B2D26]" : "border-[#7B2D26]/40 bg-white"
                  }`}>
                    {form.delivery_type === "scheduled" && <span className="h-2 w-2 rounded-full bg-[#E4A11B]" />}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#3E2723]/80 pl-7 block">अपनी पसंद की तारीख और समय चुनें।</span>
              </button>
            </div>

            {form.delivery_type === "scheduled" && (
              <div className="mt-6 pt-6 border-t-2 border-[#E4A11B]/30 space-y-6 transition-all duration-300">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3E2723] mb-1.5">
                      <span>डिलीवरी की तारीख (Date) *</span>
                    </label>
                    <input
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      className={`w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] p-3 text-sm font-bold text-[#3E2723] outline-none focus:border-[#7B2D26] ${errors.scheduled_date ? "border-red-500 ring-2 ring-red-200" : ""}`}
                      value={form.scheduled_date}
                      onChange={(event) => updateField("scheduled_date", event.target.value)}
                    />
                    {errors.scheduled_date && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.scheduled_date}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3E2723] mb-1.5">
                      <span>डिलीवरी का समय (Time) *</span>
                    </label>
                    <input
                      type="time"
                      min={form.scheduled_date === minDateStr ? minTimeTodayStr : undefined}
                      className={`w-full rounded-2xl border-2 border-[#7B2D26]/30 bg-[#FFF8EE] p-3 text-sm font-bold text-[#3E2723] outline-none focus:border-[#7B2D26] ${errors.scheduled_time ? "border-red-500 ring-2 ring-red-200" : ""}`}
                      value={form.scheduled_time}
                      onChange={(event) => updateField("scheduled_time", event.target.value)}
                    />
                    {errors.scheduled_time && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.scheduled_time}</p>}
                  </div>
                </div>

                <p className="text-xs font-bold text-[#3E2723]/80">
                  आपके चुने गए समय के अनुसार ही ताज़ा भोजन तैयार किया जाएगा।
                </p>

                <div className="rounded-2xl border-2 border-[#3D7A3A]/40 bg-[#3D7A3A]/10 p-4 space-y-3">
                  <div className="text-xs font-black tracking-wider uppercase text-[#3D7A3A]">
                    खाना बनने का अनुमानित समय
                  </div>
                  <div className="flex items-center justify-around text-center py-3 bg-[#FFF8EE] rounded-xl border border-[#3D7A3A]/30 shadow-sm">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#7B2D26] block">डिलीवरी समय</span>
                      <span className="text-sm font-black text-[#3E2723]">
                        {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, 0) : "--:--"}
                      </span>
                    </div>
                    <div className="text-[#3D7A3A] font-black text-base">↓</div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#7B2D26] block">रसोई में तैयारी शुरू</span>
                      <span className="text-sm font-black text-[#3D7A3A]">
                        {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, -40) : "--:--"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FFF8EE] p-3.5 border border-[#E4A11B] text-xs font-bold text-[#3E2723] flex items-center gap-2.5">
                  <span className="text-base">🕒</span>
                  <span>माँ की रसोई में आपके समय से ठीक पहले ताज़ा खाना पकाया जाएगा।</span>
                </div>

                <div className="rounded-2xl border border-[#E4A11B] bg-[#FFF8EE] p-5 space-y-4">
                  <div className="text-xs font-black tracking-wider uppercase text-[#7B2D26]">
                    समय सारणी (Timeline)
                  </div>
                  
                  <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[#E4A11B]">
                    <div className="relative flex items-center justify-between text-xs">
                      <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-[#E4A11B] text-xs ring-4 ring-[#FFF8EE] shadow-sm">
                        📅
                      </span>
                      <span className="font-bold text-[#3E2723]">ऑर्डर बुक हुआ</span>
                      <span className="font-black text-[#7B2D26]">आज (Today)</span>
                    </div>

                    <div className="relative flex items-center justify-between text-xs">
                      <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-[#E4A11B] text-xs ring-4 ring-[#FFF8EE] shadow-sm">
                        🍳
                      </span>
                      <span className="font-bold text-[#3E2723]">रसोई में तैयारी शुरू</span>
                      <span className="font-black text-[#7B2D26]">
                        {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, -40) : "--:--"}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-between text-xs">
                      <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-[#E4A11B] text-xs ring-4 ring-[#FFF8EE] shadow-sm">
                        🛵
                      </span>
                      <span className="font-bold text-[#3E2723]">डिलीवरी के लिए रवाना</span>
                      <span className="font-black text-[#7B2D26]">
                        {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, -15) : "--:--"}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-between text-xs">
                      <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-[#3D7A3A] text-white text-xs ring-4 ring-[#FFF8EE] shadow-sm">
                        🏠
                      </span>
                      <span className="font-bold text-[#3D7A3A]">घर पर डिलीवर</span>
                      <span className="font-black text-[#3D7A3A]">
                        {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, 0) : "--:--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Payment Mode Selection (Visual Cards) */}
          <section className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2.5 border-b-2 border-[#E4A11B]/30 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE] font-black text-sm">
                3
              </span>
              <h2 className="text-lg font-black tracking-tight text-[#7B2D26] font-desi-head">भुगतान का माध्यम (Payment Method)</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => updateField("payment_mode", "COD")}
                className={`flex flex-col items-start rounded-2xl border-2 p-4 transition text-left cursor-pointer ${
                  form.payment_mode === "COD"
                    ? "border-[#7B2D26] bg-[#FFF8EE] ring-4 ring-[#E4A11B]/30 shadow-md scale-102"
                    : "border-[#E4A11B]/50 bg-[#FFF8EE]/60 hover:bg-[#FFF8EE]"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D7A3A] text-white shadow-sm mb-3">
                  <Banknote size={20} />
                </span>
                <span className="text-sm font-black text-[#3E2723] block font-desi-head">नकद / UPI (COD)</span>
                <span className="text-[11px] font-bold text-[#7B2D26] mt-0.5">डिलीवरी पर नकद या UPI दें</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("payment_mode", "UPI")}
                className={`flex flex-col items-start rounded-2xl border-2 p-4 transition text-left cursor-pointer ${
                  form.payment_mode === "UPI"
                    ? "border-[#7B2D26] bg-[#FFF8EE] ring-4 ring-[#E4A11B]/30 shadow-md scale-102"
                    : "border-[#E4A11B]/50 bg-[#FFF8EE]/60 hover:bg-[#FFF8EE]"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4A11B] text-[#3E2723] shadow-sm mb-3">
                  <Zap size={20} className="fill-current" />
                </span>
                <span className="text-sm font-black text-[#3E2723] block font-desi-head">तत्काल UPI</span>
                <span className="text-[11px] font-bold text-[#7B2D26] mt-0.5">GPay, PhonePe, Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("payment_mode", "Card")}
                className={`flex flex-col items-start rounded-2xl border-2 p-4 transition text-left cursor-pointer ${
                  form.payment_mode === "Card"
                    ? "border-[#7B2D26] bg-[#FFF8EE] ring-4 ring-[#E4A11B]/30 shadow-md scale-102"
                    : "border-[#E4A11B]/50 bg-[#FFF8EE]/60 hover:bg-[#FFF8EE]"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-[#FFF8EE] shadow-sm mb-3">
                  <CreditCard size={20} />
                </span>
                <span className="text-sm font-black text-[#3E2723] block font-desi-head">डेबिट / क्रेडिट कार्ड</span>
                <span className="text-[11px] font-bold text-[#7B2D26] mt-0.5">Visa, Mastercard, RuPay</span>
              </button>
            </div>
          </section>

          {submitError && (
            <div className="rounded-2xl border-2 border-red-400 bg-red-100 p-4 text-xs font-black text-red-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <div className="lg:hidden pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl flex items-center justify-center font-black text-base tracking-wide bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-xl font-desi-head border-2 border-[#7B2D26]"
            >
              {submitting
                ? (form.delivery_type === "scheduled" ? "ऑर्डर शेड्यूल हो रहा है..." : "ऑर्डर भेजा जा रहा है...")
                : `${form.delivery_type === "scheduled" ? "ऑर्डर शेड्यूल करें" : "ऑर्डर कन्फर्म करें"} • ${formatCurrency(grandTotal)}`}
            </button>
          </div>
        </form>

        {/* Right Column: Sticky Review Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <aside className="rounded-3xl border-2 border-[#E4A11B] bg-[#F8F1E7] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Traditional Bill Header */}
            <div className="text-center border-b-2 border-dashed border-[#7B2D26]/40 pb-4">
              <h3 className="text-xl font-black text-[#7B2D26] font-desi-head tracking-wide flex items-center justify-center gap-2">
                <span>🧾</span> पारंपरिक बिल (RESTAURANT BILL)
              </h3>
              <span className="text-xs font-bold text-[#3E2723]/70 block mt-1">
                {cartItems.length} स्वादिष्ट व्यंजन चुने गए
              </span>
            </div>

            {/* Compact items list */}
            <div className="max-h-52 overflow-y-auto divide-y divide-[#E4A11B]/20 pr-1 space-y-2.5 scrollbar-none">
              {cartItems.map((item) => (
                <div key={item.item_id} className="flex justify-between items-start gap-3 pt-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-[#7B2D26] font-mono bg-[#E4A11B]/20 px-1.5 py-0.5 rounded">{item.qty}x</span>
                    <span className="font-bold text-[#3E2723] leading-tight">{item.item_name}</span>
                  </div>
                  <span className="font-black text-[#3E2723] shrink-0">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="rounded-2xl bg-[#FFF8EE] p-4 border border-[#E4A11B]/60 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#7B2D26] flex items-center gap-1.5 font-desi-head">
                  <Tag size={14} className="text-[#7B2D26]" />
                  <span>कूपन कोड (Coupon Code)</span>
                </label>
                {appliedCode && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-black text-red-600 underline hover:text-red-800 transition"
                  >
                    हटाएं (Remove)
                  </button>
                )}
              </div>

              {!appliedCode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="कोड लिखें (जैसे: WELCOME50)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponMessage.text) setCouponMessage({ type: "", text: "" });
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(e); }}
                    className="w-full rounded-xl border-2 border-[#7B2D26]/30 bg-white px-3 py-2 text-xs font-black text-[#3E2723] uppercase placeholder:text-gray-400 placeholder:normal-case outline-none focus:border-[#7B2D26] focus:ring-1 focus:ring-[#E4A11B]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="shrink-0 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-black text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] transition font-desi-head shadow cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-[#3D7A3A]/15 border border-[#3D7A3A] p-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#3D7A3A] shrink-0" />
                    <div>
                      <span className="text-xs font-black text-[#3D7A3A] block font-mono">{appliedCode}</span>
                      <span className="text-[10px] font-bold text-[#3E2723]">
                        {couponValidation.freeShip ? "मुफ़्त डिलीवरी लागू हुई" : `₹${discountAmount} की छूट लागू`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon feedback message */}
              {couponMessage.text && (
                <p className={`text-[11px] font-black tracking-wide flex items-center gap-1 ${
                  couponMessage.type === "error" ? "text-red-600" : "text-[#3D7A3A]"
                }`}>
                  <span>{couponMessage.type === "error" ? "❌" : "✅"}</span>
                  <span>{couponMessage.text}</span>
                </p>
              )}

              {/* Quick Hint Coupons */}
              {!appliedCode && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#3E2723]/60 mr-1">ऑफर:</span>
                  {["WELCOME50", "FIRSTORDER", "SUCHITRA20", "FREESHIP"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCouponInput(c);
                        setCouponMessage({ type: "", text: "" });
                      }}
                      className="rounded-lg bg-[#E4A11B]/25 px-2 py-1 text-[10px] font-black text-[#7B2D26] hover:bg-[#E4A11B] hover:text-[#3E2723] transition cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fee breakdown calculation */}
            <div className="border-t-2 border-dashed border-[#7B2D26]/40 pt-4 space-y-3 text-xs text-[#3E2723] font-bold">
              <div className="flex justify-between">
                <span>डिलीवरी का प्रकार</span>
                <span className="font-black text-[#7B2D26]">
                  {form.delivery_type === "now" ? "तुरंत डिलीवरी" : "शेड्यूल डिलीवरी"}
                </span>
              </div>
              {form.delivery_type === "scheduled" && (
                <div className="flex justify-between items-start">
                  <span>तय समय</span>
                  <span className="font-black text-[#3D7A3A] text-right leading-tight">
                    {form.scheduled_date ? formatDisplayDate(form.scheduled_date) : "--"}
                    <span className="block mt-0.5">
                      {form.scheduled_time ? calculateOffsetTime(form.scheduled_time, 0) : "--:--"}
                    </span>
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>व्यंजन मूल्य (Subtotal)</span>
                <span className="font-black">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>जीएसटी (GST 5%)</span>
                <span className="font-black">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>डिलीवरी शुल्क (Delivery Charges)</span>
                {deliveryCharge === 0 ? (
                  <span className="font-black text-[#3D7A3A] uppercase tracking-wider bg-[#3D7A3A]/15 px-2 py-0.5 rounded-md border border-[#3D7A3A]/30">FREE</span>
                ) : (
                  <span className="font-black">{formatCurrency(deliveryCharge)}</span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#3D7A3A] bg-[#3D7A3A]/10 p-1.5 rounded-lg border border-[#3D7A3A]/20">
                  <span>कूपन छूट (Discount)</span>
                  <span className="font-black">- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className={`border-t-2 border-[#7B2D26] pt-4 flex justify-between items-center transition-all duration-500 ${
                animateTotal ? "scale-105 bg-[#E4A11B]/30 p-3 rounded-2xl shadow-md text-[#7B2D26]" : ""
              }`}>
                <span className="text-lg font-black text-[#7B2D26] font-desi-head">कुल देय राशि (Grand Total)</span>
                <span className="text-2xl font-black text-[#3D7A3A]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="hidden lg:block pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl flex items-center justify-center font-black text-base tracking-wide bg-[#7B2D26] text-[#FFF8EE] hover:bg-[#E4A11B] hover:text-[#3E2723] shadow-xl hover:scale-102 active:scale-95 transition-all font-desi-head border-2 border-[#7B2D26] cursor-pointer"
              >
                {submitting
                  ? (form.delivery_type === "scheduled" ? "ऑर्डर शेड्यूल हो रहा है..." : "ऑर्डर भेजा जा रहा है...")
                  : `${form.delivery_type === "scheduled" ? "ऑर्डर शेड्यूल करें" : "ऑर्डर कन्फर्म करें"} • ${formatCurrency(grandTotal)}`}
              </button>
            </div>

            <div className="rounded-2xl bg-[#FFF8EE] p-4 border border-[#E4A11B] text-xs font-bold text-[#3E2723] flex items-center gap-2">
              <ShieldCheck size={22} className="text-[#3D7A3A] shrink-0" />
              <span>ऑर्डर कन्फर्म करते ही माँ की रसोई में भोजन की तैयारी शुरू कर दी जाएगी।</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
