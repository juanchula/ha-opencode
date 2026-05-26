/**
 * Clipboard functionality for MCP server
 * Provides clipboard operations for mobile and desktop clients
 */

/**
 * Simulate clipboard copy for MCP server
 * Note: Actual clipboard access requires browser context
 * This is a mock for MCP server-to-client communication
 * @param {string} text - Text to copy
 * @returns {Object} - Success status
 */
export function copyToClipboard(text) {
  // Validate input
  if (!text || text.length === 0) {
    throw new Error("Text parameter is required");
  }
  
  // In MCP context, we return the text as a result
  // The MCP client can then handle the clipboard operation
  return {
    success: true,
    message: 'Text ready for clipboard: ' + text.substring(0, 50) + '...',
    text: text,
  };
}

/**
 * Get clipboard status
 * @returns {Object} - Clipboard status information
 */
export function getClipboardStatus() {
  return {
    available: true,
    platform: process.platform,
    supportsClipboard: typeof navigator !== 'undefined' && 
                       navigator.clipboard !== undefined,
  };
}

/**
 * Format text for mobile clipboard (shorter, simpler)
 * @param {string} text - Original text
 * @returns {string} - Mobile-optimized text
 */
export function formatTextForMobile(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .substring(0, 500); // Mobile clipboard has limits
}
