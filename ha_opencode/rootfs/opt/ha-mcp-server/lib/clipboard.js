/**
 * Clipboard functionality for MCP server
 * 
 * IMPORTANT: The MCP server runs server-side and cannot directly access
 * the user's system clipboard. Instead, we return clipboard-ready data
 * that the OpenCode browser UI can use to copy to the user's clipboard.
 * 
 * The browser UI should:
 * 1. Check for `clipboard` field in tool results
 * 2. Call navigator.clipboard.writeText(text) on user interaction
 * 3. Show visual feedback ("Copied!" toast)
 */

/**
 * Copy text to clipboard (server-side prepares data for client)
 * Returns the text in a format the browser UI can copy
 * @param {string} text - Text to copy
 * @returns {Object} - Clipboard-ready result with browser instructions
 */
export function copyToClipboard(text) {
  if (!text || text.length === 0) {
    throw new Error("Text parameter is required");
  }

  const mobileOptimized = formatTextForMobile(text);

  return {
    success: true,
    clipboard: {
      text: text,
      mobile_optimized: mobileOptimized,
      length: text.length,
    },
    message: `Ready to copy ${text.length} characters. Click the copy button or press Ctrl+C.`,
    instructions: {
      browser: "Use navigator.clipboard.writeText() to copy this text",
      shortcut: "Ctrl+C / Cmd+C after selecting the text",
      fallback: "If browser clipboard fails, use the terminal's native copy",
    },
  };
}

/**
 * Format text for mobile clipboard (strip YAML formatting, keep value only)
 * @param {string} text - Original text (often YAML or config)
 * @returns {string} - Clean value ready for clipboard
 */
export function formatTextForMobile(text) {
  if (!text) return '';
  
  // If it looks like YAML, extract the value
  const yamlMatch = text.match(/^[a-z_]+:\s*(.+)$/m);
  if (yamlMatch) {
    return yamlMatch[1].trim();
  }
  
  // Clean up whitespace for mobile
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .trim()
    .substring(0, 500);
}

/**
 * Get clipboard capability info
 * @returns {Object}
 */
export function getClipboardStatus() {
  return {
    available: true,
    mode: "browser_api",
    note: "Clipboard requires browser UI support. The server returns clipboard data, the browser copies it.",
    requires_browser: true,
    browser_api: "navigator.clipboard.writeText()",
    fallback: "Manual Ctrl+C / Cmd+C selection",
  };
}

/**
 * Extract clipboard text from various sources
 * @param {Object} source - Source object (entity, service result, etc)
 * @returns {string} - Plain text suitable for clipboard
 */
export function extractClipboardText(source) {
  if (typeof source === 'string') return source;
  if (source.text) return source.text;
  if (source.state) return String(source.state);
  if (source.attributes) {
    const friendly = source.attributes.friendly_name || source.entity_id;
    return `${friendly}: ${source.state}`;
  }
  return JSON.stringify(source, null, 2);
}
