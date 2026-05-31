# Deployment & Testing Guide

## Prerequisites

- Home Assistant OS or Supervised installation (2024.1+)
- Docker CLI access (for building the addon image locally)
- Git (for cloning and building)
- A Long-Lived Access Token from Home Assistant (Profile → Security → Long-Lived Access Tokens)

---

## 1. Local Development Build

```bash
# Clone the repo
git clone https://github.com/magnusoverli/opencode.git
cd opencode/ha_opencode

# Build the Docker image locally
docker build -f Dockerfile -t ha-opencode:dev .

# Verify it starts
docker run --rm ha-opencode:dev node --version
```

---

## 2. Install as Addon (Local)

### Option A: Install from local folder (recommended for testing)

```bash
# From your Home Assistant host (if you have SSH access)
cd /path/to/opencode/ha_opencode

# Build and load the image
docker build -f Dockerfile -t ha-opencode:local .
docker save ha-opencode:local | gzip > ha-opencode.tar.gz

# Copy to HA host and load
scp ha-opencode.tar.gz homeassistant@ha-host:/tmp/
ssh homeassistant@ha-host 'docker load < /tmp/ha-opencode.tar.gz'

# In HA UI: Settings → Add-ons → Add-on store → ⋮ → Load local addon
# Select the ha_opencode folder
```

### Option B: Install from GitHub (for contributors)

```bash
# In HA UI: Settings → Add-ons → Add-on store → ⋮ → Repositories
# Add: https://github.com/juanchula/ha-opencode
# Then install "OpenCode" from the store
```

---

## 3. Configuration

After installing, go to the addon configuration:

### Required
- `access_token`: Your Long-Lived Access Token (create at Profile → Security)

### Optional (enable integrations as needed)

| Option | Default | Description |
|--------|---------|-------------|
| `mcp_enabled` | true | Enable MCP server |
| `lsp_enabled` | true | Enable LSP server |
| `cpu_mode` | auto | CPU mode: auto/baseline/regular |
| `screenshot_enabled` | false | Enable screenshot tool |
| `z2m_url` | "" | Zigbee2MQTT ingress URL |
| `hacs_enabled` | false | Enable HACS integration |
| `grafana_url` | "" | Grafana ingress URL |
| `nodered_url` | "" | Node-RED ingress URL |
| `influxdb_url` | "" | InfluxDB ingress URL |
| `frigate_url` | "" | Frigate ingress URL |
| `music_assistant_url` | "" | Music Assistant ingress URL |

### Example Full Config

```yaml
mcp_enabled: true
lsp_enabled: true
screenshot_enabled: true
access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOi..."
hacs_enabled: true
grafana_url: "http://a0d7b954-grafana:80"
nodered_url: "http://a0d7b954-nodered:1880"
influxdb_url: "http://a0d7b954-influxdb:8086"
backup_manager_enabled: true
```

---

## 4. Connect MCP Client

### Claude Code / OpenCode Desktop

```json
{
  "mcpServers": {
    "ha-opencode": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--network=host",
        "-e", "SUPERVISOR_TOKEN=eyJ0eXAiOiJKV1...",
        "-e", "HA_ACCESS_TOKEN=eyJ0eXAiOiJKV1...",
        "ha-opencode:dev",
        "node", "index.js"
      ]
    }
  }
}
```

### Via Ingress (no Docker needed)

The addon exposes an MCP endpoint via ingress at:
```
http://homeassistant:8099/mcp
```

Configure your MCP client to point to this URL with the appropriate headers.

---

## 5. Run Tests

```bash
# Install dependencies
cd ha_opencode/rootfs/opt/ha-mcp-server
npm install

# Run all tests
npm test

# Run specific test suite
npx vitest run test/hacs-integration.test.js
npx vitest run test/grafana-integration.test.js
npx vitest run test/nodered-integration.test.js
npx vitest run test/influxdb-integration.test.js
npx vitest run test/addon-manager.test.js
npx vitest run test/frigate-integration.test.js
npx vitest run test/backup-manager.test.js
npx vitest run test/music-assistant-integration.test.js
npx vitest run test/dev-tools-integration.test.js
npx vitest run test/clipboard.test.js
npx vitest run test/config-editor.test.js

# Watch mode
npx vitest
```

---

## 6. Verify Installation

### Check MCP Server Logs

```bash
# In HA UI: Settings → System → Logs
# Or via CLI:
docker logs <addon_container_name>
```

Expected startup output:
```
Home Assistant MCP server v2.7.0 started (Safe Config Edition)
Capabilities: Tools (97), Resources (9), Prompts (6), Logging
Features: Structured Output, Tool Annotations, Resource Links, Content Annotations, Live Docs, Safe Config Writing, Screenshots (disabled)
```

### Test Tools via MCP

```bash
# List all tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node index.js

# Test a tool (example: get HACS status)
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"hacs_status","arguments":{}}}' | node index.js

# Test clipboard
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"copy_to_clipboard","arguments":{"text":"hello world"}}}' | node index.js

# Test config editor
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"edit_opencode_config","arguments":{"action":"read"}}}' | node index.js
```

---

## 7. Update HA Version Independently

```bash
# Update the HA base image without changing addon version
cd /path/to/opencode/ha_opencode
bash scripts/update-ha-version.sh trixie  # or bookworm, etc.

# The script updates BUILD_FROM in Dockerfile and records the version in ha_opencode/HATEST
```

---

## 8. Troubleshooting

### MCP Server won't start
- Check `hassio_api` and `homeassistant_api` are enabled in addon config
- Verify `access_token` is set correctly
- Check logs: Settings → System → Logs

### Tools return "not implemented" errors
- Enable the corresponding integration in addon config (e.g., `hacs_enabled: true`)
- Verify the integration is running in HA (Settings → System → Add-ons)

### Clipboard not working
- The `copy_to_clipboard` tool returns clipboard-ready data
- The browser UI must call `navigator.clipboard.writeText()` to actually copy
- Check browser console for clipboard permission errors

### Config editor fails
- Ensure the addon has write access to the HA config directory (`map: homeassistant_config`)
- Check file permissions in `/config/`

---

## 9. Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 10. Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design and module structure.
