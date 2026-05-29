import { callHA } from "./ha-api.js";
/**
 * HACS (Home Assistant Community Store) Integration
 * Manage custom repositories, components, integrations and themes
 */


const HACS_API = {
  repositories: "/hacs/repositories",
  repository: "/hacs/repository",
  install: "/hacs/install",
  update: "/hacs/update",
  remove: "/hacs/remove",
  reload: "/hacs/reload",
  status: "/hacs/status",
  config: "/hacs/config",
};

/**
 * Get HACS status and configuration
 * @param {Object} opts
 * @param {boolean} opts.includeRepos - Include repository list
 * @returns {Promise<Object>}
 */
export async function getHacsStatus(opts = {}) {
  const status = await callHA("/config/core/status");
  const hacsInfo = await checkHacsInstalled();
  
  let repos = [];
  if (opts.includeRepos) {
    try {
      const repoData = await callHA("/hacs/repositories/list");
      repos = repoData.repositories || [];
    } catch (e) {
      // Might not be available
    }
  }
  
  return {
    ha_status: status,
    hacs_installed: hacsInfo.installed,
    hacs_version: hacsInfo.version,
    repository_count: repos.length,
    repositories: opts.includeRepos ? repos.map(r => ({
      name: r.name,
      domain: r.domain,
      installed: r.installed,
      version: r.installed_version,
      available_version: r.available_version,
      category: r.category,
      authors: r.authors,
    })) : undefined,
  };
}

/**
 * Check if HACS is installed
 * @returns {Promise<Object>}
 */
async function checkHacsInstalled() {
  try {
    const config = await callHA("/config");
    const components = config.components || [];
    return {
      installed: components.includes("hacs"),
      version: config.version || "unknown",
    };
  } catch {
    return { installed: false, version: null };
  }
}

/**
 * Install a custom component from HACS
 * @param {string} repository - GitHub repository (e.g., "author/repo")
 * @param {string} category - Component category (integration, theme, plugin, netdaemon, appdaemon, python_script, template)
 * @returns {Promise<Object>}
 */
export async function installHacsComponent(repository, category = "integration") {
  if (!repository) throw new Error("Repository parameter is required (e.g., 'author/repo')");
  
  const validCategories = ["integration", "theme", "plugin", "netdaemon", "appdaemon", "python_script", "template"];
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category '${category}'. Must be one of: ${validCategories.join(", ")}`);
  }
  
  try {
    const result = await callHA("/hacs/repository/install", "POST", {
      repository: repository,
      category: category,
    });
    return {
      success: true,
      message: `Installing ${repository} as ${category}`,
      repository,
      category,
      details: result,
    };
  } catch (error) {
    throw new Error(`Failed to install HACS component '${repository}': ${error.message}`);
  }
}

/**
 * Update a HACS component to latest version
 * @param {string} repository - GitHub repository
 * @returns {Promise<Object>}
 */
export async function updateHacsComponent(repository) {
  if (!repository) throw new Error("Repository parameter is required");
  
  try {
    const result = await callHA("/hacs/repository/update", "POST", {
      repository: repository,
    });
    return {
      success: true,
      message: `Updated ${repository}`,
      repository,
      result,
    };
  } catch (error) {
    throw new Error(`Failed to update HACS component '${repository}': ${error.message}`);
  }
}

/**
 * Remove a HACS component
 * @param {string} repository - GitHub repository
 * @returns {Promise<Object>}
 */
export async function removeHacsComponent(repository) {
  if (!repository) throw new Error("Repository parameter is required");
  
  try {
    const result = await callHA("/hacs/repository/remove", "POST", {
      repository: repository,
    });
    return {
      success: true,
      message: `Removed ${repository}`,
      repository,
      result,
    };
  } catch (error) {
    throw new Error(`Failed to remove HACS component '${repository}': ${error.message}`);
  }
}

/**
 * Reload HACS configuration
 * @returns {Promise<Object>}
 */
export async function reloadHacs() {
  try {
    const result = await callHA("/hacs/reload", "POST");
    return {
      success: true,
      message: "HACS configuration reloaded",
      result,
    };
  } catch (error) {
    throw new Error(`Failed to reload HACS: ${error.message}`);
  }
}

/**
 * Search HACS repositories
 * @param {string} query - Search term
 * @param {string} category - Category filter (optional)
 * @returns {Promise<Array>}
 */
export async function searchHacsRepositories(query, category) {
  if (!query) throw new Error("Query parameter is required");
  
  try {
    const params = { search: query };
    if (category) params.category = category;
    const result = await callHA("/hacs/repositories/search", "POST", params);
    return (result.repositories || []).map(r => ({
      name: r.name,
      domain: r.domain,
      description: r.description,
      category: r.category,
      stars: r.stars,
      authors: r.authors,
      last_updated: r.last_updated,
    }));
  } catch (error) {
    throw new Error(`Failed to search HACS repositories: ${error.message}`);
  }
}

/**
 * List installed HACS components
 * @returns {Promise<Array>}
 */
export async function listInstalledHacsComponents() {
  try {
    const result = await callHA("/hacs/repositories/list");
    const repos = result.repositories || [];
    return repos
      .filter(r => r.installed)
      .map(r => ({
        name: r.name,
        domain: r.domain,
        version: r.installed_version,
        available_version: r.available_version,
        category: r.category,
        has_update: r.installed_version !== r.available_version,
      }));
  } catch (error) {
    throw new Error(`Failed to list HACS components: ${error.message}`);
  }
}

/**
 * Get count of outdated HACS components
 * @returns {Promise<Object>}
 */
export async function getHacsOutdatedCount() {
  try {
    const result = await callHA("/hacs/repositories/list");
    const repos = result.repositories || [];
    const outdated = repos.filter(r => r.installed && r.installed_version !== r.available_version);
    return {
      total_outdated: outdated.length,
      outdated_components: outdated.map(r => ({
        name: r.name,
        domain: r.domain,
        current: r.installed_version,
        available: r.available_version,
        category: r.category,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to check HACS updates: ${error.message}`);
  }
}
