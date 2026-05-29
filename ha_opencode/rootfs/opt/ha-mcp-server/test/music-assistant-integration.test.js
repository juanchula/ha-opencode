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
    if (u.includes("supervisor/addons") && !u.includes("music"))
      return ok({ addons: [{ slug: "music_assistant", name: "Music Assistant", version: "2.0.0", state: "started" }] });
    if (u.includes("supervisor/addons/music_assistant/info"))
      return ok({ version: "2.0.0", state: "started", ingress_url: "http://music-assistant:8095" });
    if (u.includes("/api/status"))
      return ok({ running: true, providers: ["spotify", "local"], players: ["kitchen", "living_room"] });
    if (u.includes("/api/players"))
      return ok([{ player_id: "kitchen", display_name: "Kitchen Speaker", type: "speaker", powered: true, volume_level: 70 }]);
    if (u.includes("/api/providers"))
      return ok([{ provider_id: "spotify", name: "Spotify", type: "music", supported_features: ["search", "playlists"] }]);
    if (u.includes("/api/search"))
      return ok({ items: [{ name: "Bohemian Rhapsody", artist: "Queen", media_type: "track", uri: "spotify://track/abc", duration: 180 }] });
    if (u.includes("/api/playlists"))
      return ok([{ name: "Favorites", uri: "spotify://playlist/xyz", provider: "spotify", total_items: 25 }]);
    if (u.includes("/api/player") && opts?.method === "POST")
      return ok({ success: true });
    return fail();
  };
});

afterAll(() => { global.fetch = mockFetch; delete process.env.SUPERVISOR_TOKEN; delete process.env.SUPERVISOR_API; });

describe("Music Assistant Integration", () => {
  let mod;
  beforeAll(async () => { mod = await import("../lib/music-assistant-integration.js"); });

  it("discoverMusicAssistant works", async () => {
    expect((await mod.discoverMusicAssistant()).installed).toBe(true);
  });

  it("getMusicAssistantStatus works", async () => {
    const r = await mod.getMusicAssistantStatus();
    expect(r.installed).toBe(true);
    expect(r.player_count).toBeDefined();
  });

  it("listMaPlayers works", async () => {
    const r = await mod.listMaPlayers();
    expect(r.length).toBe(1);
    expect(r[0].name).toBe("Kitchen Speaker");
  });

  it("listMaProviders works", async () => {
    const r = await mod.listMaProviders();
    expect(r[0].provider_id).toBe("spotify");
  });

  it("searchMaMusic works", async () => {
    const r = await mod.searchMaMusic("Bohemian", { limit: 5 });
    expect(r[0].artist).toBe("Queen");
  });

  it("listMaPlaylists works", async () => {
    const r = await mod.listMaPlaylists();
    expect(r[0].name).toBe("Favorites");
  });

  it("playMaMedia works", async () => {
    const r = await mod.playMaMedia("kitchen", "spotify://track/abc");
    expect(r.success).toBe(true);
  });
});
