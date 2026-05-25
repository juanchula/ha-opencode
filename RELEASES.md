# Channel Releases Documentation

This document describes the differences between Stable and Beta channels for the OpenCode Home Assistant add-on.

## Channel Overview

### Stable Channel (`ha_opencode`)

The **Stable** channel is the production release of OpenCode, intended for users who want a reliable and tested experience.

- **Version Scheme**: Semantic versioning (e.g., `1.8.1`)
- **Release Cadence**: Quarterly major/minor releases with regular patch updates
- **Dockerfile**: Shared multi-stage build from `ghcr.io/home-assistant/amd64-base-debian:trixie`
- **Features**: Production-grade features with full testing
- **Support**: Primary support channel for bug reports and feature requests

### Beta Channel (`ha_opencode_beta`)

The **Beta** channel provides access to experimental features and upcoming changes before they reach Stable.

- **Version Scheme**: Semantic versioning with beta suffix (e.g., `1.7.3b1`)
- **Release Cadence**: Bi-weekly releases tracking development branch
- **Dockerfile**: Shared multi-stage build from `ghcr.io/home-assistant/amd64-base-debian:trixie`
- **Features**: Experimental features, early access to new capabilities
- **Support**: Beta testing feedback channel

## Installation Behavior

### Side-by-Side Installation

Both channels can be installed simultaneously in the same Home Assistant instance:

1. Add both repositories to Home Assistant addon store
2. Install `ha_opencode` (Stable) and `ha_opencode_beta` (Beta)
3. Each addon instance runs independently with isolated configuration
4. No conflicts between channel configurations

### Configuration Independence

- Each channel maintains separate configuration files
- User settings (themes, features, toggles) are channel-specific
- Both channels share the same underlying OpenCode binary (from npm)
- Zigbee2MQTT configuration is channel-specific (`z2m_url`, `z2m_mqtt_topic`)

## Parity Comparison

| Feature | Stable | Beta | Notes |
|---------|--------|------|--------|
| **Base Docker Image** | Shared (Debian Trixie) | Shared (Debian Trixie) | Same Dockerfile pattern |
| **hab CLI** | Built from source (pinned) | Built from source (pinned) | Identical build process |
| **OpenCode Binary** | npm package versioned | npm package versioned | Version differs per release |
| **Zigbee2MQTT Support** | `z2m_url: str?` | `z2m_url: url?` ❌ | Schema mismatch (BUG) |
| **MCP Features** | Production set | Production set | Same feature set |
| **LSP Features** | Production set | Production set | Same feature set |
| **Update Channel** | Stable releases | Development releases | Different cadence |
| **Support Priority** | Primary | Secondary | Stable gets priority |
| **Breaking Changes** | Careful rollout | Early exposure | Beta may break |

## Version History

### Stable Channel (`ha_opencode`)

- **1.8.1**: Latest stable release
  - Full MCP integration with Home Assistant
  - LSP support with entity autocomplete
  - hab CLI integration for admin operations

### Beta Channel (`ha_opencode_beta`)

- **1.7.3b1**: Current beta release
  - Same core features as stable
  - Experimental enhancements in progress
  - Schema inconsistency noted below

## Known Issues

### Schema Inconsistency (Schema Bug)

**Location**: `ha_opencode_beta/config.yaml` line 92

```yaml
# Current (INCORRECT)
z2m_url: url?

# Should be (MATCHES STABLE)
z2m_url: str?
```

**Impact**: Beta channel users cannot validate `z2m_url` schema properly. Users should use `str?` type to match stable channel.

**Fix Required**: Change `z2m_url: url?` to `z2m_url: str?` in `ha_opencode_beta/config.yaml`

## Recommendations

### For Users

- **Production use**: Install Stable channel (`ha_opencode`)
- **Early access**: Install Beta channel (`ha_opencode_beta`) alongside Stable
- **Testing**: Monitor beta for issues before migrating

### For Developers

- **Feature development**: Contribute to Beta channel
- **Bug reports**: Test in Beta first, report issues before Stable release
- **Schema consistency**: Ensure all schema definitions match (`str?` not `url?`)

## Migration Notes

When migrating between channels:

1. Backup your configuration
2. Note any custom settings (themes, toggles)
3. Reconfigure Beta settings after migration
4. Zigbee2MQTT URL format: Use `str?` type for compatibility

## References

- [README.md](./README.md)
- [Stable Channel Docs](./ha_opencode/DOCS.md)
- [Beta Channel Docs](./ha_opencode_beta/DOCS.md)
- [CHANGELOG.md](./ha_opencode/CHANGELOG.md)
