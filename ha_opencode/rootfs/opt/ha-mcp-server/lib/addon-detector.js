/**
 * Addon Detector - Auto-detect installed Home Assistant addons and integrations
 * Enables/disables MCP tools based on what's running in the user's HA instance
 */
import { callSupervisor } from "./ha-api.js";

/**
 * Detect installed addons from Supervisor API
 * @returns {Array} List of installed addon slugs
 */
export async function detectInstalledAddons() {
  try {
    const response = await callSupervisor("/addons", { method: "GET" });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    // Supervisor returns { data: { addons: [...] } }
    const addons = data?.data?.addons || data?.addons || [];
    return addons
      .filter((a) => a.state === "started" || a.state === "installed")
      .map((a) => a.slug);
  } catch (error) {
    console.error("Failed to detect addons:", error.message);
    return [];
  }
}

/**
 * Map addon slugs to MCP integration config keys
 * @returns {Object} Mapping of slug -> { enabled, config_keys, defaults }
 */
export function getAddonIntegrationMap() {
  return {
    // HACS
    "5c3de251-adb2-4c82-bd94-c1d9550765e2": {
      name: "HACS",
      slug: "hacs",
      config_key: "hacs_enabled",
      config_fields: ["hacs_enabled"],
      auto_enable: true,
    },
    // Grafana (common slug patterns)
    "a0d7b954-grafana": {
      name: "Grafana",
      slug: "grafana",
      config_key: "grafana_enabled",
      config_fields: ["grafana_enabled", "grafana_url"],
      auto_enable: true,
      url_pattern: "http://{slug}:80",
    },
    // Node-RED (common slug patterns)
    "a0d7b954-nodered": {
      name: "Node-RED",
      slug: "nodered",
      config_key: "nodered_enabled",
      config_fields: ["nodered_enabled", "nodered_url"],
      auto_enable: true,
      url_pattern: "http://{slug}:1880",
    },
    // InfluxDB
    "a0d7b954-influxdb": {
      name: "InfluxDB",
      slug: "influxdb",
      config_key: "influxdb_enabled",
      config_fields: ["influxdb_enabled", "influxdb_url", "influxdb_org", "influxdb_bucket"],
      auto_enable: true,
      url_pattern: "http://{slug}:8086",
    },
    // MariaDB (core addon)
    "core_mariadb": {
      name: "MariaDB",
      slug: "mariadb",
      config_key: null, // No dedicated MCP tool yet
      auto_enable: false,
    },
    // Frigate (common slug patterns)
    "a0d7b954-frigate": {
      name: "Frigate",
      slug: "frigate",
      config_key: "frigate_enabled",
      config_fields: ["frigate_enabled", "frigate_url"],
      auto_enable: true,
      url_pattern: "http://{slug}:5000",
    },
    // Music Assistant
    "a0d7b954-music-assistant": {
      name: "Music Assistant",
      slug: "music-assistant",
      config_key: "music_assistant_enabled",
      config_fields: ["music_assistant_enabled", "music_assistant_url"],
      auto_enable: true,
      url_pattern: "http://{slug}:8095",
    },
    // Zigbee2MQTT
    "a0d7b954-zigbee2mqtt": {
      name: "Zigbee2MQTT",
      slug: "zigbee2mqtt",
      config_key: null,
      config_fields: ["z2m_url", "z2m_mqtt_topic"],
      auto_enable: false,
    },
    // ESPHome
    "a0d7b954-esphome": {
      name: "ESPHome",
      slug: "esphome",
      config_key: null,
      auto_enable: false,
    },
  };
}

/**
 * Build recommended config based on detected addons
 * @param {Array} installedAddons - List of installed addon slugs/names
 * @returns {Object} Recommended config changes
 */
export function buildRecommendedConfig(installedAddons) {
  const integrationMap = getAddonIntegrationMap();
  const recommendations = {
    enable: [],
    disable: [],
    set_url: {},
    message: "",
  };

  for (const addon of installedAddons) {
    const integration = Object.values(integrationMap).find((i) =>
      addon.toLowerCase().includes(i.slug.toLowerCase()) ||
      addon.toLowerCase().includes(i.name.toLowerCase())
    );

    if (integration && integration.auto_enable && integration.config_key) {
      recommendations.enable.push({
        key: integration.config_key,
        value: true,
        reason: `Detected installed addon: ${integration.name}`,
      });

      // Suggest URL if pattern available
      if (integration.url_pattern) {
        const url = integration.url_pattern.replace("{slug}", addon);
        recommendations.set_url[integration.config_fields.find((f) => f.includes("url"))] = url;
      }
    }
  }

  if (recommendations.enable.length > 0) {
    recommendations.message = `Detected ${recommendations.enable.length} compatible addon(s). Recommend enabling: ${recommendations.enable.map((e) => e.key).join(", ")}`;
  } else {
    recommendations.message = "No compatible addons detected. All integrations remain disabled.";
  }

  return recommendations;
}
