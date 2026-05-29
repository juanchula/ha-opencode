import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;

function ok(data) { return { ok: true, status: 200, json: async () => data, text: async () => "" }; }
function fail() { return { ok: false, status: 404, json: async () => ({}), text: async () => "Not found" }; }

const mockAddons = [
  { slug: "core_ssh", name: "SSH", version: "1.0.0", state: "started" },
  { slug: "core_mariadb", name: "MariaDB", version: "2.0.0", state: "stopped" },
];

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.HA_ACCESS_TOKEN = "test-token";
  process.env.SUPERVISOR_API = "http://supervisor";
  process.env.SUPERVISOR_TOKEN = "test-token";

  global.fetch = async (url, opts) => {
    const u = url.toString();
    if (u.includes("addons") && !u.includes("core_ssh") && !u.includes("mariadb") && !u.includes("repository"))
      return ok({ addons: mockAddons });
    if (u.includes("core_ssh/info")) return ok({ slug: "core_ssh", name: "SSH", version: "1.0.0", state: "started" });
    if (u.includes("core_ssh/start") || u.includes("core_ssh/stop") || u.includes("core_ssh/restart") || u.includes("core_ssh/update"))
      return ok({ result: "ok" });
    if (u.includes("core_ssh/logs")) return ok({ logs: "[INFO] Starting..." });
    if (u.includes("core_ssh/stats")) return ok({ cpu_percent: 2.5, memory_percent: 15.3 });
    if (u.includes("core_ssh/options")) return ok({ result: "ok" });
    if (u.includes("core_ssh/install") || u.includes("core_ssh/uninstall")) return ok({ result: "ok" });
    if (u.includes("repository")) return ok({ result: "ok" });
    return fail();
  };
});

afterAll(() => {
  global.fetch = mockFetch;
  delete process.env.HA_ACCESS_TOKEN;
  delete process.env.SUPERVISOR_API;
  delete process.env.SUPERVISOR_TOKEN;
});

describe("Addon Manager", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/addon-manager.js"); });

  it("listInstalledAddons works", async () => {
    const r = await mod.listInstalledAddons();
    expect(r.length).toBe(2);
  });

  it("getAddonInfo works", async () => {
    const r = await mod.getAddonInfo("core_ssh");
    expect(r.slug).toBe("core_ssh");
  });

  it("startAddon works", async () => {
    expect((await mod.startAddon("core_ssh")).success).toBe(true);
  });

  it("stopAddon works", async () => {
    expect((await mod.stopAddon("core_ssh")).success).toBe(true);
  });

  it("restartAddon works", async () => {
    expect((await mod.restartAddon("core_ssh")).success).toBe(true);
  });

  it("updateAddon works", async () => {
    expect((await mod.updateAddon("core_ssh")).success).toBe(true);
  });

  it("installAddon works", async () => {
    expect((await mod.installAddon("core_ssh")).success).toBe(true);
  });

  it("uninstallAddon works", async () => {
    expect((await mod.uninstallAddon("core_ssh")).success).toBe(true);
  });

  it("getAddonLogs works", async () => {
    expect(await mod.getAddonLogs("core_ssh", 100)).toBeDefined();
  });

  it("getAddonStats works", async () => {
    const r = await mod.getAddonStats("core_ssh");
    expect(r.cpu_percent).toBeDefined();
  });

  it("setAddonOptions works", async () => {
    expect((await mod.setAddonOptions("core_ssh", { log_level: "info" })).success).toBe(true);
  });

  it("addAddonRepository works", async () => {
    expect((await mod.addAddonRepository("https://github.com/test/repo")).success).toBe(true);
  });

  it("removeAddonRepository works", async () => {
    expect((await mod.removeAddonRepository("https://github.com/test/repo")).success).toBe(true);
  });
});
