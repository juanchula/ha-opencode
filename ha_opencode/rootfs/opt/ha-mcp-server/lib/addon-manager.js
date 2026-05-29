import { callSupervisor } from "./ha-api.js";

/**
 * Add-on Manager for Home Assistant Supervisor
 * Manage add-ons, stores, repositories and backups
 */


/**
 * List all installed add-ons with details
 * @returns {Promise<Array>}
 */
export async function listInstalledAddons() {
  const result = await callSupervisor("/addons");
  return (result.addons || []).map(addon => ({
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    version: addon.version,
    state: addon.state,
    repository: addon.repository,
    available: addon.available,
    build: addon.build,
    url: addon.url,
    icon: addon.icon,
    logo: addon.logo,
    ingress: addon.ingress,
  }));
}

/**
 * Get detailed add-on information
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function getAddonInfo(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const info = await callSupervisor(`/addons/${slug}/info`);
  return {
    slug: info.slug,
    name: info.name,
    description: info.description,
    version: info.version,
    last_version: info.last_version,
    state: info.state,
    repository: info.repository,
    url: info.url,
    arch: info.arch,
    machine: info.machine,
    ingress_url: info.ingress_url,
    ingress_port: info.ingress_port,
    homeassistant: info.homeassistant,
    options: info.options,
    schema: info.schema,
    config: info.config,
    startup: info.startup,
    webui: info.webui,
    ports: info.ports,
    network: info.network,
    host_network: info.host_network,
    host_pid: info.host_pid,
    host_ipc: info.host_ipc,
    privileged: info.privileged,
    apparmor: info.apparmor,
    full_access: info.full_access,
    protected: info.protected,
    auto_update: info.auto_update,
    timeout: info.timeout,
    signed: info.signed,
    changelog_url: info.changelog,
    documentation_url: info.documentation,
  };
}

/**
 * Install an add-on from the store
 * @param {string} slug - Add-on slug to install
 * @returns {Promise<Object>}
 */
export async function installAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/install`, "POST");
  return { success: true, slug, result };
}

/**
 * Uninstall an add-on
 * @param {string} slug - Add-on slug to uninstall
 * @returns {Promise<Object>}
 */
export async function uninstallAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/uninstall`, "POST");
  return { success: true, slug, result };
}

/**
 * Start an add-on
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function startAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/start`, "POST");
  return { success: true, slug, result };
}

/**
 * Stop an add-on
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function stopAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/stop`, "POST");
  return { success: true, slug, result };
}

/**
 * Restart an add-on
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function restartAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/restart`, "POST");
  return { success: true, slug, result };
}

/**
 * Update an add-on to latest version
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function updateAddon(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/update`, "POST");
  return {
    success: true,
    slug,
    message: `Updated add-on '${slug}' to latest version`,
    result,
  };
}

/**
 * Get add-on logs
 * @param {string} slug - Add-on slug
 * @param {number} lines - Number of lines (default: 100)
 * @returns {Promise<string>}
 */
export async function getAddonLogs(slug, lines = 100) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/logs`, "GET", null, {
    params: { lines: Math.min(lines, 1000) },
  });
  return result.logs || result;
}

/**
 * List all available add-ons in the store
 * @returns {Promise<Array>}
 */
export async function listAddonStore() {
  const result = await callSupervisor("/addons");
  return (result.addons || []).map(addon => ({
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    version: addon.version,
    installed: addon.installed,
    available: addon.available,
    repository: addon.repository,
    url: addon.url,
  }));
}

/**
 * Manage add-on configuration/options
 * @param {string} slug - Add-on slug
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>}
 */
export async function setAddonOptions(slug, options) {
  if (!slug) throw new Error("Add-on slug is required");
  if (!options) throw new Error("Options object is required");
  
  const result = await callSupervisor(`/addons/${slug}/options`, "POST", options);
  return {
    success: true,
    slug,
    message: `Updated configuration for add-on '${slug}'`,
    result,
  };
}

/**
 * Get add-on stats (CPU, memory, network)
 * @param {string} slug - Add-on slug
 * @returns {Promise<Object>}
 */
export async function getAddonStats(slug) {
  if (!slug) throw new Error("Add-on slug is required");
  const result = await callSupervisor(`/addons/${slug}/stats`);
  return {
    cpu_percent: result.cpu_percent,
    memory_usage: result.memory_usage,
    memory_limit: result.memory_limit,
    memory_percent: result.memory_percent,
    network_rx: result.network_rx,
    network_tx: result.network_tx,
    blk_read: result.blk_read,
    blk_write: result.blk_write,
  };
}

/**
 * List available add-on repositories
 * @returns {Promise<Array>}
 */
export async function listAddonRepositories() {
  const result = await callSupervisor("/addons");
  // Extract unique repositories from addons list
  const repos = new Set((result.addons || []).map(a => a.repository).filter(Boolean));
  return [...repos].map(repo => ({ url: repo }));
}

/**
 * Add a custom add-on repository
 * @param {string} url - Repository URL (e.g., "https://github.com/author/repo")
 * @returns {Promise<Object>}
 */
export async function addAddonRepository(url) {
  if (!url) throw new Error("Repository URL is required");
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid repository URL format");
  }
  
  const result = await callSupervisor("/addons/repositories", "POST", { repository: url });
  return {
    success: true,
    url,
    message: `Added add-on repository: ${url}`,
    result,
  };
}

/**
 * Remove a custom add-on repository
 * @param {string} url - Repository URL
 * @returns {Promise<Object>}
 */
export async function removeAddonRepository(url) {
  if (!url) throw new Error("Repository URL is required");
  const result = await callSupervisor("/addons/repositories", "DELETE", { repository: url });
  return {
    success: true,
    url,
    message: `Removed add-on repository: ${url}`,
    result,
  };
}
