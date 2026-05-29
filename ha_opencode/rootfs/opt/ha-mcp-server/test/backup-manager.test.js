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
    if (u.includes("backups") && !u.includes("info") && !u.includes("new") && !u.includes("download") && !u.includes("restore")) {
      const isSpecific = u.match(/\/backups\/([^/?]+)/);
      if (isSpecific && isSpecific[1] !== "info") {
        return ok({ slug: isSpecific[1], date: "2024-01-01", name: "Test Backup", type: "full", size: "100MB" });
      }
      return ok({ backups: [{ slug: "b1", date: "2024-01-01", name: "Full Backup", type: "full", size: "100MB", protected: false, folders: ["homeassistant"], addons: [{ slug: "core_ssh" }], homeassistant: "2024.1.0" }] });
    }
    if (u.includes("backups/info")) return ok({ backups_count: 3, size_total: "500MB", size_taken: "300MB", locations: [{ name: "local", free: "10GB" }] });
    if (u.includes("backups/new/full") && opts?.method === "POST") return ok({ data: { slug: "b2", name: "New Backup", size: "200MB" } });
    if (u.includes("backups/new/partial") && opts?.method === "POST") return ok({ data: { slug: "b3", name: "Partial Backup", size: "50MB" } });
    if (u.includes("restore/full") && opts?.method === "POST") return ok({ result: "ok" });
    if (u.includes("backups/b1/info")) return ok({ slug: "b1", name: "Full Backup", date: "2024-01-01" });
    if (u.includes("backups/b1/download")) return ok({ url: "http://download" });
    return fail();
  };
});

afterAll(() => { global.fetch = mockFetch; delete process.env.SUPERVISOR_TOKEN; delete process.env.SUPERVISOR_API; });

describe("Backup Manager", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/backup-manager.js"); });

  it("listBackups works", async () => {
    const r = await mod.listBackups();
    expect(r.length).toBe(1);
    expect(r[0].slug).toBe("b1");
  });

  it("createBackup works", async () => {
    const r = await mod.createBackup({ name: "Nightly" });
    expect(r.success).toBe(true);
  });

  it("createPartialBackup works", async () => {
    const r = await mod.createPartialBackup({ folders: ["homeassistant"], addons: ["core_ssh"] });
    expect(r.success).toBe(true);
  });

  it("getBackupInfo works", async () => {
    const r = await mod.getBackupInfo("b1");
    expect(r.slug).toBe("b1");
  });

  it("restoreBackup works", async () => {
    const r = await mod.restoreBackup("b1", { homeassistant: true });
    expect(r.success).toBe(true);
  });

  it("deleteBackup works", async () => {
    const r = await mod.deleteBackup("b1");
    expect(r.success).toBe(true);
  });

  it("downloadBackup returns URL", async () => {
    const r = await mod.downloadBackup("b1");
    expect(r.download_url).toBeDefined();
  });

  it("getBackupInfoStatus works", async () => {
    const r = await mod.getBackupInfoStatus();
    expect(r.backups_count).toBeDefined();
  });
});
