# Contributing to OpenCode MCP/LSP Server

Thank you for contributing to the OpenCode MCP/LSP Server project!

## 📋 Repository Overview

This repository contains two channels:

### Stable Channel (`ha_opencode`)
- **Version Scheme**: Semantic versioning (e.g., `1.8.1`)
- **Release Cadence**: Quarterly major/minor releases with regular patch updates
- **Dockerfile**: Multi-stage build from `ghcr.io/home-assistant/amd64-base-debian:trixie`
- **Purpose**: Production-grade features with full testing
- **Support**: Primary support channel for bug reports and feature requests

### Beta Channel (`ha_opencode_beta`)
- **Version Scheme**: Semantic versioning with beta suffix (e.g., `1.7.3b1`)
- **Release Cadence**: Bi-weekly releases tracking development branch
- **Dockerfile**: Same multi-stage build pattern as stable
- **Purpose**: Experimental features, early access to new capabilities
- **Support**: Beta testing feedback channel

Both channels can be installed simultaneously in the same Home Assistant instance.

## 🛠 Development Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Home Assistant Supervisor (for local testing)

### Local Testing

#### MCP Server
```bash
cd ha_opencode/rootfs/opt/ha-mcp-server
npm install && npm test
```

#### LSP Server
```bash
cd ha_opencode/rootfs/opt/ha-lsp-server
npm install && npm test
```

#### Docker Build (Local Testing)
```bash
cd ha_opencode
docker build \
  --build-arg BUILD_VERSION=local \
  --build-arg BUILD_ARCH=amd64 \
  -t ha-opencode:local \
  .
```

## 📚 MCP Server Development

### Development Guide

The MCP server is located at `ha_opencode/rootfs/opt/ha-mcp-server/`.

### Tool Catalog Structure

