import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;
function ok(d) { return { ok: true, status: 200, json: async () => d, text: async () => "" }; }
function fail() { return { ok: false, status: 404, json: async () => ({}), text: async () => "Not found" }; }

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.SUPERVISOR_TOKEN = "test-token";
  process.env.SUPERVISOR_API = "http://supervisor";

  global.fetch = async (url) => {
    const u = typeof url === "string" ? url : url.toString();
    if (u.includes("supervisor/addons") && !u.includes("frigate"))
      return ok({ addons: [{ slug: "frigate", name: "Frigate", version: "0.14.0", state: "started" }] });
    if (u.includes("supervisor/addons/frigate/info"))
      return ok({ status: "running", version: "0.14.0", state: "started", ingress_url: "http://frigate:5000" });
    if (u.includes("/api/stats"))
      return ok({ cameras: { front_door: { camera_fps: 5, detection_fps: 2, objects: [["person", 0.95, []]] } }, service: { uptime: 3600 } });
    if (u.includes("/api/events"))
      return ok([{ id: "evt1", camera: "front_door", label: "person", start_time: 1700000000, end_time: 1700000100, has_snapshot: true, has_clip: false, top_score: 0.95, false_positive: false }]);
    if (u.includes("/api/recordings/summary"))
      return ok({ front_door: { total: 5, hours: 2.5 } });
    return fail();
  };
});

afterAll(() => { global.fetch = mockFetch; delete process.env.SUPERVISOR_TOKEN; delete process.env.SUPERVISOR_API; });

describe("Frigate NVR Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/frigate-integration.js"); });

  it("discoverFrigate returns installed=true", async () => {
    const r = await mod.discoverFrigate();
    expect(r.installed).toBe(true);
  });

  it("getFrigateStatus returns camera info", async () => {
    const r = await mod.getFrigateStatus();
    expect(r.installed).toBe(true);
    expect(r.cameras.length).toBeGreaterThan(0);
  });

  it("getFrigateEvents returns events", async () => {
    const r = await mod.getFrigateEvents({ camera: "front_door", limit: 10 });
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(1);
    expect(r[0].label).toBe("person");
  });

  it("getFrigateSnapshot returns URL", async () => {
    const r = await mod.getFrigateSnapshot("evt1", { width: 640 });
    expect(r.snapshot_url).toContain("evt1/snapshot.jpg");
  });

  it("listFrigateCameras returns cameras", async () => {
    const r = await mod.listFrigateCameras();
    expect(Array.isArray(r)).toBe(true);
    expect(r[0].name).toBe("front_door");
  });

  it("getFrigateRecordings returns summary", async () => {
    const r = await mod.getFrigateRecordings({ camera: "front_door" });
    expect(r).toBeDefined();
  });
});
