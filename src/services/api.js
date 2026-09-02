import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://ap2007.app.n8n.cloud/webhook").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Simple response interceptor to log API errors in browser console
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const menuApi = {
  getMenu: async () => {
    const res = await apiClient.get("/menu");
    return res.data;
  },

  addMenuItem: async (payload) => {
    const res = await apiClient.post("/add-menu-item", payload);
    return res.data;
  },

  updateMenuItem: async (payload) => {
    const res = await apiClient.post("/update-menu-item", payload);
    return res.data;
  }
};

export const orderApi = {
  placeOrder: async (payload) => {
    const res = await apiClient.post("/place-order", payload);
    return res.data;
  },

  trackOrder: async (orderId) => {
    const res = await apiClient.get(`/track-order?order_id=${encodeURIComponent(orderId)}`);
    return res.data;
  },

  getKitchenOrders: async () => {
    const res = await apiClient.get("/kitchen-orders");
    return res.data;
  },

  updateOrderStatus: async (payload) => {
    const res = await apiClient.post("/update-order-status", payload);
    return res.data;
  }
};

export default apiClient;