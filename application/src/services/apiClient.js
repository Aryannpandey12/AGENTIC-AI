import { ApiConstants } from './apiConstants.js';

/**
 * ApiClient - Core HTTP engine with rich debugging, timeout handling, and auto-retry logic.
 * Designed for clear communication monitoring across both n8n Cloud accounts.
 */
class ApiClientClass {
  constructor() {
    this.defaultTimeoutMs = 12000; // 12 seconds
    this.debugEnabled = true; // Enable console debugging for communication traces
  }

  /**
   * Helper to log API requests/responses nicely in the browser console for debugging.
   */
  _logDebug(type, title, data = null) {
    if (!this.debugEnabled) return;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const styles = {
      REQ: 'background: #0056b3; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      RES: 'background: #2e7d32; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      ERR: 'background: #c62828; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    };

    console.group(`%c${type}%c [${timestamp}] ${title}`, styles[type] || '', 'color: inherit; font-weight: bold;');
    if (data !== null) {
      console.log(data);
    }
    console.groupEnd();
  }

  /**
   * Core request execution with retry and fallback capabilities.
   */
  async request(endpoint, options = {}, retries = 1) {
    const url = endpoint.startsWith('http') ? endpoint : `${ApiConstants.aiBaseUrl}${endpoint}`;
    const startTime = performance.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = options.signal ? null : new AbortController();
      const signal = options.signal || controller.signal;
      const timeoutId = controller ? setTimeout(() => controller.abort(), this.defaultTimeoutMs) : null;

      if (attempt === 0) {
        this._logDebug('REQ', `${options.method || 'GET'} ${url}`, {
          headers: options.headers,
          body: options.body ? JSON.parse(options.body) : undefined,
        });
      }

      try {
        const response = await fetch(url, { ...options, signal });
        if (timeoutId) clearTimeout(timeoutId);

        const duration = Math.round(performance.now() - startTime);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} (${response.statusText})`);
        }

        const data = await response.json();
        this._logDebug('RES', `${options.method || 'GET'} ${url} (${response.status} OK in ${duration}ms)`, data);
        return data;
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);

        // If request was explicitly aborted (e.g. user spoke a new voice query), cancel cleanly
        if (err.name === 'AbortError' && options.signal) {
          this._logDebug('ERR', `ABORTED: ${options.method || 'GET'} ${url}`, { reason: 'Cancelled by new request' });
          throw new Error('पिछला अनुरोध रद्द किया गया।');
        }

        // On final attempt, try fallback to local dev mock endpoint if remote cloud failed
        if (attempt === retries) {
          if (url.startsWith('http')) {
            let localUrl = url;
            if (url.startsWith(ApiConstants.coreBaseUrl)) {
              localUrl = url.replace(ApiConstants.coreBaseUrl, '');
            } else if (url.startsWith(ApiConstants.aiBaseUrl)) {
              localUrl = url.replace(ApiConstants.aiBaseUrl, '');
            } else {
              try { localUrl = new URL(url).pathname; } catch (e) {}
            }

            try {
              this._logDebug('REQ', `[FALLBACK DEV MOCK] ${options.method || 'GET'} ${localUrl}`);
              const fallbackRes = await fetch(localUrl, options);
              if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                this._logDebug('RES', `[FALLBACK DEV MOCK] ${localUrl} (200 OK)`, fallbackData);
                return fallbackData;
              }
            } catch (fallbackErr) {
              // Ignore dev fallback errors
            }
          }

          const duration = Math.round(performance.now() - startTime);
          this._logDebug('ERR', `FAILED after ${retries + 1} attempts: ${options.method || 'GET'} ${url} (${duration}ms)`, {
            error: err.message,
          });
          throw new Error(err.message || 'सर्वर या इंटरनेट से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।');
        }

        // Wait 500ms before retrying network request
        await new Promise((res) => setTimeout(res, 500));
      }
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body = {}, customOptions = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customOptions.headers || {}),
      },
      body: JSON.stringify(body),
      signal: customOptions.signal,
    });
  }
}

export const ApiClient = new ApiClientClass();
