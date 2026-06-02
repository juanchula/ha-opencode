/**
 * OpenCode Manager - Update and manage OpenCode installation
 */
import { execSync } from "child_process";

/**
 * Get current OpenCode version
 * @returns {string} - Version string
 */
export function getOpenCodeVersion() {
  try {
    const output = execSync("opencode --version 2>/dev/null || echo 'unknown'")
      .toString()
      .trim();
    return output || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Update OpenCode to the latest version via npm
 * @returns {Object} - Update result
 */
export function updateOpenCode() {
  try {
    const oldVersion = getOpenCodeVersion();
    
    const result = execSync("npm install -g opencode-ai@latest 2>&1", {
      timeout: 120000, // 2 min timeout for npm install
    }).toString();
    
    const newVersion = getOpenCodeVersion();
    
    // Parse npm output for version info
    const versionMatch = result.match(/opencode-ai@(\S+)/);
    const installedVersion = versionMatch ? versionMatch[1] : newVersion;
    
    return {
      success: true,
      old_version: oldVersion,
      new_version: installedVersion,
      changed: oldVersion !== installedVersion,
      log: result.substring(0, 500), // Truncate to avoid huge responses
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      log: error.stderr || "",
    };
  }
}

/**
 * Read the OpenCode config.json (custom user config)
 * @returns {Object} - Parsed config or null
 */
export function readOpenCodeConfig() {
  try {
    const { readFileSync, existsSync } = require("fs");
    const configPath = "/data/.config/opencode/config.json";
    
    if (!existsSync(configPath)) {
      return { exists: false, path: configPath, data: null };
    }
    
    const content = readFileSync(configPath, "utf-8");
    const data = JSON.parse(content);
    return { exists: true, path: configPath, data };
  } catch (error) {
    return { exists: false, error: error.message, data: null };
  }
}

/**
 * Write the OpenCode config.json (custom user config)
 * @param {Object} config - JSON config object
 * @returns {Object} - Write result
 */
export function writeOpenCodeConfig(config) {
  try {
    const { writeFileSync, mkdirSync, existsSync } = require("fs");
    const configPath = "/data/.config/opencode/config.json";
    const backupPath = "/data/.config/opencode/config.json.bak";
    
    // Ensure directory exists
    if (!existsSync("/data/.config/opencode")) {
      mkdirSync("/data/.config/opencode", { recursive: true });
    }
    
    // Backup existing config
    const { existsSync: exists } = require("fs");
    if (exists(configPath)) {
      const { copyFileSync } = require("fs");
      copyFileSync(configPath, backupPath);
    }
    
    // Write new config
    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    
    return {
      success: true,
      path: configPath,
      backup_path: backupPath,
      note: "Config written. Changes take effect on next addon restart.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

