import { ApiClient } from './apiClient.js';
import { ApiConstants } from './apiConstants.js';

/**
 * MenuService - Handles loading and modifying dish availability on the menu.
 * Targeted to Account 1: Core Operational Workflows (dual-core.app.n8n.cloud)
 */
class MenuServiceClass {
  /**
   * Fetch full menu from Account 1 backend.
   */
  async getMenu() {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.getMenu}`;
    return ApiClient.get(url);
  }

  /**
   * Update dish availability list.
   */
  async updateMenu(updates) {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.updateMenu}`;
    return ApiClient.post(url, updates);
  }

  /**
   * Add a new dish to the menu.
   */
  async addMenuItem(itemPayload) {
    const url = `${ApiConstants.coreBaseUrl}${ApiConstants.addMenu}`;
    return ApiClient.post(url, itemPayload);
  }
}

export const MenuService = new MenuServiceClass();
