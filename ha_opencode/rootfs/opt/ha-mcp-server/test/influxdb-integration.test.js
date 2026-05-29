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
    
    // Supervisor: list addons
    if (u.includes("supervisor/addons") && !u.includes("influx"))
      return ok({ addons: [{ slug: "influxdb", name: "InfluxDB", version: "2.7.1", state: "started" }] });
    
    // Supervisor: get influxdb addon info
    if (u.includes("supervisor/addons/influxdb/info"))
      return ok({ status: "running", version: "2.7.1", state: "started", ingress_url: "http://influxdb:8086" });
    
    // InfluxDB API: health
    if (u.includes("/health"))
      return ok({ status: "pass", name: "influxdb", version: "2.7.1" });
    
    // InfluxDB API: buckets
    if (u.includes("/api/v2/buckets"))
      return ok({ buckets: [{ id: "b1", name: "homeassistant" }] });
    
    // InfluxDB API: query via proxy
    if (u.includes("/api/v2/query"))
      return ok({ results: [{ series: [{ name: "temp", values: [[100, 25.5]] }] }] });
    
    return fail();
  };
});

afterAll(() => {
  global.fetch = mockFetch;
  delete process.env.HA_ACCESS_TOKEN;
  delete process.env.SUPERVISOR_API;
  delete process.env.SUPERVISOR_TOKEN;
});

describe("InfluxDB Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/influxdb-integration.js"); });

  it("getInfluxDBHealth works", async () => {
    const r = await mod.getInfluxDBHealth();
    expect(r).toBeDefined();
    expect(r.status).toBe("pass");
  });

  it("getInfluxDBHealth handles unavailable", async () => {
    const orig = global.fetch;
    try {
      global.fetch = async () => { throw new Error("influxdb not found"); };
      await expect(mod.getInfluxDBHealth()).rejects.toThrow();
    } finally {
      global.fetch = orig;
    }
  });

  it("queryInfluxDB works", async () => {
    const r = await mod.queryInfluxDB('from(bucket: "hass") |> range(start: -1h)', { organization: "hass", bucket: "hass" });
    expect(r).toBeDefined();
  });

  it("queryEntityHistory works", async () => {
    const r = await mod.queryEntityHistory("sensor.temperature", "homeassistant", {});
    expect(r).toBeDefined();
  });

  it("listInfluxDBBuckets works", async () => {
    const r = await mod.listInfluxDBBuckets();
    expect(r).toBeDefined();
    expect(Array.isArray(r)).toBe(true);
  });
});
