# MCP Server Documentation

## Overview

The Home Assistant MCP (Model Context Protocol) Server provides deep integration between OpenCode and Home Assistant. This documentation covers all aspects of the MCP server, including tools, resources, prompts, and mobile support.

## What is MCP?

**MCP (Model Context Protocol)** is a standardized protocol for connecting AI models to data sources and tools. Think of it as a universal translator that allows AI assistants to understand and interact with your Home Assistant.

### MCP Components

1. **Tools**: Actions the MCP server can perform (34 tools available)
2. **Resources**: Data the MCP server can provide (13 resources)
3. **Prompts**: Guided workflows for common tasks (6 prompts)
4. **Intelligence Layer**: AI-powered suggestions and analysis

## Quick Start

### Enable MCP Integration

1. Open Home Assistant
2. Go to **Settings** → **Add-ons**
3. Find **OpenCode**
4. Toggle **"Enable MCP Home Assistant Integration"**
5. Click **Apply**
6. Restart the addon

### Connect an MCP Client

1. Install an MCP client (see [Client List](#mcp-clients))
2. Configure connection to `hab_cli`
3. Start using MCP tools!

## MCP Tools (34 Available)

### Device Management Tools

| Tool | Description |
|------|-------------|
| `get_entities` | List all Home Assistant entities |
| `get_entity_state` | Get state of a specific entity |
| `search_entities` | Search entities by name or domain |
| `get_area_entities` | Get all entities in an area |
| `get_device_entities` | Get all entities for a device |
| `get_entity_config` | Get configuration of an entity |
| `update_entity` | Update entity state or attributes |
| `entity_state_summary` | Get summary of entity states |

### Automation Tools

| Tool | Description |
|------|-------------|
| `get_automations` | List all automations |
| `get_automation` | Get details of an automation |
| `create_automation` | Create a new automation |
| `edit_automation` | Modify an existing automation |
| `delete_automation` | Remove an automation |
| `test_automation` | Test automation trigger |
| `get_automation_triggers` | Get automation triggers |
| `get_automation_conditions` | Get automation conditions |
| `get_automation_actions` | Get automation actions |
| `trigger_automation` | Manually trigger an automation |

### Configuration Tools

| Tool | Description |
|------|-------------|
| `get_config` | Get addon configuration |
| `update_config` | Update addon configuration |
| `get_hab_cli_version` | Check hab CLI version |
| `update_hab_cli` | Update hab CLI to latest version |
| `get_hab_cli_help` | Get hab CLI help |
| `run_hab_command` | Execute hab CLI command |
| `get_hab_cli_logs` | Get hab CLI logs |
| `get_hab_cli_status` | Check hab CLI status |

### ESPHome Tools

| Tool | Description |
|------|-------------|
| `get_esphome_devices` | List ESPHome devices |
| `get_esphome_config` | Get ESPHome configuration |
| `update_esphome_config` | Update ESPHome configuration |
| `flash_esphome_device` | Flash ESPHome device |
| `get_esphome_logs` | Get ESPHome device logs |
| `restart_esphome_device` | Restart ESPHome device |
| `get_esphome_firmware` | Get ESPHome firmware version |
| `update_esphome_firmware` | Update ESPHome firmware |

### Script Tools

| Tool | Description |
|------|-------------|
| `get_scripts` | List all scripts |
| `run_script` | Execute a script |
| `get_script_info` | Get script information |
| `delete_script` | Remove a script |

### Validation Tools

| Tool | Description |
|------|-------------|
| `validate_yaml` | Validate YAML configuration |
| `validate_automation` | Validate automation YAML |
| `validate_script` | Validate script YAML |
| `get_validation_errors` | Get validation error details |

### Intelligence Tools

| Tool | Description |
|------|-------------|
| `detect_anomaly` | Detect unusual entity behavior |
| `search_entities` | Intelligent entity search |
| `generate_suggestions` | AI-powered automation suggestions |
| `generate_state_summary` | Generate state summary |

### Documentation Tools

| Tool | Description |
|------|-------------|
| `get_ha_docs` | Get Home Assistant documentation |
| `get_integration_docs` | Get integration-specific docs |
| `search_ha_docs` | Search Home Assistant docs |
| `get_setup_guide` | Get entity setup guide |

### ESPHome Documentation Tools

| Tool | Description |
|------|-------------|
| `get_esphome_api_docs` | Get ESPHome API documentation |
| `get_esphome_sensor_support` | Get supported sensor list |
| `get_esphome_binary_sensor_support` | Get supported binary sensor list |
| `get_esphome_button_support` | Get supported button list |
| `get_esphome_cover_support` | Get supported cover list |
| `get_esphome_light_support` | Get supported light list |
| `get_esphome_sensor_configuration` | Get sensor configuration guide |
| `get_esphome_binary_sensor_configuration` | Get binary sensor configuration guide |
| `get_esphome_button_configuration` | Get button configuration guide |
| `get_esphome_cover_configuration` | Get cover configuration guide |
| `get_esphome_light_configuration` | Get light configuration guide |

### Visual Verification Tools

| Tool | Description |
|------|-------------|
| `screenshot_dashboard` | Capture dashboard screenshot |
| `screenshot_page` | Capture specific page screenshot |
| `analyze_screenshot` | AI analysis of screenshot |
| `verify_dashboard_change` | Verify UI changes visually |

## Mobile Support

See [DOCS-Mobile.md](DOCS-Mobile.md) for complete mobile support documentation, including:
- Mobile detection features
- Clipboard support
- Device information tools
- Mobile-optimized UI

## Resources

The MCP server provides access to Home Assistant data through resources:
- `ha://states/summary` - Entity state summary
- `ha://states/{domain}` - States by domain
- `ha://automations` - Automation list
- `ha://scripts` - Script list
- `ha://config` - Configuration
- More...

## Prompts

Guided workflows for common tasks:
- `troubleshoot_entity` - Debug entity issues
- `create_automation` - Step-by-step automation creation
- `optimize_energy` - Energy optimization suggestions
- `setup_integration` - Integration setup guide
- `diagnose_network` - Network troubleshooting
- `backup_configuration` - Backup configuration guide

## Intelligence Layer

The MCP server includes AI-powered features:
- **Anomaly Detection**: Identifies unusual entity behavior
- **Entity Search**: Intelligent search with ranking
- **Automation Suggestions**: AI-powered automation recommendations
- **State Summaries**: Natural language entity summaries

## Troubleshooting

### MCP Not Working

1. **Check Logs**:
   ```bash
   hab_cli logs
   ```

2. **Verify Configuration**:
   ```bash
   hab_cli status
   ```

3. **Restart MCP Server**:
   ```bash
   ha-mcp restart
   ```

### Connection Issues

1. Ensure addon is running
2. Check Home Assistant version compatibility
3. Verify User-Agent header from client

## MCP Clients

### Official Clients

1. **GitHub Models MCP Client** - Official GitHub MCP client
2. **Claude Desktop** - Claude AI with MCP support
3. **Cursor** - Code editor with MCP integration

### Mobile Clients

1. **MCP Client for Android** - Native Android MCP client
2. **iOS MCP Extension** - Safari extension for iOS

### Self-Hosted

1. **LangChain MCP** - LangChain MCP server
2. **LlamaIndex MCP** - LlamaIndex MCP server

## Best Practices

1. **Keep HA Updated**: Regular updates ensure compatibility
2. **Enable Logging**: Use verbose logging for debugging
3. **Backup Configuration**: Before making changes
4. **Test Changes**: Use test automation before deploying
5. **Monitor Logs**: Regular log review for issues

## Related Documentation

- [DOCS.md](DOCS.md) - General addon documentation
- [DOCS-Mobile.md](DOCS-Mobile.md) - Mobile support guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Compatibility**: Home Assistant 2024.1+
