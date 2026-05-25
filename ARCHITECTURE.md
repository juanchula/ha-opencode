# OpenCode MCP/LSP Server Architecture

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       Home Assistant Addon                         │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐          ┌──────────────────────────┐   │
│  │    ha_opencode       │          │    ha_opencode_beta     │   │
│  │    (Stable)          │          │      (Beta)              │   │
│  │    v1.8.1            │          │      v1.7.3b1            │   │
│  └────────┬─────────────┘          └───────────┬──────────────┘   │
│           │                                     │                  │
│           └──────────────┬──────────────────────┘                  │
│                          │                                         │
│              ┌───────────▼───────────┐                             │
│              │     s6-overlay        │                             │
│              │   (Init System)       │                             │
│              └───────────┬───────────┘                             │
│                          │                                         │
│              ┌───────────▼───────────┐                             │
│              │     MCP Server     │    │     LSP Server            │
│              │   ha-mcp-server/   │    │   ha-lsp-server/          │
│              │   ───────────────  │    │   ───────────────         │
│              │   - Tool Handlers  │    │   - Completions           │
│              │   - Resources      │    │   - YAML Analysis         │
│              │   - Prompts        │    │   - Diagnostics           │
│              └───────────┬───────────┘                             │
│                          │                                         │
│              ┌───────────▼───────────┐                             │
│              │  Docker Build Flow    │                             │
│              │  ──────────────────   │                             │
│              │  1. hab-builder      │                             │
│              │     (golang:1.24)     │                             │
│              │  2. npm-builder       │                             │
│              │     (node:20-alpine)  │                             │
│              │  3. Main Image        │                             │
│              │     (Debian Trixie)   │                             │
│              └───────────────────────┘                             │
└────────────────────────────────────────────────────────────────────┘
```

## Layer Boundaries

### Home Assistant Addon Layer
- Both stable and beta channels are standalone Home Assistant addons
- Each channel has independent configuration via `config.yaml`
- Both channels share the same Docker build pattern
- Can be installed simultaneously without conflicts

### s6-overlay Init System
The addon uses s6-overlay for service supervision:

```bash
# ha_opencode/rootfs/etc/s6-overlay/s6-rc.d/
├── init-opencode/
│   └── run          # One-shot init script
└── ha-opencode/
    └── run          # Long-running MCP/LSP server
```

#### Startup Flow:
1. **init-opencode** (oneshot):
   - Sets up environment variables
   - Configures s6 service definitions
   - Runs configuration validation
   
2. **ha-opencode** (longrun):
   - Starts MCP server (port 8000)
   - Starts LSP server (port 8001)
   - Monitors service health

### MCP Server Layer

Location: `ha_opencode/rootfs/opt/ha-mcp-server/`

Structure:
```
ha-mcp-server/
├── index.js           # Main entry point - tool catalog + handlers
├── package.json       # Node.js dependencies
├── README.md          # Server documentation
└── test/
    ├── validation.test.js
    ├── intelligence.test.js
    ├── html-parser.test.js
    └── index.test.js
```

The MCP server uses the [Model Context Protocol](https://modelcontextprotocol.io/):

```javascript
// Tool Catalog Structure
{
  tools: [
    {
      name: 'tool_name',
      description: 'Tool description',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: 'Parameter description' }
        }
      }
    }
  ],
  resources: [
    {
      uri: 'hass://resource',
      name: 'Resource Name',
      description: 'Resource description',
      mimeType: 'application/json'
    }
  ],
  prompts: [
    {
      name: 'prompt_name',
      description: 'Prompt description',
      arguments: [
        { name: 'arg1', description: 'Argument description', required: true }
      ]
    }
  ]
}
```

### LSP Server Layer

Location: `ha_opencode/rootfs/opt/ha-lsp-server/`

Structure:
```
ha-lsp-server/
├── server.js          # Main LSP server entry
├── package.json       # Node.js dependencies
├── README.md          # Server documentation
├── lib/
│   ├── completions.js    # Entity & YAML autocomplete
│   └── yaml-analyzer.js  # YAML configuration analysis
└── test/
    └── *.test.js
```

The LSP server provides:
- Entity completion for Home Assistant YAML
- YAML schema validation
- Hover information for entities
- Go-to-definition for entity references

### Docker Build Flow

The addon uses multi-stage Docker builds:

```dockerfile
# Stage 1: Build hab CLI (Go binary)
FROM golang:1.24-trixie AS hab-builder
# Build Go binary from source

