import { describe, it, expect } from "vitest";
import { copyToClipboard, getClipboardStatus, formatTextForMobile } from "../lib/clipboard.js";

describe("Clipboard Features", () => {
  describe("copyToClipboard", () => {
    it("returns success and clipboard data for valid text", () => {
      const result = copyToClipboard("test text");
      expect(result.success).toBe(true);
      expect(result.clipboard.text).toBe("test text");
      expect(result.clipboard.length).toBe(9);
    });

    it("returns mobile_optimized field", () => {
      const result = copyToClipboard("line1\nline2");
      expect(result.clipboard.mobile_optimized).toBeDefined();
    });

    it("includes browser instructions", () => {
      const result = copyToClipboard("hello");
      expect(result.instructions).toBeDefined();
      expect(result.instructions.browser).toContain("navigator.clipboard");
    });

    it("throws error for empty text", () => {
      expect(() => copyToClipboard("")).toThrow("Text parameter is required");
    });

    it("throws error for null", () => {
      expect(() => copyToClipboard(null)).toThrow("Text parameter is required");
    });
  });

  describe("getClipboardStatus", () => {
    it("returns clipboard capability info", () => {
      const status = getClipboardStatus();
      expect(status.available).toBe(true);
      expect(status.mode).toBe("browser_api");
      expect(status.requires_browser).toBe(true);
    });
  });

  describe("formatTextForMobile", () => {
    it("removes excessive whitespace", () => {
      const text = "  Hello    World  \n\n   Test  ";
      const result = formatTextForMobile(text);
      expect(result).toBe("Hello World Test");
    });

    it("truncates long text to 500 chars", () => {
      const longText = "A".repeat(1000);
      const result = formatTextForMobile(longText);
      expect(result.length).toBeLessThanOrEqual(500);
    });

    it("returns empty string for empty input", () => {
      expect(formatTextForMobile("")).toBe("");
    });

    it("returns empty string for null", () => {
      expect(formatTextForMobile(null)).toBe("");
    });

    it("extracts YAML value if present", () => {
      const yaml = "access_token: abc123";
      const result = formatTextForMobile(yaml);
      expect(result).toBe("abc123");
    });
  });
});
