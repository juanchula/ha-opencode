import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let tmpDir;
let originalConfig;

const TEST_CONFIG_CONTENT = `---
name: "OpenCode Test"
version: "1.0.0"
slug: "opencode_test"

options:
  screenshot_enabled: false
  access_token: ""
  terminal_theme: "breeze"
  font_size: 14
  env_vars: []
  opencode_config: ""

schema:
  screenshot_enabled: bool
  access_token: str?
  terminal_theme: str
  font_size: int(10,24)
  env_vars:
    - name: str
      value: str
  opencode_config: str?
`;

beforeAll(() => {
  // Create temp directory
  tmpDir = mkdtempSync(join(tmpdir(), "opencode-config-test-"));
  
  // Write test config
  writeFileSync(join(tmpDir, "config.yaml"), TEST_CONFIG_CONTENT);
  
  // Set env var for config-editor
  process.env.HA_CONFIG_DIR = tmpDir;
});

afterAll(() => {
  delete process.env.HA_CONFIG_DIR;
  
  // Clean up temp directory
  if (tmpDir && existsSync(tmpDir)) {
    // Remove .bak if created
    const bakPath = join(tmpDir, "config.yaml.bak");
    if (existsSync(bakPath)) rmSync(bakPath);
    rmSync(join(tmpDir, "config.yaml"));
    rmSync(tmpDir, { recursive: true });
  }
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
    expect(result.content).toContain("screenshot_enabled");
  });

  it("editConfigValue modifies boolean", async () => {
    const result = mod.editConfigValue("screenshot_enabled", true);
    expect(result.success).toBe(true);
    expect(result.key).toBe("screenshot_enabled");
    
    // Verify the file was actually modified
    const content = readFileSync(join(tmpDir, "config.yaml"), "utf-8");
    expect(content).toContain("screenshot_enabled: true");
  });

  it("editConfigValue rejects invalid key", async () => {
    expect(() => mod.editConfigValue("invalid_key_xyz", "value")).toThrow("Invalid config key");
  });

  it("addEnvVar adds new env var", async () => {
    const result = mod.addEnvVar("MY_CUSTOM_VAR", "my_value");
    expect(result.success).toBe(true);
    expect(result.name).toBe("MY_CUSTOM_VAR");
    
    // Verify backup was created
    expect(existsSync(join(tmpDir, "config.yaml.bak"))).toBe(true);
    
    // Verify no corruption
    const content = readFileSync(join(tmpDir, "config.yaml"), "utf-8");
    // Should NOT contain test artifacts from previous runs
    expect(content).not.toContain("TEST_VAR_XYZ");
    expect(content).not.toContain("test_value_xyz");
  });

  it("does not corrupt main config file", async () => {
    // Verify the real config.yaml in the addon directory is untouched
    const realConfigPath = join(__dirname, "..", "..", "..", "..", "config.yaml");
    if (existsSync(realConfigPath)) {
      const realContent = readFileSync(realConfigPath, "utf-8");
      expect(realContent).not.toContain("TEST_VAR_XYZ");
      expect(realContent).not.toContain("test_value_xyz");
    }
  });
});
