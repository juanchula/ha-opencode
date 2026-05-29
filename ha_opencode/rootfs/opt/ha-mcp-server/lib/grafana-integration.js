import { callSupervisor, callHA } from "./ha-api.js";

/**
 * Grafana Integration for Home Assistant
 * Query dashboards, metrics, and visualize data
 * Requires Grafana add-on to be installed and configured
 */


/**
 * Discover Grafana add-on and return its URL and configuration
 * @returns {Promise<Object>}
 */
export async function discoverGrafana() {
  try {
    // Try to find Grafana add-on via Supervisor
    const addonsInfo = await callSupervisor("/addons");
    const grafanaAddon = (addonsInfo.addons || []).find(
      a => a.slug === "grafana" || a.name.toLowerCase().includes("grafana")
    );
    
    if (!grafanaAddon) {
      let haInfo;
      try {
        haInfo = await callHA("/config");
      } catch {
        haInfo = {};
      }
      return {
        installed: false,
        info: "Grafana add-on not found in installed add-ons",
        ha_version: haInfo.version,
        ha_config_dir: haInfo.config_dir,
        how_to_install: "Install the Grafana add-on from Supervisor > Add-on Store",
      };
    }
    
    // Get ingress URL for the add-on
    const grafanaInfo = await callSupervisor(`/addons/${grafanaAddon.slug}/info`);
    const ingressUrl = grafanaInfo.ingress_url || null;
    const ingressToken = process.env.SUPERVISOR_TOKEN || null;
    
    return {
      installed: true,
      slug: grafanaAddon.slug,
      name: grafanaInfo.name,
      version: grafanaInfo.version,
      state: grafanaInfo.state,
      ingress_url: ingressUrl,
      has_ingress: !!ingressUrl,
    };
  } catch (error) {
    return {
      installed: false,
      error: error.message,
      how_to_install: "Install the Grafana add-on from Supervisor > Add-on Store",
    };
  }
}

/**
 * Query Grafana datasources
 * @returns {Promise<Array>}
 */
export async function getGrafanaDatasources() {
  const grafana = await discoverGrafana();
  if (!grafana.installed) {
    throw new Error("Grafana is not installed. Install from Supervisor > Add-on Store.");
  }
  
  try {
    const result = await callHA("/grafana/api/datasources");
    return (result || []).map(ds => ({
      name: ds.name,
      type: ds.type,
      url: ds.url,
      database: ds.database,
      is_default: ds.isDefault,
    }));
  } catch {
    // Fallback: try via ingress URL
    try {
      const ingressUrl = grafana.ingress_url;
      const response = await fetch(`${ingressUrl}/api/datasources`, {
        headers: {
          "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return (data || []).map(ds => ({
        name: ds.name,
        type: ds.type,
        url: ds.url,
        is_default: ds.isDefault,
      }));
    } catch (error) {
      throw new Error(`Failed to query Grafana: ${error.message}`);
    }
  }
}

/**
 * Execute a Grafana query
 * @param {string} datasource - Datasource name or UID
 * @param {string} query - PromQL/InfluxQL query
 * @param {Object} opts - Options (time range, etc.)
 * @returns {Promise<Object>}
 */
export async function queryGrafana(datasource, query, opts = {}) {
  if (!datasource) throw new Error("Datasource parameter is required");
  if (!query) throw new Error("Query parameter is required");
  
  const grafana = await discoverGrafana();
  if (!grafana.installed) {
    throw new Error("Grafana is not installed");
  }
  
  const timeRange = {
    from: opts.from || "now-1h",
    to: opts.to || "now",
  };
  
  try {
    const result = await callHA("/grafana/api/query", "POST", {
      datasource: datasource,
      queries: [{
        refId: "A",
        query: query,
        datasource: { name: datasource },
      }],
      from: timeRange.from,
      to: timeRange.to,
    });
    return {
      success: true,
      datasource,
      query,
      time_range: timeRange,
      results: result.results || [],
    };
  } catch (error) {
    throw new Error(`Grafana query failed: ${error.message}`);
  }
}

/**
 * Get Grafana dashboard list
 * @returns {Promise<Array>}
 */
export async function getGrafanaDashboards() {
  const grafana = await discoverGrafana();
  if (!grafana.installed) throw new Error("Grafana is not installed");
  
  try {
    const result = await callHA("/grafana/api/search");
    return (result || []).map(d => ({
      title: d.title,
      uid: d.uid,
      url: d.url,
      type: d.type,
      tags: d.tags,
    }));
  } catch (error) {
    throw new Error(`Failed to get Grafana dashboards: ${error.message}`);
  }
}

/**
 * Get Grafana dashboard by UID
 * @param {string} uid - Dashboard UID
 * @returns {Promise<Object>}
 */
export async function getGrafanaDashboard(uid) {
  if (!uid) throw new Error("Dashboard UID parameter is required");
  
  try {
    const result = await callHA(`/grafana/api/dashboards/uid/${uid}`);
    return {
      title: result.dashboard?.title,
      uid: result.dashboard?.uid,
      panels: (result.dashboard?.panels || []).map(p => ({
        title: p.title,
        type: p.type,
        datasource: p.datasource?.name || p.datasource?.type,
        targets: (p.targets || []).map(t => ({
          expr: t.expr || t.query,
          legend: t.legendFormat,
        })),
      })),
    };
  } catch (error) {
    throw new Error(`Failed to get Grafana dashboard: ${error.message}`);
  }
}
