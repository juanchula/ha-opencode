import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isMobileClient, isTabletClient, getMobileDescription, hasClipboardSupport, optimizeToolsForMobile } from '../lib/mobile-features.js';

describe('Mobile Features', () => {
  describe('isMobileClient', () => {
    it('detects Android devices', () => {
      expect(isMobileClient('Mozilla/5.0 (Linux; Android 10)')).toBe(true);
    });
    it('detects iOS devices', () => {
      expect(isMobileClient('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')).toBe(true);
    });
    it('detects tablets', () => {
      expect(isMobileClient('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')).toBe(true);
    });
    it('detects desktop', () => {
      expect(isMobileClient('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
    });
    it('detects macOS', () => {
      expect(isMobileClient('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(false);
    });
    it('handles empty user agent', () => {
      expect(isMobileClient('')).toBe(false);
    });
    it('handles null user agent', () => {
      expect(isMobileClient(null)).toBe(false);
    });
  });

  describe('isTabletClient', () => {
    it('detects iPad', () => {
      expect(isTabletClient('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')).toBe(true);
    });
    it('detects Android tablets', () => {
      expect(isTabletClient('Mozilla/5.0 (Linux; Android 10; Tablet)')).toBe(true);
    });
    it('does not detect phones as tablets', () => {
      expect(isTabletClient('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)')).toBe(false);
    });
    it('handles empty user agent', () => {
      expect(isTabletClient('')).toBe(false);
    });
  });

  describe('getMobileDescription', () => {
    it('truncates long descriptions', () => {
      const longDesc = 'This is a very long description that should be truncated for mobile display purposes'.repeat(10);
      const result = getMobileDescription(longDesc);
      expect(result).toBe(longDesc.substring(0, 150) + '...');
    });
    it('returns short descriptions unchanged', () => {
      const shortDesc = 'Short';
      expect(getMobileDescription(shortDesc)).toBe(shortDesc);
    });
    it('handles null', () => {
      expect(getMobileDescription(null)).toBe(null);
    });
  });

  describe('hasClipboardSupport', () => {
    it('returns false when navigator is undefined', () => {
      expect(hasClipboardSupport()).toBe(false);
    });
    it('returns false when navigator.clipboard does not exist', () => {
      expect(hasClipboardSupport()).toBe(false);
    });
  });

  describe('optimizeToolsForMobile', () => {
    it('truncates all tool descriptions', () => {
      const tools = [
        { name: 'test', description: 'A very long description that should be truncated for mobile display'.repeat(10) },
      ];
      const result = optimizeToolsForMobile(tools);
      expect(result[0].description).toBe('A very long description that should be truncated for mobile display'.repeat(10).substring(0, 150) + '...');
    });
    it('preserves tool properties', () => {
      const tools = [
        { name: 'test', description: 'Short', title: 'Test' },
      ];
      const result = optimizeToolsForMobile(tools);
      expect(result[0].name).toBe('test');
      expect(result[0].title).toBe('Test');
    });
    it('handles empty array', () => {
      const result = optimizeToolsForMobile([]);
      expect(result).toEqual([]);
    });
  });
});
