import { describe, it, expect } from 'vitest';
import { getDeviceInfo, getClientInfo, isRunningInHA, getHAConfigDir } from '../lib/device-info.js';

describe('Device Info Features', () => {
  describe('getDeviceInfo', () => {
    it('returns platform and architecture', () => {
      const info = getDeviceInfo();
      expect(info.platform).toBeDefined();
      expect(info.arch).toBeDefined();
      expect(info.nodeVersion).toBeDefined();
    });
    it('includes Home Assistant version', () => {
      const info = getDeviceInfo();
      expect(info.homeAssistantVersion).toBeDefined();
      expect(typeof info.homeAssistantVersion).toBe('string');
    });
    it('includes uptime', () => {
      const info = getDeviceInfo();
      expect(info.uptime).toBeGreaterThan(0);
    });
    it('includes memory usage', () => {
      const info = getDeviceInfo();
      expect(info.memoryUsage).toBeDefined();
    });
  });

  describe('getClientInfo', () => {
    it('returns empty object with null context', () => {
      expect(getClientInfo(null)).toEqual({});
    });
    it('extracts user agent from context', () => {
      const context = {
        params: {
          mcp_user_agent: 'test-agent',
        },
      };
      const info = getClientInfo(context);
      expect(info.userAgent).toBe('test-agent');
    });
  });

  describe('isRunningInHA', () => {
    it('returns true when SUPERVISOR_TOKEN exists', () => {
      const originalToken = process.env.SUPERVISOR_TOKEN;
      process.env.SUPERVISOR_TOKEN = 'test-token';
      expect(isRunningInHA()).toBe(true);
      process.env.SUPERVISOR_TOKEN = originalToken;
    });
    it('returns false when SUPERVISOR_TOKEN does not exist', () => {
      const originalToken = process.env.SUPERVISOR_TOKEN;
      delete process.env.SUPERVISOR_TOKEN;
      expect(isRunningInHA()).toBe(false);
      process.env.SUPERVISOR_TOKEN = originalToken;
    });
  });

  describe('getHAConfigDir', () => {
    it('returns default path when env not set', () => {
      const originalDir = process.env.HOME_ASSISTANT_CONFIG_DIR;
      delete process.env.HOME_ASSISTANT_CONFIG_DIR;
      expect(getHAConfigDir()).toBe('/homeassistant');
      process.env.HOME_ASSISTANT_CONFIG_DIR = originalDir;
    });
    it('returns custom path when env is set', () => {
      const originalDir = process.env.HOME_ASSISTANT_CONFIG_DIR;
      process.env.HOME_ASSISTANT_CONFIG_DIR = '/custom/path';
      expect(getHAConfigDir()).toBe('/custom/path');
      process.env.HOME_ASSISTANT_CONFIG_DIR = originalDir;
    });
  });
});
