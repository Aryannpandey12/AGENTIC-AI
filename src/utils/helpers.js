export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

export function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function normalizeApiList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.menu)) return response.menu;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export function normalizeOrderResponse(response) {
  if (response?.order && typeof response.order === "object") return response.order;
  if (response && typeof response === "object" && response.order_id) return response;
  return null;
}

export function normalizeApiObject(data) {
  if (data?.data && typeof data.data === "object") return data.data;
  return data || null;
}

export function getOrderTotal(order) {
  if (order?.total_amount) return Number(order.total_amount);
  return (order?.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
}

export function isAvailable(item) {
  return String(item?.available || "").toLowerCase() === "yes" || item?.available === true;
}

