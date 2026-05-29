import { describe, it, expect, beforeAll, afterAll } from "vitest";

let mockFetch;

function okResponse(data) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}

function failResponse(error) {
  return { ok: false, status: 500, json: async () => ({}), text: async () => error };
}

beforeAll(() => {
  mockFetch = global.fetch;
  process.env.SUPERVISOR_TOKEN = "test-supervisor-token";
  process.env.SUPERVISOR_API = "http://supervisor";
  process.env.HA_ACCESS_TOKEN = "test-ha-token";

  global.fetch = async (url, options) => {
    const u = url.toString();
    
    if (u.includes("config/core/status")) {
      return okResponse({ status: "running" });
    }
    if (u.includes("hacs/repository/install") && options?.method === "POST") {
      return okResponse({ result: "ok" });
    }
    if (u.includes("hacs/repository/update") && options?.method === "POST") {
      return okResponse({ result: "ok" });
    }
    if (u.includes("hacs/repository/remove") && options?.method === "POST") {
      return okResponse({ result: "ok" });
    }
    if (u.includes("hacs/reload") && options?.method === "POST") {
      return okResponse({ result: "ok" });
    }
    if (u.includes("hacs/repositories/search") && options?.method === "POST") {
      return okResponse({ repositories: [{ id: "456", name: "found/repo", category: "integration" }] });
    }
    if (u.includes("hacs/repositories/list")) {
      return okResponse({ repositories: [{ id: "123", name: "test/repo", category: "integration", installed: true, version: "1.0.0" }] });
    }
    
    return failResponse("Not found");
  };
});

afterAll(() => {
  global.fetch = mockFetch;
  delete process.env.SUPERVISOR_TOKEN;
  delete process.env.SUPERVISOR_API;
  delete process.env.HA_ACCESS_TOKEN;
});

describe("HACS Integration", () => {
  let hacsModule;
  beforeAll(async () => { hacsModule = await import("../lib/hacs-integration.js"); });

  it("getHacsStatus returns status", async () => {
    const result = await hacsModule.getHacsStatus({ includeRepos: false });
    expect(result).toHaveProperty("ha_status");
    expect(result.ha_status.status).toBe("running");
  });

  it("getHacsStatus handles errors", async () => {
    const origFetch = global.fetch;
    try {
      global.fetch = async () => { throw new Error("Connection refused"); };
      await expect(hacsModule.getHacsStatus({ includeRepos: false })).rejects.toThrow();
    } finally {
      global.fetch = origFetch;
    }
  });

  it("installHacsComponent works", async () => {
    const result = await hacsModule.installHacsComponent("test/repo", "integration");
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("updateHacsComponent works", async () => {
    const result = await hacsModule.updateHacsComponent("test/repo");
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("removeHacsComponent works", async () => {
    const result = await hacsModule.removeHacsComponent("test/repo");
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("searchHacsRepositories works", async () => {
    const result = await hacsModule.searchHacsRepositories("test", "integration");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it("listInstalledHacsComponents works", async () => {
    const result = await hacsModule.listInstalledHacsComponents();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getHacsOutdatedCount works", async () => {
    const result = await hacsModule.getHacsOutdatedCount();
    expect(result).toBeDefined();
  });
});
