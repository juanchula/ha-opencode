import { callSupervisor, callHA } from "./ha-api.js";

/**
 * Node-RED Integration for Home Assistant
 * Manage flows, nodes, and interact with Node-RED add-on
 * Requires Node-RED add-on to be installed and running
 */


/**
 * Discover Node-RED add-on configuration
 * @returns {Promise<Object>}
 */
export async function discoverNodeRed() {
  try {
    const addonsInfo = await callSupervisor("/addons");
    const nrAddon = (addonsInfo.addons || []).find(
      a => a.slug === "nodered" || 
           a.slug === "node-red" || 
           a.name.toLowerCase().includes("node-red")
    );
    
    if (!nrAddon) {
      return {
        installed: false,
        info: "Node-RED add-on not found",
        how_to_install: "Install Node-RED from Supervisor > Add-on Store",
      };
    }
    
    const nrInfo = await callSupervisor(`/addons/${nrAddon.slug}/info`);
    return {
      installed: true,
      slug: nrAddon.slug,
      name: nrInfo.name,
      version: nrInfo.version,
      state: nrInfo.state,
      ingress_url: nrInfo.ingress_url || null,
      has_ingress: !!nrInfo.ingress_url,
    };
  } catch (error) {
    return {
      installed: false,
      error: error.message,
    };
  }
}

/**
 * Get Node-RED server status and health
 * @returns {Promise<Object>}
 */
export async function getNodeRedStatus() {
  const nr = await discoverNodeRed();
  if (!nr.installed) throw new Error("Node-RED is not installed");
  
  try {
    const response = await fetch(`${nr.ingress_url}/api/health`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
      },
    });
    const health = await response.json();
    
    return {
      installed: true,
      version: nr.version,
      state: nr.state,
      health: health.status || "unknown",
      uptime: health.uptime,
    };
  } catch {
    return {
      installed: true,
      version: nr.version,
      state: nr.state,
      health: "unknown",
    };
  }
}

/**
 * List Node-RED flows
 * @returns {Promise<Array>}
 */
export async function listNodeRedFlows() {
  const nr = await discoverNodeRed();
  if (!nr.installed) throw new Error("Node-RED is not installed");
  
  try {
    const response = await fetch(`${nr.ingress_url}/flows`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const flows = await response.json();
    return flows.map(flow => ({
      id: flow.id,
      label: flow.label || flow.name || "unnamed",
      type: flow.type,
      z: flow.z,
      wires: (flow.wires || []).length > 0,
      disabled: flow.disabled || false,
      info: flow.info || null,
    }));
  } catch (error) {
    throw new Error(`Failed to list Node-RED flows: ${error.message}`);
  }
}

/**
 * Get Node-RED nodes (installed palette)
 * @returns {Promise<Array>}
 */
export async function getNodeRedNodes() {
  const nr = await discoverNodeRed();
  if (!nr.installed) throw new Error("Node-RED is not installed");
  
  try {
    const response = await fetch(`${nr.ingress_url}/nodes`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const nodes = await response.json();
    return (nodes || []).map(node => ({
      id: node.id,
      name: node.name,
      module: node.module,
      version: node.version,
      enabled: node.enabled,
      types: node.types || [],
    }));
  } catch (error) {
    throw new Error(`Failed to get Node-RED nodes: ${error.message}`);
  }
}

/**
 * Deploy a Node-RED flow (JSON)
 * @param {Array} flows - Array of flow objects
 * @returns {Promise<Object>}
 */
export async function deployNodeRedFlows(flows) {
  if (!flows || !Array.isArray(flows)) {
    throw new Error("Flows parameter must be an array of flow objects");
  }
  
  const nr = await discoverNodeRed();
  if (!nr.installed) throw new Error("Node-RED is not installed");
  
  try {
    const response = await fetch(`${nr.ingress_url}/flows`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flows),
    });
    const result = await response.json();
    return {
      success: true,
      message: `Deployed ${flows.length} flow nodes`,
      deployed: flows.length,
      result,
    };
  } catch (error) {
    throw new Error(`Failed to deploy Node-RED flows: ${error.message}`);
  }
}

/**
 * Get Node-RED settings
 * @returns {Promise<Object>}
 */
export async function getNodeRedSettings() {
  const nr = await discoverNodeRed();
  if (!nr.installed) throw new Error("Node-RED is not installed");
  
  try {
    const response = await fetch(`${nr.ingress_url}/settings`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to get Node-RED settings: ${error.message}`);
  }
}
