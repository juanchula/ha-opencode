import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard, getClipboardStatus, formatTextForMobile } from '../lib/clipboard.js';

describe('Clipboard Features', () => {
  describe('copyToClipboard', () => {
    it('returns success for valid text', () => {
      const result = copyToClipboard('test text');
      expect(result.success).toBe(true);
      expect(result.text).toBe('test text');
    });
    it('truncates message for long text', () => {
      const longText = 'A'.repeat(100);
      const result = copyToClipboard(longText);
      expect(result.message).toContain('Text ready for clipboard');
      expect(result.message.length).toBeLessThan(200);
    });
    it('throws error for empty text', () => {
      expect(() => copyToClipboard('')).toThrow('Text parameter is required');
    });
    it('throws error for null text', () => {
      expect(() => copyToClipboard(null)).toThrow('Text parameter is required');
    });
  });

  describe('getClipboardStatus', () => {
    it('returns platform and supportsClipboard', () => {
      const status = getClipboardStatus();
      expect(status.platform).toBe(process.platform);
      expect(status.supportsClipboard).toBe(typeof navigator !== 'undefined' && navigator.clipboard !== undefined);
    });
  });

  describe('formatTextForMobile', () => {
    it('removes excessive whitespace', () => {
      const text = '  Hello    World  \n\n   Test  ';
      const result = formatTextForMobile(text);
      expect(result).toBe('Hello World Test');
    });
    it('truncates long text to 500 chars', () => {
      const longText = 'A'.repeat(1000);
      const result = formatTextForMobile(longText);
      expect(result.length).toBeLessThanOrEqual(500);
    });
    it('handles empty string', () => {
      expect(formatTextForMobile('')).toBe('');
    });
    it('handles null', () => {
      expect(formatTextForMobile(null)).toBe('');
    });
  });
});
