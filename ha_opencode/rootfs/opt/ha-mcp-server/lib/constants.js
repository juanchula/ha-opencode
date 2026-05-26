/**
 * Home Assistant MCP Server Constants
 *
 * Environment variables, error messages, and configuration constants
 * extracted from index.js for testability.
 */

export const SUPERVISOR_API = "http://supervisor/core/api";
export const HA_CONFIG_DIR = "/homeassistant";
export const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;
export const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

// Clear error message when ESPHome tools are used without an access token
export const ESPHOME_TOKEN_ERROR = "ESPHome tools require a Long-Lived Access Token.\n\n" +
  "To configure:\n" +
  "1. Go to your Home Assistant Profile page (click your user icon)\n" +
  "2. Scroll to Long-Lived Access Tokens and create one\n" +
  "3. Go to Settings \u2192 Add-ons \u2192 OpenCode \u2192 Configuration\n" +
  "4. Paste the token into the 'access_token' field\n" +
  "5. Restart the OpenCode add-on (with ESPHome already running)";

// Screenshot feature
export const SCREENSHOT_ENABLED = process.env.SCREENSHOT_ENABLED === "true";
export const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

export const SCREENSHOT_DISABLED_ERROR = "Screenshot tool is disabled.\n\n" +
  "To enable visual verification:\n" +
  "1. Go to Settings \u2192 Add-ons \u2192 OpenCode \u2192 Configuration\n" +
  "2. Enable 'Screenshot tool'\n" +
  "3. Set a Long-Lived Access Token (Profile \u2192 Long-Lived Access Tokens)\n" +
  "4. Restart the OpenCode add-on";

export const SCREENSHOT_TOKEN_ERROR = "Screenshot tool requires a Long-Lived Access Token.\n\n" +
  "To configure:\n" +
  "1. Go to your Home Assistant Profile page (click your user icon)\n" +
  "2. Scroll to Long-Lived Access Tokens and create one\n" +
  "3. Go to Settings \u2192 Add-ons \u2192 OpenCode \u2192 Configuration\n" +
  "4. Paste the token into the 'access_token' field\n" +
  "5. Restart the OpenCode add-on";

// Home Assistant documentation base URLs
export const HA_DOCS_BASE = "https://www.home-assistant.io";
export const HA_INTEGRATIONS_URL = `${HA_DOCS_BASE}/integrations`;
export const HA_BLOG_URL = `${HA_DOCS_BASE}/blog`;

// Log level constants
export let currentLogLevel = "info";
export const LOG_LEVELS = ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"];

export function setLogLevel(level) {
  currentLogLevel = level;
}

export function getLogLevelIndex(level) {
  return LOG_LEVELS.indexOf(level);
}

export function shouldLog(level) {
  return getLogLevelIndex(level) >= getLogLevelIndex(currentLogLevel);
}

export function sendLog(level, logger, data) {
  if (shouldLog(level)) {
    console.error(JSON.stringify({
      type: "log",
      level,
      logger,
      data,
      timestamp: new Date().toISOString(),
    }));
  }
}
