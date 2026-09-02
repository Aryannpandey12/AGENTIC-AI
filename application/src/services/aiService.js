import { ApiClient } from './apiClient.js';
import { ApiConstants } from './apiConstants.js';

/**
 * AiService - Handles AI voice queries and assistants routed to Account 2 n8n webhooks.
 * Targeted to Account 2: AI-Powered Workflows (aryan-project.app.n8n.cloud)
 */
class AiServiceClass {
  constructor() {
    this.voiceAbortController = null;
  }

  /**
   * Sends voice or text input to Account 2 AI Router (/webhook/kitchen-ai).
   * Automatically cancels any pending previous speech request.
   */
  async sendVoiceMessage(messageText) {
    if (this.voiceAbortController) {
      this.voiceAbortController.abort();
    }
    this.voiceAbortController = new AbortController();

    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.kitchenAI}`;
    return ApiClient.post(
      url,
      { message: messageText, text: messageText },
      { signal: this.voiceAbortController.signal }
    );
  }

  /**
   * AI Order Assistant queries.
   */
  async orderAssistant(queryPayload) {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.aiOrderAssistant}`;
    return ApiClient.post(url, queryPayload);
  }

  /**
   * AI Sales Assistant queries.
   */
  async salesAssistant(queryPayload) {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.aiSalesAssistant}`;
    return ApiClient.post(url, queryPayload);
  }

  /**
   * AI Inventory Update queries.
   */
  async inventoryUpdate(payload) {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.aiInventory}`;
    return ApiClient.post(url, payload);
  }

  /**
   * Sends conversational analytics queries to AI Analytics Assistant.
   */
  async analytics(queryText) {
    const url = `${ApiConstants.aiBaseUrl}${ApiConstants.aiAnalytics}`;
    return ApiClient.post(url, { message: queryText, text: queryText });
  }
}

export const AiService = new AiServiceClass();