# Stage 2: Main add-on image
FROM $BUILD_FROM
# Install node, npm, zigporter
# Copy MCP server, LSP server, hab binary
# Setup s6-overlay services
```

Build arguments:
- `BUILD_FROM`: Base Home Assistant image (default: `ghcr.io/home-assistant/amd64-base-debian:trixie`)
- `BUILD_ARCH`: Target architecture (amd64, aarch64)
- `BUILD_VERSION`: Release version string

### hab CLI Layer
The hab CLI is built from pinned Go source during Docker build:
- Repository: `github.com/janchadli/hab`
- Built in `hab-builder` stage
- Cross-compiled for target architecture
- Installed at `/usr/local/bin/hab`

### Repository Structure

```
opencode/
├── ha_opencode/              # Stable channel
│   ├── Dockerfile            # Multi-stage build
│   ├── config.yaml           # Add-on configuration
│   ├── CHANGELOG.md          # Version history
│   ├── DOCS.md               # Documentation
│   ├── rootfs/               # Root filesystem
│   │   ├── etc/
│   │   │   └── s6-overlay/
│   │   │       └── s6-rc.d/
│   │   │           ├── init-opencode/run
│   │   │           └── ha-opencode/run
│   │   └── opt/
│   │       ├── ha-mcp-server/
│   │       └── ha-lsp-server/
│   └── zigporter/
├── ha_opencode_beta/         # Beta channel
│   └── (same structure as stable)
├── scripts/
│   ├── setup-git-hooks.sh
│   └── update-version-shield.sh
├── hooks/                    # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── .github/workflows/        # CI/CD workflows
├── CONTRIBUTING.md           # Developer guide
├── ARCHITECTURE.md           # This file
├── RELEASES.md               # Channel documentation
└── README.md                 # Main documentation
```

### Runtime Behavior

#### Startup Sequence
1. Home Assistant supervisor starts the addon container
2. s6-overlay runs `init-opencode` (one-shot setup)
3. s6-overlay runs `ha-opencode` (long-running server)
4. MCP server starts on port 8000
5. LSP server starts on port 8001
6. Servers connect to Home Assistant WebSocket API

#### Environment Variables
- `SUPERVISOR_TOKEN`: Home Assistant Supervisor API token
- `HA_ACCESS_TOKEN`: Home Assistant API access token
- `BUILD_VERSION`: Current addon version
- `BUILD_ARCH`: Target architecture

#### Service Dependencies
1. MCP server depends on:
   - Home Assistant WebSocket availability
   - Supervisor API token
2. LSP server depends on:
   - Home Assistant WebSocket availability
   - HA access token

#### Monitoring & Health
- s6-overlay monitors both services
- Automatic restart on failure
- Log output to supervisor console

### Test Coverage Gaps

| Area | Status | Gap |
|------|--------|-----|
| MCP Server Tools | ⚠️ Partial | Validation tests exist, tool handlers need tests |
| LSP Server Completions | ⚠️ Partial | Completion tests needed |
| s6-overlay Init | ❌ Missing | No unit tests for init-opencode |
| Docker Build | ❌ Missing | No Docker smoke tests |
| Integration | ❌ Missing | No end-to-end tests |
| Beta Channel | ❌ Missing | No beta-specific tests |

### Security Model
- All MCP/LSP communication uses WebSocket with token authentication
- MCP server validates all input schemas
- LSP server validates YAML before completion
- Docker build runs as non-root user

### Configuration Management

Each channel has independent configuration:
```yaml
# ha_opencode/config.yaml
name: "OpenCode MCP Server"
version: "1.8.1"
slug: "opencode"
description: "MCP & LSP Server for Home Assistant"
arch:
  - amd64
  - aarch64

# ha_opencode_beta/config.yaml
name: "OpenCode MCP Server (Beta)"
version: "1.7.3b1"
slug: "opencode_beta"
description: "MCP & LSP Server for Home Assistant (Beta)"
arch:
  - amd64
  - aarch64
```

### Version Management
- Stable channel follows semantic versioning (1.8.1)
- Beta channel uses beta suffix (1.7.3b1)
- Channels share same Docker build pattern
- Version bumps use `scripts/update-version-shield.sh`

### Channel Differences

| Feature | Stable | Beta |
|---------|--------|------|
| Base Image | Shared (Debian Trixie) | Shared (Debian Trixie) |
| hab CLI | Built from source | Built from source |
| OpenCode Binary | npm package versioned | npm package versioned |
| Zigbee2MQTT | `z2m_url: str?` | `z2m_url: str?` (fixed) |
| MCP Features | Production set | Production set |
| LSP Features | Production set | Production set |
| Support Priority | Primary | Secondary |
