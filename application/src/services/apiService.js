import { AiService } from './aiService.js';
import { OrdersService } from './ordersService.js';
import { MenuService } from './menuService.js';
import { KitchenService } from './kitchenService.js';
import { ApiClient } from './apiClient.js';
import { ApiConstants } from './apiConstants.js';

/**
 * Unified ApiService facade delegating to specialized domain services.
 * Keeps existing screen code clean and compatible while providing separated modular debugging.
 */
class ApiServiceFacade {
  // AI Voice Router
  async sendVoiceMessage(messageText) {
    return AiService.sendVoiceMessage(messageText);
  }

  async analytics(queryText) {
    return AiService.analytics(queryText);
  }

  // Kitchen Orders
  async getOrders() {
    return OrdersService.getOrders();
  }

  async updateOrder(orderId, status) {
    return OrdersService.updateOrder(orderId, status);
  }

  // Kitchen Menu
  async getMenu() {
    return MenuService.getMenu();
  }

  async updateMenu(updates) {
    return MenuService.updateMenu(updates);
  }

  // Kitchen Status
  async getKitchenStatus() {
    return KitchenService.getKitchenStatus();
  }

  async updateKitchenStatus(statusPayload) {
    return KitchenService.updateKitchenStatus(statusPayload);
  }
}

export const ApiService = new ApiServiceFacade();
export {
  AiService,
  OrdersService,
  MenuService,
  KitchenService,
  ApiClient,
  ApiConstants,
};
