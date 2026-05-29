/**
 * Developer Tools Integration for Home Assistant
 * Manage Code Server, Terminal/SSH, File Editor, and Samba addons
 */
import { callSupervisor } from "./ha-api.js";

const DEV_ADDONS = [
  { slug: "code-server", name: "Code Server", category: "ide" },
  { slug: "core_ssh", name: "Terminal & SSH", category: "terminal" },
  { slug: "core_samba", name: "Samba", category: "file_sharing" },
  { slug: "core_mariadb", name: "MariaDB", category: "database" },
  { slug: "core_mosquitto", name: "Mosquitto MQTT", category: "broker" },
  { slug: "core_nginx", name: "NGINX Proxy", category: "proxy" },
  { slug: "core_letsencrypt", name: "Let's Encrypt", category: "ssl" },
];

/**
 * Get status of all developer tools addons
 * @returns {Promise<Array>}
 */
export async function getDevToolsStatus() {
  try {
    const addonsInfo = await callSupervisor("/addons");
    const installedAddons = addonsInfo.addons || [];
    return DEV_ADDONS.map(tool => {
      const installed = installedAddons.find(a => a.slug === tool.slug);
      return {
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        installed: !!installed,
        version: installed?.version || null,
        state: installed?.state || "not_installed",
        can_install: !installed,
        can_start: installed?.state === "stopped",
        can_stop: installed?.state === "started",
      };
    });
  } catch (error) {
    throw new Error(`Failed to get dev tools status: ${error.message}`);
  }
}

/**
 * Get detailed info for a specific dev tool addon
 * @param {string} slug - Addon slug
 * @returns {Promise<Object>}
 */
export async function getDevToolInfo(slug) {
  if (!slug) throw new Error("Addon slug is required");
  const result = await callSupervisor(`/addons/${slug}/info`);
  return {
    slug: result.slug || slug,
    name: result.name || slug,
    version: result.version || "unknown",
    state: result.state || "unknown",
    repository: result.repository || "",
    description: result.description || "",
    available: result.available !== false,
    host_network: result.host_network || false,
    ingress_url: result.ingress_url || null,
    webui: result.webui || null,
    watchdog: result.watchdog || false,
  };
}

/**
 * Install a developer tool addon
 * @param {string} slug - Addon slug
 * @returns {Promise<Object>}
 */
export async function installDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  const result = await callSupervisor(`/addons/${slug}/install`, "POST");
  return { success: true, slug, result };
}

/**
 * Uninstall a developer tool
 * @param {string} slug - Addon slug
 * @returns {Promise<Object>}
 */
export async function uninstallDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  const result = await callSupervisor(`/addons/${slug}/uninstall`, "POST");
  return { success: true, slug, result };
}

/**
 * Build a developer tool addon
 * @param {string} slug - Addon slug
 * @returns {Promise<Object>}
 */
export async function buildDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  const result = await callSupervisor(`/addons/${slug}/build`, "POST");
  return { success: true, slug, result };
}

/**
 * Start/stop/restart a developer tool addon
 */
export async function startDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  await callSupervisor(`/addons/${slug}/start`, "POST");
  return { success: true, slug, action: "started" };
}

export async function stopDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  await callSupervisor(`/addons/${slug}/stop`, "POST");
  return { success: true, slug, action: "stopped" };
}

export async function restartDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  await callSupervisor(`/addons/${slug}/restart`, "POST");
  return { success: true, slug, action: "restarted" };
}

/**
 * Update a developer tool addon
 * @param {string} slug - Addon slug
 * @returns {Promise<Object>}
 */
export async function updateDevTool(slug) {
  if (!slug) throw new Error("Addon slug is required");
  const result = await callSupervisor(`/addons/${slug}/update`, "POST");
  return { success: true, slug, result };
}

/**
 * List available addons from the store (not just installed)
 * @returns {Promise<Array>}
 */
export async function listAvailableAddons() {
  try {
    const result = await callSupervisor("/addons?all=true");
    return (result.addons || []).map(a => ({
      slug: a.slug,
      name: a.name,
      version: a.version,
      installed: a.installed || false,
      available: a.available !== false,
      description: a.description || "",
      repository: a.repository || "",
    }));
  } catch (error) {
    throw new Error(`Failed to list available addons: ${error.message}`);
  }
}

/**
 * Search for addons by name or description
 * @param {string} query - Search query
 * @returns {Promise<Array>}
 */
export async function searchAddons(query) {
  if (!query) throw new Error("Search query is required");
  const all = await listAvailableAddons();
  const lower = query.toLowerCase();
  return all.filter(a =>
    a.name.toLowerCase().includes(lower) ||
    a.slug.toLowerCase().includes(lower) ||
    (a.description && a.description.toLowerCase().includes(lower))
  );
}
