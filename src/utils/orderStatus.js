export const ORDER_STATUS = {
  PLACED: "Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};

export const KITCHEN_STATUS = {
  RECEIVED: "Order Received",
  PREPARING: "Preparing",
  READY: "Ready"
};

export const DELIVERY_STATUS = {
  PENDING: "Pending",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered"
};

export function isNewOrder(order) {
  return order?.order_status === ORDER_STATUS.PLACED;
}

export function isCompletedOrder(order) {
  return [ORDER_STATUS.COMPLETED, ORDER_STATUS.REJECTED, ORDER_STATUS.DELIVERED].includes(order?.order_status);
}

export function isActiveOrder(order) {
  if (!order || isCompletedOrder(order) || isNewOrder(order)) return false;
  const oStatus = order.order_status;
  const kStatus = order.kitchen_status;
  const dStatus = order.delivery_status;
  return (
    oStatus === "Accepted" ||
    oStatus === "Preparing" ||
    oStatus === "Ready" ||
    oStatus === "Out for Delivery" ||
    kStatus === "Preparing" ||
    kStatus === "Ready" ||
    dStatus === "Out for Delivery"
  );
}

export function getStatusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (["accepted", "ready", "delivered", "completed", "yes", "available"].includes(normalized)) return "green";
  if (["placed", "order received", "pending", "preparing"].includes(normalized)) return "amber";
  if (["rejected", "unavailable", "no"].includes(normalized)) return "red";
  if (["out for delivery"].includes(normalized)) return "blue";
  return "stone";
}

