import { ApiClient } from './apiClient.js';
import { ApiConstants } from './apiConstants.js';

/**
 * OrdersService - Handles fetching and updating kitchen order statuses.
 * Targeted to Account 1: Core Operational Workflows (dual-core.app.n8n.cloud)
 */
class OrdersServiceClass {
  /**
   * Fetch today's kitchen orders from Account 1 n8n backend.
   */
  async getOrders() {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.kitchenOrders}`;
    return ApiClient.get(url);
  }

  /**
   * Update the status of a specific order (e.g. Accept, Prepare, Ready, Deliver).
   */
  async updateOrder(orderId, status) {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.updateOrder}`;
    return ApiClient.post(url, { orderId, status });
  }

  /**
   * Place a new order.
   */
  async placeOrder(orderPayload) {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.placeOrder}`;
    return ApiClient.post(url, orderPayload);
  }

  /**
   * Track an order.
   */
  async trackOrder(orderId) {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.trackOrder}`;
    return ApiClient.post(url, { orderId });
  }
}

export const OrdersService = new OrdersServiceClass();
