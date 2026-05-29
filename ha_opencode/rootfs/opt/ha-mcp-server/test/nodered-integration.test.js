import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;

function ok(data) {
  return { ok: true, status: 200, json: async () => data, text: async () => "" };
}
function fail() {
  return { ok: false, status: 404, json: async () => ({}), text: async () => "Not found" };
}

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.HA_ACCESS_TOKEN = "test-token";
  process.env.SUPERVISOR_API = "http://supervisor";
  process.env.SUPERVISOR_TOKEN = "test-token";

  global.fetch = async (url) => {
    const u = typeof url === "string" ? url : url.toString();
    
    // Supervisor: list addons - return nodered
    if (u.includes("/addons") && !u.includes("nodered") && !u.includes("api") && !u.endsWith("/info"))
      return ok({ addons: [{ slug: "nodered", name: "Node-RED", version: "3.1.0", state: "started" }] });
    
    // Supervisor: get nodered addon info (used by discover)
    if (u.includes("addons/nodered/info"))
      return ok({ status: "running", version: "3.1.0", state: "started", ingress_url: "http://ingress/nodered" });
    
    // Direct Node-RED API: list flows
    if (u.includes("/flows"))
      return ok([{ id: "flow1", type: "tab", label: "Main Flow" }]);
    
    // Direct Node-RED API: list nodes
    if (u.includes("/nodes"))
      return ok([{ id: "node-red-contrib-http", name: "http", module: "node-red-contrib-http", version: "3.0.0", enabled: true }]);
    
    // Direct Node-RED API: deploy flows
    if (u.includes("/flow"))
      return ok({ id: "f1", type: "tab", label: "Deployed" });
    
    return fail();
  };
});

afterAll(() => {
  global.fetch = mockFetch;
  delete process.env.HA_ACCESS_TOKEN;
  delete process.env.SUPERVISOR_API;
  delete process.env.SUPERVISOR_TOKEN;
});

describe("Node-RED Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/nodered-integration.js"); });

  it("getNodeRedStatus returns installed=true", async () => {
    const r = await mod.getNodeRedStatus();
    expect(r.installed).toBe(true);
  });

  it("getNodeRedStatus handles unavailable", async () => {
    const orig = global.fetch;
    try {
      global.fetch = async () => { throw new Error("nodered not found"); };
      await expect(mod.getNodeRedStatus()).rejects.toThrow();
    } finally {
      global.fetch = orig;
    }
  });

  it("listNodeRedFlows works", async () => {
    const r = await mod.listNodeRedFlows();
    expect(r).toBeDefined();
    expect(Array.isArray(r)).toBe(true);
  });

  it("getNodeRedNodes works", async () => {
    const r = await mod.getNodeRedNodes();
    expect(r).toBeDefined();
    expect(Array.isArray(r)).toBe(true);
  });

  it("deployNodeRedFlows works", async () => {
    const r = await mod.deployNodeRedFlows([{ id: "f1", type: "tab" }]);
    expect(r).toBeDefined();
  });
});
