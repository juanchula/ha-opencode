/**
 * Mobile detection and adaptive UI features for MCP server
 * Detects mobile clients and provides mobile-aware responses
 */

/**
 * Detect if the MCP client is a mobile device
 * @param {string} userAgent - User-Agent string from MCP client
 * @returns {boolean} - True if mobile device detected
 */
export function isMobileClient(userAgent) {
  if (!userAgent) return false;
  
  const mobilePatterns = [
    /Android/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /webOS/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i,
    /Tablet/i,
    /Android/i,
  ];
  
  return mobilePatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Detect if the MCP client is a tablet
 * @param {string} userAgent - User-Agent string from MCP client
 * @returns {boolean} - True if tablet detected
 */
export function isTabletClient(userAgent) {
  if (!userAgent) return false;
  
  const tabletPatterns = [
    /iPad/i,
    /Android.*Tablet/i,
    /Tablet/i,
  ];
  
  return tabletPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Get mobile-friendly description (shorter, simpler)
 * @param {string} fullDescription - Original description
 * @returns {string} - Mobile-friendly version
 */
export function getMobileDescription(fullDescription) {
  if (!fullDescription) return fullDescription;
  
  // Only truncate if longer than 150 chars
  if (fullDescription.length <= 150) {
    return fullDescription;
  }
  
  const summary = fullDescription.substring(0, 150) + '...';
  return summary;
}

/**
 * Check if clipboard API is available (mobile support check)
 * @returns {boolean} - True if clipboard API is available
 */
export function hasClipboardSupport() {
  return typeof navigator !== 'undefined' && 
         navigator.clipboard !== undefined;
}

/**
 * Get mobile-specific tool descriptions
 * @param {Array} tools - Tool definitions
 * @returns {Array} - Tools with mobile-optimized descriptions
 */
export function optimizeToolsForMobile(tools) {
  return tools.map(tool => ({
    ...tool,
    description: getMobileDescription(tool.description),
  }));
}
