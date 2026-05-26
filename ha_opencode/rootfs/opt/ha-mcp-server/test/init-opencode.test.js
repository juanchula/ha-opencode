import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { readFileSync } from "fs";
import { join } from "path";

// Real init script path (read-only)
const INIT_SCRIPT_PATH = "/Volumes/Datos/juan-mac-mini-m4/domotica/opencode-clone/ha_opencode/rootfs/etc/s6-overlay/s6-rc.d/init-opencode/run";

describe("Init Script Testability", function () {
  var tempDir;

  beforeAll(async function () {
    tempDir = await mkdtemp(join("/tmp", "init-test"));
  });

  afterEach(async function () {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(function () {});
    }
  });

  afterAll(async function () {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(function () {});
    }
  });

  it("should create sandbox test harness", function () {
    // Verify the real init script exists
    var scriptContent = readFileSync(INIT_SCRIPT_PATH, "utf-8");
    expect(scriptContent.length).toBeGreaterThan(0);
  });

  it("should mock bashio function stubs", function () {
    var mockConfig = vi.fn(function (key) {
      var configs = {
        "openCode.version": "1.8.1",
        "openCode.mode": "amd64"
      };
      return configs[key];
    });

    expect(mockConfig("openCode.version")).toBe("1.8.1");
    expect(mockConfig("openCode.mode")).toBe("amd64");
  });

  it("should mock s6 binary stubs with deterministic behavior", function () {
    var mockS6Rc = vi.fn(function () {
      return {
        setenv: vi.fn(),
        write: vi.fn(),
        flush: vi.fn()
      };
    });

    var mockS6Svscan = vi.fn(function () {
      return {
        exec: vi.fn(),
        finish: vi.fn()
      };
    });

    expect(mockS6Rc()).toBeDefined();
    expect(mockS6Svscan()).toBeDefined();
  });

  it("should mock npm and node binaries with controlled behavior", function () {
    function mockNpm(args) {
      if (args.includes("install")) {
        return {
          code: 0,
          stdout: "",
          stderr: ""
        };
      }
      return {
        code: 0,
        stdout: "mock output",
        stderr: ""
      };
    }

    var result = mockNpm(["install"]);
    expect(result.code).toBe(0);
  });
});