The MCP server uses a tool catalog pattern following the [MCP specification](https://modelcontextprotocol.io/):

```javascript
// ha_opencode/rootfs/opt/ha-mcp-server/index.js
{
  tools: [
    {
      name: 'get_states',
      description: '...',
      inputSchema: {
        type: 'object',
        properties: {
          entity_id: { type: 'string' }
        }
      }
    }
  ]
}
```

### Supported Tools

- `get_states` - Fetch Home Assistant entity states
- `get_entities` - List available entities
- `get_available_domains` - List entity domains
- `get_calendar` - Fetch calendar events
- `get_events` - Fetch event history
- `get_history` - Fetch entity history
- `get_logbook` - Fetch logbook entries
- `get_config` - Fetch system config
- `get_templates` - Fetch template configs
- `get_services` - List available services
- `get_services_info` - Get service details
- `get_hass_config` - Fetch Home Assistant config
- `get_calendar_events` - Fetch calendar events
- `get_calendar` - Fetch calendar info
- `call_service` - Call Home Assistant services
- `call_service_info` - Get service details
- `get_error_log` - Fetch error logs
- `get_updates` - Get update info

### Resource Handlers

The MCP server also supports resource handlers for configuration:

```javascript
{
  resources: [
    {
      uri: 'hass://config',
      name: 'Home Assistant Configuration',
      description: '...',
      mimeType: 'application/json'
    }
  ]
}
```

### Prompt Handlers

Support for custom MCP prompts:

```javascript
{
  prompts: [
    {
      name: 'light_control',
      description: '...',
      arguments: [
        { name: 'entity_id', description: '...', required: true }
      ]
    }
  ]
}
```

### Mocking for Testing

For local testing without Home Assistant, mock the Supervisor API:

```javascript
// test/index.test.js
vi.spyOn(global, "fetch").mockImplementation((url) => {
  if (url.includes("/states")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      text: () => Promise.resolve(JSON.stringify([
        { entity_id: "light.living_room", state: "on" }
      ])),
      json: () => Promise.resolve([...])
    });
  }
  return Promise.resolve({ ok: true, status: 200, ... });
});
```

## 📝 LSP Server Development

The LSP server is located at `ha_opencode/rootfs/opt/ha-lsp-server/`.

### Completion Providers

The LSP server uses completion providers for entity autocomplete:

```javascript
// ha_opencode/rootfs/opt/ha-lsp-server/lib/completions.js
const { get_entities } = require('./lib/entities');

module.exports = async function() {
  const entities = await get_entities();
  // Return completion items...
};
```

### YAML Analysis

The LSP server analyzes Home Assistant YAML configuration:

```javascript
// ha_opencode/rootfs/opt/ha-lsp-server/lib/yaml-analyzer.js
const analyzeYAML = require('./lib/yaml-analyzer');

// Parse and validate YAML...
```

## 🧪 Testing

### TDD Workflow

1. **Write/Update Test First**: Define expected behavior
2. **Run Focused Test**: `npm test -- --run path/to/test.js`
3. **Run Full Suite**: `npm test`
4. **Fix Implementation**: Make minimal changes
5. **Verify**: Ensure all tests pass

### Test Execution

#### MCP Server Tests
```bash
cd ha_opencode/rootfs/opt/ha-mcp-server
npm test
```

#### LSP Server Tests
```bash
cd ha_opencode/rootfs/opt/ha-lsp-server
npm test
```

## 🔄 Git Hooks Setup

### Installation

```bash
./scripts/setup-git-hooks.sh
```

This installs:
- `pre-commit` hook (runs tests before commit)
- `commit-msg` hook (validates commit message format)

### Pre-commit Hook

Runs tests before allowing commits:

```bash
#!/bin/bash
# hooks/pre-commit
cd ha_opencode/rootfs/opt/ha-mcp-server && npm test
cd ha_opencode/rootfs/opt/ha-lsp-server && npm test
```

### Commit Message Format

```
feat: add new MCP tool for calendar events
fix: resolve schema mismatch in beta channel
docs: update CONTRIBUTING.md with new examples
chore: bump version to 1.8.1
```

## 📊 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Assistant Addon                      │
├──────────────────────────────────────────────────────────────┤
│  ha_opencode (Stable)     │    ha_opencode_beta (Beta)     │
│  v1.8.1                  │    v1.7.3b1                     │
├──────────────────────────────────────────────────────────────┤
│  MCP Server              │    LSP Server                   │
│  ha-mcp-server/          │    ha-lsp-server/               │
│  tools/                  │    completions/                  │
│  resources/              │    yaml-analyzer/                │
│  prompts/                 │    prompt-handlers/             │
├──────────────────────────────────────────────────────────────┤
│  Docker Build (Multi-stage)                                 │
│  FROM ghcr.io/home-assistant/amd64-base-debian:trixie      │
│  FROM golang:1.24-trixie AS hab-builder                     │
│  FROM node:20-alpine AS npm-builder                         │
└─────────────────────────────────────────────────────────────┘
```

### File Ownership Map

| Directory | Purpose | Description |
|-----------|---------|-------------|
| `ha_opencode/` | Stable channel | Production release |
| `ha_opencode_beta/` | Beta channel | Experimental features |
| `ha_opencode/Dockerfile` | Docker build | Multi-stage build |
| `ha_opencode/config.yaml` | Config | Stable channel config |
| `ha_opencode/rootfs/opt/ha-mcp-server/` | MCP server | Tool handlers |
| `ha_opencode/rootfs/opt/ha-lsp-server/` | LSP server | LSP handlers |
| `hooks/` | Git hooks | Pre-commit, commit-msg |
| `.github/workflows/` | CI workflows | GitHub Actions |
| `scripts/` | Scripts | Utility scripts |

### Runtime Behavior

1. **Startup Flow**:
   - `init-opencode` (oneshot) → Configures s6 services
   - `ha-opencode` (longrun) → Runs MCP/LSP servers

2. **Service Dependencies**:
   - `init-opencode` → Sets up environment
   - `ha-opencode` → MCP & LSP servers
   - Both channels can run simultaneously

3. **Test Coverage Gaps**:
   - MCP Server: Basic validation tests created
   - LSP Server: Basic validation tests created
   - Init script: Unit tests needed
   - Integration tests: End-to-end testing needed

## 📖 Documentation

- [README.md](./README.md) - Main project documentation
- [RELEASES.md](./RELEASES.md) - Channel differences and version history
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design
- [ha_opencode/DOCS.md](./ha_opencode/DOCS.md) - Stable channel docs
- [ha_opencode_beta/DOCS.md](./ha_opencode_beta/DOCS.md) - Beta channel docs
- [ha_opencode/CHANGELOG.md](./ha_opencode/CHANGELOG.md) - Change history

## 📝 Code Style

- **Formatting**: Use `prettier` (configured in `.prettierrc`)
- **Linting**: Use `eslint` (configured in `.eslintrc`)
- **TypeScript**: Strict typing, no `any` types
- **Testing**: Vitest with JSDoc comments

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/juanchula/domotica.git
   cd opencode-clone
   ```

2. **Install git hooks**:
   ```bash
   ./scripts/setup-git-hooks.sh
   ```

3. **Test locally**:
   ```bash
   cd ha_opencode/rootfs/opt/ha-mcp-server
   npm install && npm test
   ```

4. **Build Docker image**:
   ```bash
   cd ha_opencode
   docker build --build-arg BUILD_VERSION=local \
     --build-arg BUILD_ARCH=amd64 \
     -t ha-opencode:local \
     .
   ```

5. **Contribute**:
   - Fork the repository
   - Create a feature branch
   - Test your changes
   - Submit a pull request

## 🤝 Contributing Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on technical details, not personal attributes

### Reporting Issues

- Use the GitHub issue tracker
- Include steps to reproduce
- Include error logs if applicable
- Mention which channel (stable/beta) you're using

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests locally
4. Update documentation if needed
5. Submit a pull request
6. Address feedback from maintainers

## 📚 References

- [MCP Specification](https://modelcontextprotocol.io/)
- [Home Assistant Documentation](https://www.home-assistant.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Documentation](https://nodejs.org/)

## 📧 Contact

- **GitHub Issues**: [OpenCode MCP/LSP Server](https://github.com/juanchula/domotica/issues)
- **GitHub Discussions**: [OpenCode MCP/LSP Server](https://github.com/juanchula/domotica/discussions)

---

## 📝 License

This project is licensed under the UNLICENSE license - see [UNLICENSE](./UNLICENSE) file.
