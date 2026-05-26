/**
 * Device information and environment detection
 * Provides device info for debugging and adaptive responses
 */

/**
 * Get MCP server device information
 * @returns {Object} - Device and environment info
 */
export function getDeviceInfo() {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    homeAssistantVersion: process.env.HOME_ASSISTANT_VERSION || 'unknown',
    supervisorVersion: process.env.SUPERVISOR_VERSION || 'unknown',
    addonVersion: process.env.HOME_ASSISTANT_ADDON_VERSION || 'unknown',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };
}

/**
 * Get client environment information (from request context)
 * @param {Object} context - MCP request context
 * @returns {Object} - Client environment info
 */
export function getClientInfo(context) {
  const clientInfo = {};
  
  if (context && context.params) {
    // Extract from request params if available
    clientInfo.userAgent = context.params.mcp_user_agent || 'unknown';
    clientInfo.clientVersion = context.params.client_version || 'unknown';
  }
  
  return clientInfo;
}

/**
 * Check if running in Home Assistant environment
 * @returns {boolean} - True if in HA environment
 */
export function isRunningInHA() {
  return !!process.env.SUPERVISOR_TOKEN;
}

/**
 * Get Home Assistant configuration directory
 * @returns {string} - Config directory path
 */
export function getHAConfigDir() {
  return process.env.HOME_ASSISTANT_CONFIG_DIR || '/homeassistant';
}
