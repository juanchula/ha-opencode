/**
 * Config Editor for OpenCode addon config.yaml
 * Allows safe editing of the addon configuration via MCP
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use HA_CONFIG_DIR env var if available (set by supervisor), otherwise fallback to relative path
const HA_CONFIG_DIR = process.env.HA_CONFIG_DIR || "";
const CONFIG_PATH = HA_CONFIG_DIR 
  ? `${HA_CONFIG_DIR}/config.yaml` 
  : "/config/config.yaml"; // HA standard config path

const CONFIG_BACKUP_PATH = CONFIG_PATH + ".bak";

/**
 * Read the current config.yaml
 * @returns {Object} Parsed config
 */
export function readConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at: ${CONFIG_PATH}`);
  }
  const content = readFileSync(CONFIG_PATH, "utf-8");
  return { content, path: CONFIG_PATH };
}

/**
 * Validate that a key exists in config schema
 * @param {string} key - Config key to validate
 * @returns {boolean}
 */
export function isValidConfigKey(key) {
  const validKeys = [
    "mcp_enabled", "lsp_enabled", "cpu_mode", "terminal_theme",
    "font_size", "cursor_style", "cursor_blink", "screenshot_enabled",
    "access_token", "z2m_url", "z2m_mqtt_topic",
    "hacs_enabled", "grafana_enabled", "grafana_url",
    "nodered_enabled", "nodered_url",
    "influxdb_enabled", "influxdb_url",
    "frigate_enabled", "frigate_url",
    "music_assistant_enabled", "music_assistant_url",
    "addon_manager_enabled", "backup_manager_enabled",
    "env_vars", "opencode_config",
  ];
  return validKeys.includes(key);
}

/**
 * Edit a single config value in config.yaml
 * @param {string} key - Config key to modify
 * @param {string|boolean|number} value - New value
 * @returns {Object} Result with preview
 */
export function editConfigValue(key, value) {
  if (!isValidConfigKey(key)) {
    const validKeys = [
      "mcp_enabled", "lsp_enabled", "cpu_mode", "terminal_theme",
      "font_size", "cursor_style", "cursor_blink", "screenshot_enabled",
      "access_token", "z2m_url", "z2m_mqtt_topic", "env_vars", "opencode_config",
    ];
    throw new Error(`Invalid config key: "${key}". Valid keys: ${validKeys.join(", ")}`);
  }

  if (!existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at: ${CONFIG_PATH}`);
  }

  const original = readFileSync(CONFIG_PATH, "utf-8");

  // Create backup
  copyFileSync(CONFIG_PATH, CONFIG_BACKUP_PATH);

  // Replace the key's value
  const yamlValue = typeof value === "string" ? `"${value}"` : String(value);
  const pattern = new RegExp(`^(\\s*${key}:\\s*)(.+)$`, "m");

  if (!pattern.test(original)) {
    copyFileSync(CONFIG_BACKUP_PATH, CONFIG_PATH);
    throw new Error(`Key "${key}" not found in config.yaml`);
  }

  const updated = original.replace(pattern, `$1${yamlValue}`);

  writeFileSync(CONFIG_PATH, updated, "utf-8");
  return {
    success: true,
    key,
    old_value: original.match(pattern)?.[2]?.trim() || "unknown",
    new_value: yamlValue,
    preview: updated.substring(0, 500),
    backup_path: CONFIG_BACKUP_PATH,
  };
}

/**
 * Append a new environment variable to the env_vars list
 * @param {string} name - Variable name
 * @param {string} value - Variable value
 * @returns {Object} Result
 */
export function addEnvVar(name, value) {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at: ${CONFIG_PATH}`);
  }

  const original = readFileSync(CONFIG_PATH, "utf-8");
  copyFileSync(CONFIG_PATH, CONFIG_BACKUP_PATH);

  // Find the env_vars section and append
  const envVarsMatch = original.match(/env_vars:\s*\n(?:\s+- .+\n)*/);
  
  if (!envVarsMatch) {
    copyFileSync(CONFIG_BACKUP_PATH, CONFIG_PATH);
    throw new Error("env_vars section not found in config.yaml");
  }

  const newEntry = `  - name: ${name}\n    value: ${value}\n`;
  const insertPoint = envVarsMatch.index + envVarsMatch[0].length;
  const updated = original.slice(0, insertPoint) + newEntry + original.slice(insertPoint);

  writeFileSync(CONFIG_PATH, updated, "utf-8");
  return {
    success: true,
    action: "added env var",
    name,
    backup: CONFIG_BACKUP_PATH,
    preview: updated.substring(0, 500),
  };
}
