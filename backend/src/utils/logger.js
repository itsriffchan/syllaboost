/**
 * Logger utility for console logging
 * Add timestamps and structured output
 */
export const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${message}`);
    }
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error);
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.warn(`[${timestamp}] WARN: ${message}`, data);
    } else {
      console.warn(`[${timestamp}] WARN: ${message}`);
    }
  },
};
