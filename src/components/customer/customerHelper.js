export function getCategoryMeta(cat) {
  if (!cat || cat === "All" || cat === "ALL") {
    return {
      icon: "🌟",
      label: "सभी व्यंजन",
      badge: "🌟 सभी व्यंजन",
      fallback: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
    };
  }

  const s = String(cat).toLowerCase().trim();

  if (s.includes("thali") || s.includes("combo") || s.includes("meal")) {
    return {
      icon: "🍽️",
      label: "थाली",
      badge: `🍽️ थाली`,
      fallback: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("punjabi") || s.includes("north")) {
    return {
      icon: "🥘",
      label: "पंजाबी",
      badge: `🥘 पंजाबी`,
      fallback: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("breakfast") || s.includes("nasta") || s.includes("nashta") || s.includes("morning")) {
    return {
      icon: "🌅",
      label: "नाश्ता",
      badge: `🌅 नाश्ता`,
      fallback: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("main course") || s.includes("curry") || s.includes("sabzi") || s.includes("dal") || s.includes("paneer")) {
    return {
      icon: "🍛",
      label: "मुख्य भोजन",
      badge: `🍛 मुख्य भोजन`,
      fallback: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("rice") || s.includes("chawal") || s.includes("biryani") || s.includes("pulao")) {
    return {
      icon: "🍚",
      label: "चावल",
      badge: `🍚 चावल`,
      fallback: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("roti") || s.includes("bread") || s.includes("naan") || s.includes("paratha") || s.includes("phulka")) {
    return {
      icon: "🫓",
      label: "रोटी",
      badge: `🫓 रोटी`,
      fallback: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("beverage") || s.includes("drink") || s.includes("lassi") || s.includes("chaach") || s.includes("chai") || s.includes("tea") || s.includes("coffee") || s.includes("juice")) {
    return {
      icon: "🥛",
      label: "पेय पदार्थ",
      badge: `🥛 पेय पदार्थ`,
      fallback: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("dessert") || s.includes("sweet") || s.includes("meetha") || s.includes("mithai") || s.includes("kheer") || s.includes("halwa")) {
    return {
      icon: "🍮",
      label: "मिठाई",
      badge: `🍮 मिठाई`,
      fallback: "https://images.unsplash.com/photo-1597892669145-81206f3630f9?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("snack") || s.includes("starter") || s.includes("chaat") || s.includes("pakoda") || s.includes("samosa")) {
    return {
      icon: "🥟",
      label: "स्नैक्स",
      badge: `🥟 स्नैक्स`,
      fallback: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
    };
  }
  if (s.includes("south")) {
    return {
      icon: "🍲",
      label: "दक्षिण भारतीय",
      badge: `🍲 दक्षिण भारतीय`,
      fallback: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
    };
  }

  return {
    icon: "🥘",
    label: cat,
    badge: `🥘 ${cat}`,
    fallback: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  };
}

export function checkIsAvailable(item) {
  if (!item) return false;
  const val = String(item?.available || "").toLowerCase().trim();
  return val === "yes" || val === "true" || val === "1" || val === "available" || item?.available === true || item?.available === 1;
}

export function getItemDescription(item) {
  if (!item || typeof item !== "object") return "";
  
  for (const key of Object.keys(item)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
    if (["description", "desc", "itemdescription", "details", "detail", "about", "summary", "info"].includes(cleanKey)) {
      const val = item[key];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        return String(val).trim();
      }
    }
  }

  return "";
}

export function calculateGST(subtotal, rate = 0.05) {
  return Math.round(Number(subtotal || 0) * rate);
}

export function calculateDeliveryCharge(subtotal, freeShipApplied = false) {
  const amt = Number(subtotal || 0);
  if (freeShipApplied || amt >= 600) return 0;
  if (amt >= 300) return 20;
  return 40;
}

export function validateCoupon(codeStr, subtotal) {
  const code = String(codeStr || "").trim().toUpperCase();
  const amt = Number(subtotal || 0);

  if (!code) {
    return { valid: false, code: "", discount: 0, freeShip: false, message: "" };
  }

  if (code === "WELCOME50") {
    if (amt < 299) {
      return { valid: false, code, discount: 0, freeShip: false, message: "❌ न्यूनतम ऑर्डर ₹299 आवश्यक है (Minimum ₹299 required for WELCOME50)" };
    }
    return { valid: true, code, discount: 50, freeShip: false, message: "✅ Coupon Applied" };
  }

  if (code === "FIRSTORDER") {
    if (amt < 499) {
      return { valid: false, code, discount: 0, freeShip: false, message: "❌ न्यूनतम ऑर्डर ₹499 आवश्यक है (Minimum ₹499 required for FIRSTORDER)" };
    }
    const disc = Math.min(Math.round(amt * 0.10), 100);
    return { valid: true, code, discount: disc, freeShip: false, message: "✅ Coupon Applied" };
  }

  if (code === "SUCHITRA20") {
    if (amt < 799) {
      return { valid: false, code, discount: 0, freeShip: false, message: "❌ न्यूनतम ऑर्डर ₹799 आवश्यक है (Minimum ₹799 required for SUCHITRA20)" };
    }
    const disc = Math.min(Math.round(amt * 0.20), 150);
    return { valid: true, code, discount: disc, freeShip: false, message: "✅ Coupon Applied" };
  }

  if (code === "FREESHIP") {
    if (amt < 399) {
      return { valid: false, code, discount: 0, freeShip: false, message: "❌ न्यूनतम ऑर्डर ₹399 आवश्यक है (Minimum ₹399 required for FREESHIP)" };
    }
    return { valid: true, code, discount: 0, freeShip: true, message: "✅ Coupon Applied" };
  }

  return { valid: false, code, discount: 0, freeShip: false, message: "❌ अमान्य कूपन कोड (Invalid Coupon Code)" };
}
