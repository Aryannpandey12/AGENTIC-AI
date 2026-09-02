import { ApiClient } from './apiClient.js';
import { ApiConstants } from './apiConstants.js';

/**
 * KitchenService - Monitors and controls global kitchen open/closed operational status.
 * Targeted to Account 2: AI-Powered Workflows (aryan-project.app.n8n.cloud)
 */
class KitchenServiceClass {
  /**
   * Get current kitchen operational status (open or closed) from Account 2.
   */
  async getKitchenStatus() {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.kitchenStatus}`;
    return ApiClient.get(url);
  }

  /**
   * Set kitchen status (e.g. { status: 'closed' }).
   */
  async updateKitchenStatus(statusPayload) {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.kitchenStatus}`;
    return ApiClient.post(url, statusPayload);
  }
}

export const KitchenService = new KitchenServiceClass();
