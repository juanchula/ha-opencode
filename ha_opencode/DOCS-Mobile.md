# Mobile Support - Home Assistant MCP Server

## Overview

The Home Assistant MCP Server includes special features for mobile device support and adaptive UI behavior. This guide explains how to use the MCP server from mobile devices and what features are available.

## Mobile Detection

The MCP server automatically detects when a client is running on a mobile device and adapts its responses accordingly.

### How Mobile Detection Works

The server analyzes the `User-Agent` header from MCP clients to determine if the client is:
- **Mobile**: Android, iOS (iPhone, iPad, iPod)
- **Desktop**: Windows, macOS, Linux, other non-mobile platforms
- **Tablet**: iPad, Android tablets

### Mobile Detection Tools

Use the `is_mobile_client` tool to check if the current client is mobile:

```javascript
{
  "name": "is_mobile_client",
  "description": "Detect if the MCP client is running on a mobile device"
}
```

**Response Example:**
```json
{
  "is_mobile": true,
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
  "platform": "mobile"
}
```

## Mobile-Optimized Features

### 1. Shorter Descriptions

Mobile clients receive shorter, more concise descriptions for MCP tools:

```javascript
// Desktop: "Configure ESPHome devices and monitor firmware updates"
// Mobile: "Configure ESPHome devices..." (truncated to 150 chars)
```

### 2. Clipboard Support

The `copy_to_clipboard` tool allows mobile users to quickly copy text to their device's clipboard:

```javascript
{
  "name": "copy_to_clipboard",
  "description": "Copy text to clipboard for mobile and desktop clients"
}
```

**Usage:**
```json
{
  "text": "light.living_room"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Text ready for clipboard: light.living_room...",
  "text": "light.living_room"
}
```

### 3. Device Information

The `get_device_info` tool provides information about the current device:

```javascript
{
  "name": "get_device_info",
  "description": "Retrieve detailed information about the current device"
}
```

**Response Example:**
```json
{
  "platform": "darwin",
  "architecture": "arm64",
  "node_version": "v20.10.0",
  "home_assistant_version": "2024.1.0",
  "supervisor_version": "2023.07.0",
  "addon_version": "2024.1.0"
}
```

### 4. Dashboard URL Access

The `get_ha_dashboard_url` tool provides the Home Assistant dashboard URL:

```javascript
{
  "name": "get_ha_dashboard_url",
  "description": "Retrieve the current Home Assistant dashboard URL"
}
```

**Usage:**
```json
{
  "include_port": false
}
```

**Response:**
```json
{
  "dashboard_url": "http://homeassistant",
  "internal_url": "http://homeassistant:8123"
}
```

## Mobile Client Setup

### Known Mobile MCP Clients

1. **MCP Client for Android** - Native Android MCP client
2. **iOS Safari (with MCP extension)** - Web-based MCP client
3. **Custom Mobile Apps** - Any app implementing MCP protocol

### Connecting from Mobile

1. **Install an MCP Client**:
   - Android: Search "MCP Client" on Google Play Store
   - iOS: Search "MCP" in App Store

2. **Configure Connection**:
   ```json
   {
     "server_type": "stdio",
     "command": "hab_cli",
     "args": ["mcp-server"]
   }
   ```

3. **Verify Mobile Detection**:
   ```javascript
   // Call is_mobile_client tool
   {
     "name": "is_mobile_client"
   }
   ```

## Troubleshooting

### Mobile Detection Not Working

If the server doesn't detect your mobile client:

1. **Check User-Agent Header**:
   - Ensure your client sends a proper User-Agent
   - Mobile clients should send: `Mozilla/5.0 (iPhone; CPU iPhone OS ...)`

2. **Clear MCP Server Cache**:
   ```bash
   # Restart the addon
   ha-mcp restart
   ```

3. **Check Logs**:
   ```bash
   # View MCP server logs
   hab_cli logs
   ```

### Clipboard Not Working on Mobile

If clipboard operations fail:

1. **Check Permissions**:
   - Ensure your mobile client has clipboard permissions
   - iOS: Requires user interaction to access clipboard
   - Android: Requires appropriate permissions

2. **Try Text Formatting**:
   ```javascript
   // Use formatTextForMobile for long text
   {
     "name": "format_text_for_mobile",
     "text": "Your long text here..."
   }
   ```

## Best Practices for Mobile Users

### 1. Keep Descriptions Short

Mobile screens are smaller, so use concise prompts:
```javascript
// Good: "What's the weather?"
// Bad: "Can you please tell me what the current weather conditions are like in my location right now?"
```

### 2. Use Clipboard for Quick Actions

Copy entity IDs and automation names for faster interaction:
```javascript
{
  "name": "copy_to_clipboard",
  "text": "light.living_room"
}
```

### 3. Check Device Info

Know your device and HA version for troubleshooting:
```javascript
{
  "name": "get_device_info"
}
```

## Future Enhancements

Planned mobile improvements:
- **Touch Gestures**: MCP tools for touch-based interactions
- **Voice Commands**: Integration with mobile voice assistants
- **Push Notifications**: MCP-based notification system
- **Offline Mode**: Cached MCP operations for offline use

## Related Documentation

- [DOCS-MCP.md](DOCS-MCP.md) - Complete MCP guide
- [DOCS.md](DOCS.md) - General addon documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Compatibility**: Home Assistant 2024.1+
