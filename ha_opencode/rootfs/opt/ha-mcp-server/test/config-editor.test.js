import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_CONFIG_PATH = join(__dirname, "..", "..", "..", "..", "config.yaml");

beforeAll(() => {
  process.env.HA_CONFIG_DIR = join(__dirname, "..", "..", "..", "..");
});

afterAll(() => {
  delete process.env.HA_CONFIG_DIR;
});

describe("Config Editor", () => {
  let mod;

  beforeAll(async () => {
    mod = await import("../lib/config-editor.js");
  });

  it("readConfig returns content and path", async () => {
    const result = mod.readConfig();
    expect(result.content).toBeDefined();
    expect(result.path).toBeDefined();
  });

  it("editConfigValue modifies boolean", async () => {
    const result = mod.editConfigValue("screenshot_enabled", true);
    expect(result.success).toBe(true);
    expect(result.key).toBe("screenshot_enabled");
  });

  it("editConfigValue rejects invalid key", async () => {
    expect(() => mod.editConfigValue("invalid_key_xyz", "value")).toThrow("Invalid config key");
  });

  it("addEnvVar adds new env var", async () => {
    const result = mod.addEnvVar("TEST_VAR_XYZ", "test_value_xyz");
    expect(result.success).toBe(true);
    expect(result.name).toBe("TEST_VAR_XYZ");
  });
});
