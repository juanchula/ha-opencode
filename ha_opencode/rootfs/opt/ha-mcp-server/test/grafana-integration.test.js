import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;

function ok(data) { return { ok: true, status: 200, json: async () => data, text: async () => "" }; }
function fail() { return { ok: false, status: 404, json: async () => ({}), text: async () => "Not found" }; }

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.HA_ACCESS_TOKEN = "test-token";
  process.env.SUPERVISOR_API = "http://supervisor";
  process.env.SUPERVISOR_TOKEN = "test-token";

  global.fetch = async (url) => {
    const u = url.toString();
    if (u.includes("/addons") && !u.includes("grafana") && !u.includes("api") && !u.includes("info"))
      return ok({ addons: [{ slug: "grafana", name: "Grafana", version: "10.4.0", state: "started" }] });
    if (u.includes("grafana/info")) return ok({ status: "running", version: "10.4.0" });
    if (u.includes("grafana/api/search")) return ok([{ uid: "abc123", title: "HA Dashboard" }]);
    if (u.includes("grafana/api/dashboards/uid")) return ok({ dashboard: { uid: "abc123", title: "HA Dashboard" } });
    if (u.includes("grafana/api/query")) return ok({ results: [] });
    if (u.includes("grafana/api/datasources")) return ok([{ name: "Prometheus", type: "prometheus" }]);
    if (u.includes("/config")) return ok({});
    return fail();
  };
});

afterAll(() => {
  global.fetch = mockFetch;
  delete process.env.HA_ACCESS_TOKEN;
  delete process.env.SUPERVISOR_API;
  delete process.env.SUPERVISOR_TOKEN;
});

describe("Grafana Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/grafana-integration.js"); });

  it("discoverGrafana returns installed=true", async () => {
    const r = await mod.discoverGrafana();
    expect(r.installed).toBe(true);
  });

  it("discoverGrafana handles unavailable", async () => {
    const orig = global.fetch;
    global.fetch = async () => { throw new Error("not found"); };
    const r = await mod.discoverGrafana();
    expect(r.installed === false || r.error).toBeTruthy();
    global.fetch = orig;
  });

  it("getGrafanaDashboards works", async () => {
    global.fetch = async (url) => {
      const u = url.toString();
      if (u.includes("addons")) return ok({ addons: [{ slug: "grafana" }] });
      if (u.includes("grafana/info")) return ok({ status: "running" });
      if (u.includes("grafana/api/search")) return ok([{ uid: "abc123" }]);
      if (u.includes("/config")) return ok({});
      return fail();
    };
    expect(await mod.getGrafanaDashboards()).toBeDefined();
  });

  it("getGrafanaDashboard works", async () => {
    global.fetch = async (url) => {
      const u = url.toString();
      if (u.includes("addons")) return ok({ addons: [{ slug: "grafana" }] });
      if (u.includes("grafana/info")) return ok({ status: "running" });
      if (u.includes("grafana/api/dashboards/uid")) return ok({ dashboard: { uid: "abc123" } });
      if (u.includes("/config")) return ok({});
      return fail();
    };
    expect(await mod.getGrafanaDashboard("abc123")).toBeDefined();
  });

  it("queryGrafana works", async () => {
    global.fetch = async (url) => {
      const u = url.toString();
      if (u.includes("addons")) return ok({ addons: [{ slug: "grafana" }] });
      if (u.includes("grafana/info")) return ok({ status: "running" });
      if (u.includes("grafana/api/query")) return ok({ results: [] });
      if (u.includes("/config")) return ok({});
      return fail();
    };
    expect(await mod.queryGrafana("Prometheus", "sensor_temp", {})).toBeDefined();
  });
});
