import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;
function ok(d) { return { ok: true, status: 200, json: async () => d, text: async () => "" }; }
function fail() { return { ok: false, status: 404, json: async () => ({}), text: async () => "Not found" }; }

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.SUPERVISOR_TOKEN = "test-token";
  process.env.SUPERVISOR_API = "http://supervisor";

  global.fetch = async (url, opts) => {
    const u = typeof url === "string" ? url : url.toString();
    if (u.includes("addons") && !u.includes("core_ssh") && !u.includes("code-server") && !u.includes("samba") && !u.includes("mariadb") && !u.includes("mosquitto") && !u.includes("nginx") && !u.includes("letsencrypt")) {
      const hasQuery = u.includes("?all=true");
      const addons = [
        { slug: "core_ssh", name: "Terminal & SSH", version: "9.0.0", state: "started", installed: true },
        { slug: "code-server", name: "Code Server", version: "4.0.0", state: "started", installed: true },
      ];
      return ok({ addons });
    }
    if (u.includes("core_ssh/info")) return ok({ slug: "core_ssh", name: "Terminal & SSH", version: "9.0.0", state: "started", available: true });
    if (u.includes("code-server/info")) return ok({ slug: "code-server", name: "Code Server", version: "4.0.0", state: "started", ingress_url: "http://code-server:8080" });
    if (u.includes("core_ssh/install") || u.includes("core_ssh/uninstall") || u.includes("core_ssh/build") || u.includes("core_ssh/start") || u.includes("core_ssh/stop") || u.includes("core_ssh/restart") || u.includes("core_ssh/update"))
      return ok({ result: "ok" });
    return fail();
  };
});

afterAll(() => { global.fetch = mockFetch; delete process.env.SUPERVISOR_TOKEN; delete process.env.SUPERVISOR_API; });

describe("Dev Tools Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/dev-tools-integration.js"); });

  it("getDevToolsStatus works", async () => {
    const r = await mod.getDevToolsStatus();
    expect(r.length).toBe(7);
    expect(r.some(d => d.installed)).toBe(true);
  });

  it("getDevToolInfo works", async () => {
    const r = await mod.getDevToolInfo("core_ssh");
    expect(r.slug).toBe("core_ssh");
  });

  it("installDevTool works", async () => {
    expect((await mod.installDevTool("core_ssh")).success).toBe(true);
  });

  it("uninstallDevTool works", async () => {
    expect((await mod.uninstallDevTool("core_ssh")).success).toBe(true);
  });

  it("startDevTool works", async () => {
    expect((await mod.startDevTool("core_ssh")).action).toBe("started");
  });

  it("stopDevTool works", async () => {
    expect((await mod.stopDevTool("core_ssh")).action).toBe("stopped");
  });

  it("restartDevTool works", async () => {
    expect((await mod.restartDevTool("core_ssh")).action).toBe("restarted");
  });

  it("updateDevTool works", async () => {
    expect((await mod.updateDevTool("core_ssh")).success).toBe(true);
  });

  it("listAvailableAddons works", async () => {
    const r = await mod.listAvailableAddons();
    expect(r.length).toBeGreaterThan(0);
  });

  it("searchAddons works", async () => {
    const r = await mod.searchAddons("ssh");
    expect(r.length).toBeGreaterThan(0);
  });
});
