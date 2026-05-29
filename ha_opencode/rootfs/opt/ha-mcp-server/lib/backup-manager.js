/**
 * Backup Manager for Home Assistant
 * Create, restore, list, and manage backups via Supervisor API
 */
import { callSupervisor } from "./ha-api.js";

/**
 * List all backups
 * @returns {Promise<Array>}
 */
export async function listBackups() {
  const result = await callSupervisor("/backups");
  return (result.backups || []).map(b => ({
    slug: b.slug,
    date: b.date,
    name: b.name,
    type: b.type,
    size: b.size,
    version: b.version || b.homeassistant,
    protected: b.protected,
    content: {
      folders: b.folders || [],
      addons: (b.addons || []).map(a => a.slug),
      homeassistant: b.homeassistant,
    },
  }));
}

/**
 * Create a new full backup
 * @param {Object} opts - { name, password, folders, addons }
 * @returns {Promise<Object>}
 */
export async function createBackup(opts = {}) {
  const payload = {};
  if (opts.name) payload.name = opts.name;
  if (opts.password) payload.password = opts.password;
  if (opts.folders) payload.folders = opts.folders;
  if (opts.addons) payload.addons = opts.addons;

  const result = await callSupervisor("/backups/new/full", "POST", payload);
  return {
    slug: result.data?.slug || result.slug,
    name: result.data?.name || result.name || opts.name || "unnamed",
    size: result.data?.size || result.size,
    success: true,
  };
}

/**
 * Create a partial backup (only specified folders/addons)
 * @param {Object} opts - { name, folders, addons, password }
 * @returns {Promise<Object>}
 */
export async function createPartialBackup(opts = {}) {
  const payload = {
    name: opts.name || "Partial Backup",
    folders: opts.folders || [],
    addons: opts.addons || [],
  };
  if (opts.password) payload.password = opts.password;

  const result = await callSupervisor("/backups/new/partial", "POST", payload);
  return {
    slug: result.data?.slug || result.slug,
    name: result.data?.name || result.name || opts.name,
    size: result.data?.size || result.size,
    success: true,
  };
}

/**
 * Get detailed info about a specific backup
 * @param {string} slug - Backup slug
 * @returns {Promise<Object>}
 */
export async function getBackupInfo(slug) {
  if (!slug) throw new Error("Backup slug is required");
  const result = await callSupervisor(`/backups/${slug}/info`);
  return result.data || result;
}

/**
 * Restore a backup
 * @param {string} slug - Backup slug to restore
 * @param {Object} opts - { password, folders, addons, homeassistant }
 * @returns {Promise<Object>}
 */
export async function restoreBackup(slug, opts = {}) {
  if (!slug) throw new Error("Backup slug is required");
  const payload = {};
  if (opts.password) payload.password = opts.password;
  if (opts.folders) payload.folders = opts.folders;
  if (opts.addons) payload.addons = opts.addons;
  if (opts.homeassistant !== undefined) payload.homeassistant = opts.homeassistant;

  const result = await callSupervisor(`/backups/${slug}/restore/full`, "POST", payload);
  return { success: true, slug, result };
}

/**
 * Delete a backup
 * @param {string} slug - Backup slug to delete
 * @returns {Promise<Object>}
 */
export async function deleteBackup(slug) {
  if (!slug) throw new Error("Backup slug is required");
  const result = await callSupervisor(`/backups/${slug}`, "DELETE");
  return { success: true, slug, result };
}

/**
 * Download a backup (returns download URL)
 * @param {string} slug - Backup slug
 * @returns {Promise<Object>}
 */
export async function downloadBackup(slug) {
  if (!slug) throw new Error("Backup slug is required");
  const api = process.env.SUPERVISOR_API || "http://supervisor";
  const token = process.env.SUPERVISOR_TOKEN || "";
  return {
    download_url: `${api}/backups/${slug}/download`,
    slug,
    requires_auth: true,
    auth_header: "Authorization: Bearer [token]",
    note: "Use the download_url with the Authorization header to download the backup file",
  };
}

/**
 * Check backup space and status
 * @returns {Promise<Object>}
 */
export async function getBackupInfoStatus() {
  try {
    const info = await callSupervisor("/backups/info");
    return {
      backups_count: info.data?.backups_count || info.backups_count || 0,
      size_total: info.data?.size_total || info.size_total || "0B",
      size_taken: info.data?.size_taken || info.size_taken || "0B",
      locations: info.data?.locations || info.locations || [],
    };
  } catch (error) {
    throw new Error(`Failed to get backup info: ${error.message}`);
  }
}
