export class ApiConstants {

  // ===========================
  // Core Cloud Kitchen Account
  // ===========================
  static coreBaseUrl = "https://ap2007.app.n8n.cloud";

  static getMenu = "/webhook/get-menu";
  static placeOrder = "/webhook/place-order";
  static kitchenOrders = "/webhook/kitchen-orders";
  static trackOrder = "/webhook/track-order";
  static updateOrder = "/webhook/update-order-status";
  static addMenu = "/webhook/add-menu-item";
  static updateMenu = "/webhook/update-menu-item";
  static whatsappKitchen = "/webhook/whatsapp-kitchen-commands";
  static scheduledOrders = "/webhook/scheduled-order-dispatcher";


  // ===========================
  // AI Account
  // ===========================
  static aiBaseUrl = "https://amigos16.app.n8n.cloud";

  static kitchenAI = "/webhook/kitchen-ai";
  static aiOrderAssistant = "/webhook/ai-order-assistant";
  static aiSalesAssistant = "/webhook/ai-sales-assistant";
  static aiInventory = "/webhook/ai-inventory-update";
  static kitchenStatus = "/webhook/kitchen-status-assistant";
  static aiAnalytics = "/webhook/ai-analytics-assistant";
}
