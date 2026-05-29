import { callSupervisor, callHA } from "./ha-api.js";

/**
 * InfluxDB Integration for Home Assistant
 * Query time-series data, write data, manage databases
 * Requires InfluxDB add-on to be installed and configured
 */


/**
 * Discover InfluxDB add-on configuration
 * @returns {Promise<Object>}
 */
export async function discoverInfluxDB() {
  try {
    const addonsInfo = await callSupervisor("/addons");
    const influxAddon = (addonsInfo.addons || []).find(
      a => a.slug === "influxdb" || 
           a.slug === "influxdb2" ||
           a.name.toLowerCase().includes("influxdb")
    );
    
    if (!influxAddon) {
      return {
        installed: false,
        info: "InfluxDB add-on not found",
        how_to_install: "Install InfluxDB from Supervisor > Add-on Store",
      };
    }
    
    const influxInfo = await callSupervisor(`/addons/${influxAddon.slug}/info`);
    return {
      installed: true,
      slug: influxAddon.slug,
      name: influxInfo.name,
      version: influxInfo.version,
      state: influxInfo.state,
      ingress_url: influxInfo.ingress_url || null,
    };
  } catch (error) {
    return {
      installed: false,
      error: error.message,
    };
  }
}

/**
 * Query InfluxDB using Flux query language (InfluxDB v2)
 * @param {string} query - Flux query string
 * @param {Object} opts - Query options
 * @returns {Promise<Array>}
 */
export async function queryInfluxDB(query, opts = {}) {
  if (!query) throw new Error("Query parameter is required");
  
  const influx = await discoverInfluxDB();
  if (!influx.installed) throw new Error("InfluxDB is not installed");
  
  const org = opts.organization || "homeassistant";
  const bucket = opts.bucket || "homeassistant";
  
  try {
    const response = await fetch(`${influx.ingress_url}/api/v2/query?org=${org}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/vnd.flux",
        "Accept": "application/csv",
      },
      body: query,
    });
    const data = await response.text();
    return parseCSVResults(data);
  } catch (error) {
    throw new Error(`InfluxDB query failed: ${error.message}`);
  }
}

/**
 * Parse InfluxDB CSV response into structured data
 * @param {string} csv - CSV response from InfluxDB
 * @returns {Array}
 */
function parseCSVResults(csv) {
  if (!csv) return [];
  const lines = csv.trim().split("\n").filter(l => l && !l.startsWith("#"));
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(",");
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || "").trim();
    });
    results.push(row);
  }
  return results;
}

/**
 * Get InfluxDB health status
 * @returns {Promise<Object>}
 */
export async function getInfluxDBHealth() {
  const influx = await discoverInfluxDB();
  if (!influx.installed) throw new Error("InfluxDB is not installed");
  
  try {
    const response = await fetch(`${influx.ingress_url}/health`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw new Error(`InfluxDB health check failed: ${error.message}`);
  }
}

/**
 * List InfluxDB buckets/databases
 * @returns {Promise<Array>}
 */
export async function listInfluxDBBuckets() {
  const influx = await discoverInfluxDB();
  if (!influx.installed) throw new Error("InfluxDB is not installed");
  
  try {
    const response = await fetch(`${influx.ingress_url}/api/v2/buckets`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return (data.buckets || []).map(b => ({
      name: b.name,
      id: b.id,
      type: b.type,
      retention: b.retentionRules?.map(r => r.everySeconds),
    }));
  } catch (error) {
    throw new Error(`Failed to list InfluxDB buckets: ${error.message}`);
  }
}

/**
 * Query HA recorder data via InfluxDB
 * @param {string} entity - Entity ID to query
 * @param {string} measurement - Measurement name (default: "homeassistant")
 * @param {Object} opts - Time range options
 * @returns {Promise<Array>}
 */
export async function queryEntityHistory(entity, measurement = "homeassistant", opts = {}) {
  if (!entity) throw new Error("Entity ID parameter is required");
  
  const timeRange = {
    from: opts.from || "-1h",
    to: opts.to || "now()",
  };
  
  const fluxQuery = `
    from(bucket: "${opts.bucket || "homeassistant"}")
      |> range(start: ${timeRange.from}, stop: ${timeRange.to})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r.entity_id == "${entity}")
      |> keep(columns: ["_time", "_value", "_field", "entity_id"])
      |> sort(columns: ["_time"])
  `;
  
  return await queryInfluxDB(fluxQuery, opts);
}

/**
 * Export data from InfluxDB for a time range
 * @param {string} measurement - Measurement to export
 * @param {Object} opts - Export options
 * @returns {Promise<Object>}
 */
export async function exportInfluxDBData(measurement = "homeassistant", opts = {}) {
  const timeRange = {
    from: opts.from || "-24h",
    to: opts.to || "now()",
  };
  
  const fluxQuery = `
    from(bucket: "${opts.bucket || "homeassistant"}")
      |> range(start: ${timeRange.from}, stop: ${timeRange.to})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;
  
  return await queryInfluxDB(fluxQuery, opts);
}
