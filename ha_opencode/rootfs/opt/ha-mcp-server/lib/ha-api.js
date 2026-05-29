/**
 * HA API Helper
 * Shared HTTP client for Home Assistant Supervisor API.
 * All lib modules should use this instead of a global `callHA`.
 */

let _logFn = null;

/**
 * Set a custom log function (optional). Defaults to console.log.
 * @param {Function} fn - (level, message) => void
 */
export function setLogFunction(fn) {
  _logFn = fn;
}

function sendLog(level, msg) {
  if (_logFn) {
    _logFn(level, msg);
  } else if (level === "error") {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

/**
 * Get the Supervisor API base URL.
 */
function getSupervisorApi() {
  return process.env.SUPERVISOR_API || "http://supervisor";
}

/**
 * Get the Supervisor token (for proxied calls via Supervisor).
 */
function getSupervisorToken() {
  return process.env.SUPERVISOR_TOKEN || "";
}

/**
 * Get the Home Assistant long-lived access token (for direct API calls).
 */
function getHaAccessToken() {
  return process.env.HA_ACCESS_TOKEN || "";
}

/**
 * Call the Home Assistant Supervisor API (proxied).
 * Uses SUPERVISOR_TOKEN for authentication via the Supervisor proxy.
 */
export async function callSupervisor(endpoint, method = "GET", body = null) {
  const api = getSupervisorApi();
  const token = getSupervisorToken();

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${api}${endpoint}`;
  sendLog("debug", `[HA-API] ${method} ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    sendLog("error", `[HA-API] ${method} ${url} -> ${response.status}: ${text}`);
    throw new Error(`Supervisor API error: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Call the Home Assistant REST API directly.
 * Uses HA_ACCESS_TOKEN for direct authentication (without Supervisor proxy).
 */
export async function callHaApi(endpoint, method = "GET", body = null) {
  const api = getSupervisorApi();
  const token = getHaAccessToken();

  // If we have a supervisor token, prefer the proxy path
  const supervisorToken = getSupervisorToken();
  if (supervisorToken) {
    return callSupervisor(endpoint, method, body);
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${api}/api${endpoint}`;
  sendLog("debug", `[HA-API] ${method} ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    sendLog("error", `[HA-API] ${method} ${url} -> ${response.status}: ${text}`);
    throw new Error(`HA API error: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Wrapper for backward compatibility with the existing `callHA` global.
 * Calls via Supervisor proxy by default.
 */
export async function callHA(endpoint, method = "GET", body = null) {
  return callSupervisor(endpoint, method, body);
}
