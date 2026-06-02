/**
 * MCP Tool Definitions
 * Extracted from index.js for modularity.
 */

import { SCHEMAS } from "../lib/schemas.js";

export const TOOLS = [
  // === STATE MANAGEMENT ===
  {
    name: "get_states",
    title: "Get Entity States",
    description: "Get the current state of entities. Can return all entities, filter by domain, or get a specific entity. Returns entity_id, state, and key attributes.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: {
          type: "string",
          description: "Specific entity ID (e.g., 'light.living_room'). If not provided, returns all/filtered entities.",
        },
        domain: {
          type: "string",
          description: "Filter by domain (e.g., 'light', 'switch', 'sensor', 'automation')",
        },
        summarize: {
          type: "boolean",
          description: "If true, returns a human-readable summary instead of raw data",
        },
      },
    },
    outputSchema: SCHEMAS.entityStateArray,
    annotations: {
      readOnly: true,
      idempotent: true,
      openWorld: false,
    },
  },
  {
    name: "search_entities",
    title: "Search Entities",
    description: "Search for entities by name, type, or description. Uses semantic matching to find relevant entities.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'bedroom lights', 'temperature sensors', 'front door')",
        },
      },
      required: ["query"],
    },
    outputSchema: SCHEMAS.searchResult,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_entity_details",
    title: "Get Entity Details",
    description: "Get detailed information about an entity including its relationships to devices, areas, and related entities.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: {
          type: "string",
          description: "The entity ID to get details for",
        },
      },
      required: ["entity_id"],
    },
    outputSchema: SCHEMAS.entityDetails,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === SERVICE CALLS ===
  {
    name: "call_service",
    title: "Call Home Assistant Service",
    description: "Call a Home Assistant service to control devices or trigger actions. Use for turning on/off lights, running scripts, triggering automations, etc. THIS MODIFIES DEVICE STATE.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Service domain (e.g., 'light', 'switch', 'automation', 'script', 'climate')",
        },
        service: {
          type: "string",
          description: "Service name (e.g., 'turn_on', 'turn_off', 'toggle', 'trigger', 'set_temperature')",
        },
        target: {
          type: "object",
          description: "Target for the service call",
          properties: {
            entity_id: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
              ],
              description: "Entity ID(s) to target"
            },
            area_id: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
              ],
              description: "Area ID(s) to target"
            },
            device_id: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
              ],
              description: "Device ID(s) to target"
            },
          },
        },
        data: {
          type: "object",
          description: "Additional service data (e.g., brightness: 255, color_temp: 400, temperature: 72)",
        },
      },
      required: ["domain", "service"],
    },
    outputSchema: SCHEMAS.serviceCallResult,
    annotations: {
      destructive: true,
      idempotent: false,
      requiresConfirmation: true,
    },
  },
  {
    name: "get_services",
    title: "List Available Services",
    description: "List available services, optionally filtered by domain. Shows what actions can be performed.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Filter services by domain (e.g., 'light', 'climate')",
        },
      },
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === HISTORY & LOGBOOK ===
  {
    name: "get_history",
    title: "Get Entity History",
    description: "Get historical state data for entities. Essential for analyzing trends, debugging issues, or understanding patterns.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: {
          type: "string",
          description: "Entity ID to get history for (required)",
        },
        start_time: {
          type: "string",
          description: "Start time in ISO format (e.g., '2024-01-15T00:00:00'). Defaults to 24 hours ago.",
        },
        end_time: {
          type: "string",
          description: "End time in ISO format. Defaults to now.",
        },
        minimal: {
          type: "boolean",
          description: "If true, returns minimal response (faster, less data)",
        },
      },
      required: ["entity_id"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_logbook",
    title: "Get Activity Logbook",
    description: "Get logbook entries showing what happened in Home Assistant. Useful for understanding recent activity and debugging.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: { type: "string", description: "Filter by specific entity" },
        start_time: { type: "string", description: "Start time in ISO format. Defaults to 24 hours ago." },
        end_time: { type: "string", description: "End time in ISO format. Defaults to now." },
      },
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === CONFIGURATION ===
  {
    name: "get_config",
    title: "Get Home Assistant Configuration",
    description: "Get Home Assistant configuration including location, units, version, and loaded components.",
    inputSchema: { type: "object", properties: {} },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_areas",
    title: "List All Areas",
    description: "List all areas defined in Home Assistant with their IDs and names.",
    inputSchema: { type: "object", properties: {} },
    outputSchema: SCHEMAS.areaArray,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_devices",
    title: "List Devices",
    description: "List devices registered in Home Assistant, optionally filtered by area.",
    inputSchema: {
      type: "object",
      properties: {
        area_id: { type: "string", description: "Filter devices by area ID" },
      },
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "validate_config",
    title: "Validate Configuration",
    description: "Validate Home Assistant configuration files. Run this before restarting to catch errors.",
    inputSchema: { type: "object", properties: {} },
    outputSchema: SCHEMAS.configValidation,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_error_log",
    title: "Get Error Log",
    description: "Get the Home Assistant error log. Useful for debugging issues.",
    inputSchema: {
      type: "object",
      properties: {
        lines: { type: "number", description: "Number of lines to return (default: 100)" },
      },
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === EVENTS & TEMPLATES ===
  {
    name: "fire_event",
    title: "Fire Custom Event",
    description: "Fire a custom event in Home Assistant. Can be used to trigger automations or communicate between systems.",
    inputSchema: {
      type: "object",
      properties: {
        event_type: { type: "string", description: "Event type to fire (e.g., 'custom_event', 'my_notification')" },
        event_data: { type: "object", description: "Optional data to include with the event" },
      },
      required: ["event_type"],
    },
    annotations: {
      destructive: true,
      idempotent: false,
    },
  },
  {
    name: "render_template",
    title: "Render Jinja2 Template",
    description: "Render a Jinja2 template using Home Assistant's template engine. Powerful for complex data extraction and formatting.",
    inputSchema: {
      type: "object",
      properties: {
        template: { type: "string", description: "Jinja2 template (e.g., '{{ states(\"sensor.temperature\") }}', '{{ now() }}')" },
      },
      required: ["template"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === CALENDARS ===
  {
    name: "get_calendars",
    title: "List Calendars",
    description: "List all calendar entities in Home Assistant.",
    inputSchema: { type: "object", properties: {} },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_calendar_events",
    title: "Get Calendar Events",
    description: "Get events from a specific calendar within a time range.",
    inputSchema: {
      type: "object",
      properties: {
        calendar_entity: { type: "string", description: "Calendar entity ID (e.g., 'calendar.family')" },
        start: { type: "string", description: "Start time in ISO format" },
        end: { type: "string", description: "End time in ISO format" },
      },
      required: ["calendar_entity"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === INTELLIGENCE ===
  {
    name: "detect_anomalies",
    title: "Detect Anomalies",
    description: "Scan all entities for potential anomalies like low batteries, unusual sensor readings, or devices in unexpected states.",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Limit scan to specific domain" },
      },
    },
    outputSchema: SCHEMAS.anomalyArray,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_suggestions",
    title: "Get Automation Suggestions",
    description: "Get intelligent automation and optimization suggestions based on your current Home Assistant setup.",
    inputSchema: { type: "object", properties: {} },
    outputSchema: SCHEMAS.suggestionArray,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "diagnose_entity",
    title: "Diagnose Entity",
    description: "Run diagnostics on an entity to help troubleshoot issues. Checks state history, related entities, and common problems.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: { type: "string", description: "Entity to diagnose" },
      },
      required: ["entity_id"],
    },
    outputSchema: SCHEMAS.diagnostics,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === DOCUMENTATION ===
  {
    name: "get_integration_docs",
    title: "Get Integration Documentation",
    description: "Fetch current documentation for a Home Assistant integration. Use this BEFORE writing configuration to ensure you use the latest syntax. Returns configuration examples, setup instructions, and deprecation notices.",
    inputSchema: {
      type: "object",
      properties: {
        integration: {
          type: "string",
          description: "Integration name (e.g., 'template', 'mqtt', 'rest', 'sensor', 'automation')",
        },
        section: {
          type: "string",
          enum: ["all", "configuration", "examples"],
          description: "Which section to focus on (default: 'configuration')",
        },
      },
      required: ["integration"],
    },
    outputSchema: SCHEMAS.integrationDocs,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_breaking_changes",
    title: "Get Breaking Changes",
    description: "Fetch recent breaking changes from Home Assistant release notes. Use this when troubleshooting configurations that stopped working after an update, or to check compatibility before suggesting configurations.",
    inputSchema: {
      type: "object",
      properties: {
        integration: {
          type: "string",
          description: "Filter by specific integration name (optional)",
        },
        version: {
          type: "string",
          description: "Get changes for a specific HA version (e.g., '2024.12'). Defaults to recent versions.",
        },
      },
    },
    outputSchema: SCHEMAS.breakingChanges,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "check_config_syntax",
    title: "Check Configuration Syntax",
    description: "Analyze YAML configuration for deprecated syntax patterns and suggest modern alternatives. Use this to validate configuration before presenting it to the user.",
    inputSchema: {
      type: "object",
      properties: {
        yaml_config: {
          type: "string",
          description: "The YAML configuration to check",
        },
        integration: {
          type: "string",
          description: "The integration this config is for (helps with specific checks)",
        },
      },
      required: ["yaml_config"],
    },
    outputSchema: SCHEMAS.configSyntaxCheck,
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "write_config_safe",
    title: "Safe Config Writer",
    description: "Write YAML configuration to a file with automatic validation and content protection. Checks for deprecations, validates Jinja2 templates through HA's engine, verifies structural correctness, and runs HA's full config check. If validation fails, the original file is restored and errors are returned for correction. IMPORTANT: This tool blocks writes that would accidentally reduce content — removing list entries, dropping top-level keys, or significantly shrinking the file. Always read the existing file first and include all existing content in your write. Use dry_run=true to validate without writing.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path relative to /homeassistant/ (e.g., 'configuration.yaml', 'automations.yaml', 'packages/lights.yaml')",
        },
        content: {
          type: "string",
          description: "The YAML content to write",
        },
        dry_run: {
          type: "boolean",
          description: "If true, validate without writing to disk (default: false). Use this to pre-check config before committing.",
        },
        validate_templates: {
          type: "boolean",
          description: "If true (default), extract and validate Jinja2 templates through HA's template engine.",
        },
        confirm_deletions: {
          type: "boolean",
          description: "If true, confirms that you intentionally want to reduce content in this file. Default: false. Without this flag, writes are blocked if they would: (1) reduce list entries in automations.yaml/scripts.yaml/scenes.yaml, (2) remove top-level keys from mapping files like configuration.yaml, or (3) reduce the file size by more than 50%. This prevents accidental data loss when the AI writes without reading the existing file first.",
        },
      },
      required: ["file_path", "content"],
    },
    annotations: {
      readOnly: false,
      idempotent: false,
      destructive: false,
    },
  },
  
  // === UPDATE MANAGEMENT ===
  {
    name: "get_available_updates",
    title: "Get Available Updates",
    description: "Check for available updates across Home Assistant Core, OS, Supervisor, and all installed apps. Returns version info and update status for each component.",
    inputSchema: {
      type: "object",
      properties: {
        component: {
          type: "string",
          enum: ["all", "core", "os", "supervisor", "addons"],
          description: "Which component to check (default: 'all')",
        },
      },
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_addon_changelog",
    title: "Get App Changelog",
    description: "Get the changelog for an installed app to see what changes are included in updates.",
    inputSchema: {
      type: "object",
      properties: {
        addon_slug: {
          type: "string",
          description: "The slug identifier of the app (e.g., 'core_configurator', 'a0d7b954_vscode')",
        },
      },
      required: ["addon_slug"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "update_component",
    title: "Update Component",
    description: "Initiate an update for a Home Assistant component (Core, OS, Supervisor) or an app. Returns a job_id for progress monitoring. NOTE: Cannot update OpenCode itself from within - use Home Assistant UI for self-updates.",
    inputSchema: {
      type: "object",
      properties: {
        component: {
          type: "string",
          enum: ["core", "os", "supervisor", "addon"],
          description: "Type of component to update",
        },
        addon_slug: {
          type: "string",
          description: "Required if component is 'addon' - the app's slug identifier",
        },
        backup: {
          type: "boolean",
          description: "Create a backup before updating (default: true for core/addons)",
        },
      },
      required: ["component"],
    },
    annotations: {
      readOnly: false,
      destructive: false,
      idempotent: false,
    },
  },
  {
    name: "get_update_progress",
    title: "Get Update Progress",
    description: "Monitor the progress of a running update job. Poll this endpoint to get real-time progress updates including percentage, current stage, and completion status.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: {
          type: "string",
          description: "The job UUID returned when initiating an update",
        },
      },
      required: ["job_id"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "get_running_jobs",
    title: "Get Running Jobs",
    description: "List all currently running or recently completed Supervisor jobs. Useful for monitoring ongoing operations like updates, backups, or restores.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  
  // === ESPHOME INTEGRATION ===
  {
    name: "esphome_list_devices",
    title: "List ESPHome Devices",
    description: "List all configured ESPHome devices with current and deployed firmware versions. Requires ESPHome add-on to be installed and running.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },
  {
    name: "esphome_compile",
    title: "Compile ESPHome Firmware",
    description: "Compile firmware for an ESPHome device. Returns the full build log including any errors. This may take 1-5 minutes depending on device complexity.",
    inputSchema: {
      type: "object",
      properties: {
        device: {
          type: "string",
          description: "Device name or configuration file name (e.g., 'living-room-sensor' or 'living-room-sensor.yaml')",
        },
      },
      required: ["device"],
    },
    annotations: {
      readOnly: false,
      idempotent: true,
    },
  },
  {
    name: "esphome_upload",
    title: "Upload ESPHome Firmware",
    description: "Upload compiled firmware to an ESPHome device via OTA (Over-The-Air) or USB. For OTA, the device must be online and reachable.",
    inputSchema: {
      type: "object",
      properties: {
        device: {
          type: "string",
          description: "Device name or configuration file name",
        },
        port: {
          type: "string",
          description: "Upload target - device IP/hostname for OTA (e.g., '192.168.1.100') or USB path (e.g., '/dev/ttyUSB0')",
        },
      },
      required: ["device", "port"],
    },
    annotations: {
      readOnly: false,
      idempotent: false,
    },
  },
  
  // === FIRMWARE UPDATE MONITORING ===
  {
    name: "watch_firmware_update",
    title: "Watch Firmware Update Progress",
    description: "Check firmware update status or start an update. Returns current state immediately (does not block). Call repeatedly to monitor progress. For ESPHome, WLED, Zigbee coordinators, and other device updates.",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: {
          type: "string",
          description: "The update entity to check (e.g., 'update.garage_sensor_firmware', 'update.wled_living_room_update')",
        },
        start_update: {
          type: "boolean",
          description: "If true, start the update. If false (default), just check current status.",
        },
      },
      required: ["entity_id"],
    },
    annotations: {
      readOnly: false,
      idempotent: false,
    },
  },
  {
    name: "hab_run",
    title: "Run hab CLI Command",
    description: "Run a Home Assistant Builder (hab) CLI command. hab is a comprehensive admin CLI that covers the full Home Assistant admin area via REST and WebSocket APIs. Use this for: dashboard CRUD (create views, sections, cards), area/floor/zone/label/person/category management, helper entity creation, automation/script/scene CRUD, backup/restore, blueprint management, calendar and todo list management, notification management, integration reload/enable/disable, repair issue management, event firing, template rendering, device management, and search. hab outputs human-readable text by default; add --json for structured JSON output. Examples: 'entity list --domain light --json', 'area create Kitchen', 'scene activate \"Movie Time\"', 'todo item add todo.shopping Milk', 'notification create --message \"Done\" --title \"Status\"', 'integration reload hue', 'repairs list --json', 'template render --expression \"{{ states(\\'sensor.temp\\') }}\"'. Run with just 'help' to see all available command groups.",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The hab command and arguments to run (without the 'hab' prefix). Examples: 'entity list --json', 'area create Kitchen', 'dashboard list', 'automation get my-automation', 'helper create input_boolean --name \"Guest Mode\"', 'scene list --json', 'todo item add todo.shopping \"Buy milk\"', 'notification list --json', 'integration reload hue', 'repairs list --json', 'person list --json', 'backup create', 'system info', 'overview --json'",
        },
      },
      required: ["command"],
    },
    annotations: {
      readOnly: false,
      idempotent: false,
    },
  },
  {
    name: "zigporter_run",
    title: "Run zigporter CLI Command",
    description:
      "Run a zigporter CLI command for Zigbee device management. " +
      "zigporter handles cascade entity/device renames (updating ALL references " +
      "in automations, scripts, scenes, and dashboards), device inspection across " +
      "ZHA and Z2M, stale device cleanup, and mesh visualization. Key commands: " +
      "'rename-entity old new --apply' (cascade rename), " +
      "'rename-device \"Old\" \"New\" --apply', " +
      "'inspect \"Device\" --json', 'list-devices --json', 'list-z2m --json', " +
      "'stale \"Device\" --action remove', 'fix-device \"Device\" --apply', " +
      "'network-map --format table', 'check'. " +
      "Always dry-run renames first (omit --apply).",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description:
            "The zigporter command and arguments to run (without the 'zigporter' prefix). " +
            "Examples: 'list-devices --json', 'inspect \"Kitchen\" --json', " +
            "'rename-entity light.old light.new', " +
            "'rename-entity light.old light.new --apply', " +
            "'stale \"Device\" --action remove'",
        },
      },
      required: ["command"],
    },
    annotations: {
      readOnly: false,
      idempotent: false,
    },
  },
  {
    name: "screenshot_url",
    title: "Screenshot Home Assistant Page",
    description: "Take a screenshot of any Home Assistant page for visual verification. Use this after making dashboard changes, creating views or cards via hab, or any time you need to visually verify a result. Returns a PNG image that vision-capable AI models can analyze. Requires the 'screenshot_enabled' option and a Long-Lived Access Token. Examples: '/lovelace/0' (default dashboard), '/energy' (energy panel), '/config/dashboard' (settings), '/dashboard-custom/my-view' (custom dashboard).",
    inputSchema: {
      type: "object",
      properties: {
        url_path: {
          type: "string",
          description: "The HA page path to screenshot (e.g., '/lovelace/0', '/energy', '/config/dashboard', '/dashboard-name/view-index')",
        },
        width: {
          type: "number",
          description: "Viewport width in pixels (default: 1280)",
        },
        height: {
          type: "number",
          description: "Viewport height in pixels (default: 720)",
        },
        wait_seconds: {
          type: "number",
          description: "Seconds to wait after page load for dynamic content to render (default: 3, max: 15)",
        },
        full_page: {
          type: "boolean",
          description: "Capture full scrollable page instead of just viewport (default: false)",
        },
      },
      required: ["url_path"],
    },
    annotations: {
      readOnly: true,
      idempotent: true,
    },
  },

// ============================================================================
// MOBILE AND CLIENT-SIDE TOOLS
// ============================================================================

// --- Mobile Detection and Info ---
{
  name: "is_mobile_client",
  title: "Check Mobile Client",
  description: "Detect if the MCP client is running on a mobile device. Returns true for Android, iOS, and other mobile platforms.",
  annotations: {
    title: "is_mobile_client",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    const userAgent = process.env.MCP_USER_AGENT || "desktop";
    const { isMobileClient } = await import("../lib/mobile-features.js");
    const isMobile = isMobileClient(userAgent);
    return {
      is_mobile: isMobile,
      user_agent: userAgent,
      platform: isMobile ? "mobile" : "desktop",
    };
  },
},
{
  name: "get_device_info",
  title: "Get Device Information",
  description: "Retrieve detailed information about the current device and environment, including platform, architecture, and Home Assistant version.",
  annotations: {
    title: "get_device_info",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    const { getDeviceInfo } = await import("../lib/device-info.js");
    const info = getDeviceInfo();
    return {
      platform: info.platform,
      architecture: info.arch,
      "node_version": info.nodeVersion,
      "home_assistant_version": info.homeAssistantVersion,
      "supervisor_version": info.supervisorVersion,
      "addon_version": info.addonVersion,
      "uptime_seconds": Math.floor(info.uptime),
    };
  },
},
{
  name: "get_ha_dashboard_url",
  title: "Get Home Assistant Dashboard URL",
  description: "Retrieve the current Home Assistant dashboard URL. Useful for mobile clients to quickly access the dashboard from the MCP server.",
  annotations: {
    title: "get_ha_dashboard_url",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      include_port: {
        type: "boolean",
        description: "Include port number in URL (default: false)",
        default: false,
      },
    },
    required: [],
  },
  execute: async (request) => {
    const { include_port = false } = request.params;
    const internalUrl = process.env.HOME_ASSISTANT_URL || "http://homeassistant:8123";
    
    let url = internalUrl;
    if (!include_port) {
      url = url.replace(/:\d+$/, "");
    }
    
    return {
      dashboard_url: url,
      internal_url: internalUrl,
    };
  },
},
{
  name: "copy_to_clipboard",
  title: "Copy Text to Clipboard",
  description: "Copy text to the clipboard for mobile and desktop clients. Use this to quickly copy entity IDs, automation names, or other text to use in Home Assistant.",
  annotations: {
    title: "copy_to_clipboard",
    idempotent: false,
  },
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "Text to copy to clipboard",
      },
    },
    required: ["text"],
  },
  execute: async (request) => {
    const { text } = request.params;
    
    if (!text || text.length === 0) {
      throw new Error("Text parameter is required");
    }
    
    const { copyToClipboard } = await import("../lib/clipboard.js");
    const result = copyToClipboard(text);
    return result;
  },
},
{
  name: "mcp_info",
  title: "Get MCP Server Information",
  description: "Retrieve information about the MCP server itself, including version, features, and capabilities. Useful for debugging and integration verification.",
  annotations: {
    title: "mcp_info",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    return {
      name: "ha-mcp-server",
      version: process.env.OPENCODE_VERSION || "unknown",
      platform: process.platform,
      "node_version": process.version,
      "mcp_features": ["tools", "resources", "prompts", "intelligence"],
      "tools_count": TOOLS.length,
      "resources_count": RESOURCES.length,
      "prompts_count": PROMPTS.length,
    };
  },
},

// ============================================================================
// HACS (HOME ASSISTANT COMMUNITY STORE) TOOLS
{
  name: "edit_opencode_config",
  title: "Edit OpenCode Config",
  description: "Safely edit the OpenCode addon config.yaml. Use this to change settings like terminal theme, font size, screenshot enabled, access token, or add environment variables. Automatically creates backups before changes.",
  annotations: {
    title: "edit_opencode_config",
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "Action to perform: set_value, add_env_var",
        enum: ["set_value", "add_env_var", "read"],
      },
      key: {
        type: "string",
        description: "Config key to modify (for set_value)",
      },
      value: {
        type: "string",
        description: "New value for the key (for set_value)",
      },
      env_name: {
        type: "string",
        description: "Environment variable name (for add_env_var)",
      },
      env_value: {
        type: "string",
        description: "Environment variable value (for add_env_var)",
      },
    },
    required: ["action"],
  },
  execute: async (request) => {
    const { action, key, value, env_name, env_value } = request.params;
    const { readConfig, editConfigValue, addEnvVar } = await import("../lib/config-editor.js");

    switch (action) {
      case "read":
        const config = readConfig();
        return {
          success: true,
          action: "read",
          path: config.path,
          content: config.content,
          message: "Config file read successfully. Show this to the user for approval before editing.",
        };
      case "set_value":
        if (!key) throw new Error("key is required for set_value");
        if (value === undefined) throw new Error("value is required for set_value");
        const setResult = editConfigValue(key, value);
        return {
          success: true,
          action: "set_value",
          key,
          new_value: setResult.new_value,
          old_value: setResult.old_value,
          backup: setResult.backup_path,
          preview: setResult.preview,
          message: `Set ${key} to ${value}. Backup saved. Restart addon to apply.`,
        };
      case "add_env_var":
        if (!env_name) throw new Error("env_name is required for add_env_var");
        if (!env_value) throw new Error("env_value is required for add_env_var");
        const envResult = addEnvVar(env_name, env_value);
        return {
          success: true,
          action: "add_env_var",
          name: env_name,
          backup: envResult.backup_path,
          preview: envResult.preview,
          message: `Added env var ${env_name}. Backup saved. Restart addon to apply.`,
        };
      default:
        throw new Error(`Unknown action: ${action}. Valid: set_value, add_env_var, read`);
    }
  },
  },
{
  name: "hacs_status",
  title: "HACS Status",
  description: "Get HACS (Home Assistant Community Store) status, installed version, and list installed repositories.",
  annotations: {
    title: "hacs_status",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      include_repos: {
        type: "boolean",
        description: "Include list of installed repositories",
        default: false,
      },
    },
    required: [],
  },
  execute: async (request) => {
    const { include_repos = false } = request.params;
    const { getHacsStatus } = await import("../lib/hacs-integration.js");
    return await getHacsStatus({ includeRepos: include_repos });
  },
},
{
  name: "hacs_install_component",
  title: "Install HACS Component",
  description: "Install a custom component or integration from HACS (Home Assistant Community Store) by GitHub repository.",
  annotations: {
    title: "hacs_install_component",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description: "GitHub repository (e.g., 'author/repo')",
      },
      category: {
        type: "string",
        description: "Component category: integration, theme, plugin, netdaemon, appdaemon, python_script, template",
        default: "integration",
      },
    },
    required: ["repository"],
  },
  execute: async (request) => {
    const { repository, category = "integration" } = request.params;
    const { installHacsComponent } = await import("../lib/hacs-integration.js");
    return await installHacsComponent(repository, category);
  },
},
{
  name: "hacs_update_component",
  title: "Update HACS Component",
  description: "Update an installed HACS component to its latest available version.",
  annotations: {
    title: "hacs_update_component",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description: "GitHub repository to update (e.g., 'author/repo')",
      },
    },
    required: ["repository"],
  },
  execute: async (request) => {
    const { repository } = request.params;
    const { updateHacsComponent } = await import("../lib/hacs-integration.js");
    return await updateHacsComponent(repository);
  },
},
{
  name: "hacs_remove_component",
  title: "Remove HACS Component",
  description: "Remove/delete an installed HACS component from Home Assistant.",
  annotations: {
    title: "hacs_remove_component",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description: "GitHub repository to remove (e.g., 'author/repo')",
      },
    },
    required: ["repository"],
  },
  execute: async (request) => {
    const { repository } = request.params;
    const { removeHacsComponent } = await import("../lib/hacs-integration.js");
    return await removeHacsComponent(repository);
  },
},
{
  name: "hacs_search",
  title: "Search HACS Repositories",
  description: "Search for custom components, themes, and plugins available in HACS.",
  annotations: {
    title: "hacs_search",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search term to find repositories",
      },
      category: {
        type: "string",
        description: "Optional: Filter by category (integration, theme, plugin, etc.)",
      },
    },
    required: ["query"],
  },
  execute: async (request) => {
    const { query, category } = request.params;
    const { searchHacsRepositories } = await import("../lib/hacs-integration.js");
    return await searchHacsRepositories(query, category);
  },
},
{
  name: "hacs_list_installed",
  title: "List Installed HACS Components",
  description: "List all currently installed HACS components with their versions and update status.",
  annotations: {
    title: "hacs_list_installed",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { listInstalledHacsComponents } = await import("../lib/hacs-integration.js");
    return await listInstalledHacsComponents();
  },
},
{
  name: "hacs_outdated",
  title: "Check Outdated HACS Components",
  description: "Check which installed HACS components have updates available.",
  annotations: {
    title: "hacs_outdated",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { getHacsOutdatedCount } = await import("../lib/hacs-integration.js");
    return await getHacsOutdatedCount();
  },
},

// ============================================================================
// GRAFANA TOOLS
// ============================================================================

{
  name: "grafana_status",
  title: "Grafana Status",
  description: "Check if Grafana add-on is installed and get its connection details.",
  annotations: {
    title: "grafana_status",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { discoverGrafana } = await import("../lib/grafana-integration.js");
    return await discoverGrafana();
  },
},
{
  name: "grafana_query",
  title: "Query Grafana",
  description: "Execute a PromQL or InfluxQL query against Grafana to retrieve metrics and time-series data.",
  annotations: {
    title: "grafana_query",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      datasource: {
        type: "string",
        description: "Grafana datasource name (e.g., 'Prometheus', 'InfluxDB')",
      },
      query: {
        type: "string",
        description: "PromQL or InfluxQL query",
      },
      from: {
        type: "string",
        description: "Time range start (e.g., 'now-1h', '2024-01-01T00:00:00Z')",
        default: "now-1h",
      },
      to: {
        type: "string",
        description: "Time range end (e.g., 'now')",
        default: "now",
      },
    },
    required: ["datasource", "query"],
  },
  execute: async (request) => {
    const { datasource, query, from = "now-1h", to = "now" } = request.params;
    const { queryGrafana } = await import("../lib/grafana-integration.js");
    return await queryGrafana(datasource, query, { from, to });
  },
},
{
  name: "grafana_list_dashboards",
  title: "List Grafana Dashboards",
  description: "List all available Grafana dashboards.",
  annotations: {
    title: "grafana_list_dashboards",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { getGrafanaDashboards } = await import("../lib/grafana-integration.js");
    return await getGrafanaDashboards();
  },
},
{
  name: "grafana_get_dashboard",
  title: "Get Grafana Dashboard",
  description: "Get detailed information about a specific Grafana dashboard, including its panels and queries.",
  annotations: {
    title: "grafana_get_dashboard",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      uid: {
        type: "string",
        description: "Dashboard UID (unique identifier)",
      },
    },
    required: ["uid"],
  },
  execute: async (request) => {
    const { uid } = request.params;
    const { getGrafanaDashboard } = await import("../lib/grafana-integration.js");
    return await getGrafanaDashboard(uid);
  },
},

// ============================================================================
// NODE-RED TOOLS
// ============================================================================

{
  name: "nodered_status",
  title: "Node-RED Status",
  description: "Check if Node-RED add-on is installed and get its health status.",
  annotations: {
    title: "nodered_status",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { getNodeRedStatus } = await import("../lib/nodered-integration.js");
    return await getNodeRedStatus();
  },
},
{
  name: "nodered_list_flows",
  title: "List Node-RED Flows",
  description: "List all flows and nodes in the Node-RED instance.",
  annotations: {
    title: "nodered_list_flows",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { listNodeRedFlows } = await import("../lib/nodered-integration.js");
    return await listNodeRedFlows();
  },
},
{
  name: "nodered_get_nodes",
  title: "Get Node-RED Nodes",
  description: "List all installed Node-RED palette nodes with their versions.",
  annotations: {
    title: "nodered_get_nodes",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { getNodeRedNodes } = await import("../lib/nodered-integration.js");
    return await getNodeRedNodes();
  },
},
{
  name: "nodered_deploy_flows",
  title: "Deploy Node-RED Flows",
  description: "Deploy a Node-RED flow JSON to the instance. CAUTION: This overwrites existing flows.",
  annotations: {
    title: "nodered_deploy_flows",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      flows: {
        type: "array",
        description: "Array of Node-RED flow objects to deploy",
        items: {
          type: "object",
          description: "Node-RED flow node object",
        },
      },
    },
    required: ["flows"],
  },
  execute: async (request) => {
    const { flows } = request.params;
    const { deployNodeRedFlows } = await import("../lib/nodered-integration.js");
    return await deployNodeRedFlows(flows);
  },
},

// ============================================================================
// INFLUXDB TOOLS
// ============================================================================

{
  name: "influxdb_status",
  title: "InfluxDB Status",
  description: "Check if InfluxDB add-on is installed and get its health status.",
  annotations: {
    title: "influxdb_status",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { getInfluxDBHealth } = await import("../lib/influxdb-integration.js");
    return await getInfluxDBHealth();
  },
},
{
  name: "influxdb_query",
  title: "Query InfluxDB",
  description: "Execute a Flux query against InfluxDB to retrieve time-series data.",
  annotations: {
    title: "influxdb_query",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Flux query string",
      },
      organization: {
        type: "string",
        description: "InfluxDB organization (default: homeassistant)",
        default: "homeassistant",
      },
      bucket: {
        type: "string",
        description: "InfluxDB bucket (default: homeassistant)",
        default: "homeassistant",
      },
    },
    required: ["query"],
  },
  execute: async (request) => {
    const { query, organization = "homeassistant", bucket = "homeassistant" } = request.params;
    const { queryInfluxDB } = await import("../lib/influxdb-integration.js");
    return await queryInfluxDB(query, { organization, bucket });
  },
},
{
  name: "influxdb_list_buckets",
  title: "List InfluxDB Buckets",
  description: "List all InfluxDB buckets/databases available.",
  annotations: {
    title: "influxdb_list_buckets",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { listInfluxDBBuckets } = await import("../lib/influxdb-integration.js");
    return await listInfluxDBBuckets();
  },
},
{
  name: "influxdb_query_entity",
  title: "Query Entity History from InfluxDB",
  description: "Query Home Assistant entity history data directly from InfluxDB.",
  annotations: {
    title: "influxdb_query_entity",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      entity_id: {
        type: "string",
        description: "Entity ID to query (e.g., 'sensor.temperature')",
      },
      from: {
        type: "string",
        description: "Time range start (e.g., '-1h', '-7d')",
        default: "-1h",
      },
      to: {
        type: "string",
        description: "Time range end (default: now)",
        default: "now()",
      },
    },
    required: ["entity_id"],
  },
  execute: async (request) => {
    const { entity_id, from = "-1h", to = "now()" } = request.params;
    const { queryEntityHistory } = await import("../lib/influxdb-integration.js");
    return await queryEntityHistory(entity_id, "homeassistant", { from, to });
  },
},

// ============================================================================
// ADD-ON MANAGER TOOLS
// ============================================================================

{
  name: "addon_list",
  title: "List Installed Add-ons",
  description: "List all installed Home Assistant add-ons with their status and versions.",
  annotations: {
    title: "addon_list",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const { listInstalledAddons } = await import("../lib/addon-manager.js");
    return await listInstalledAddons();
  },
},
{
  name: "addon_info",
  title: "Get Add-on Info",
  description: "Get detailed information about a specific Home Assistant add-on.",
  annotations: {
    title: "addon_info",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug (identifier)",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { getAddonInfo } = await import("../lib/addon-manager.js");
    return await getAddonInfo(slug);
  },
},
{
  name: "addon_start",
  title: "Start Add-on",
  description: "Start a Home Assistant add-on.",
  annotations: {
    title: "addon_start",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to start",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { startAddon } = await import("../lib/addon-manager.js");
    return await startAddon(slug);
  },
},
{
  name: "addon_stop",
  title: "Stop Add-on",
  description: "Stop a running Home Assistant add-on.",
  annotations: {
    title: "addon_stop",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to stop",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { stopAddon } = await import("../lib/addon-manager.js");
    return await stopAddon(slug);
  },
},
{
  name: "addon_restart",
  title: "Restart Add-on",
  description: "Restart a Home Assistant add-on.",
  annotations: {
    title: "addon_restart",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to restart",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { restartAddon } = await import("../lib/addon-manager.js");
    return await restartAddon(slug);
  },
},
{
  name: "addon_update",
  title: "Update Add-on",
  description: "Update a Home Assistant add-on to the latest available version.",
  annotations: {
    title: "addon_update",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to update",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { updateAddon } = await import("../lib/addon-manager.js");
    return await updateAddon(slug);
  },
},
{
  name: "addon_install",
  title: "Install Add-on",
  description: "Install a new add-on from the Supervisor add-on store.",
  annotations: {
    title: "addon_install",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to install from the store",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { installAddon } = await import("../lib/addon-manager.js");
    return await installAddon(slug);
  },
},
{
  name: "addon_uninstall",
  title: "Uninstall Add-on",
  description: "Uninstall a Home Assistant add-on.",
  annotations: {
    title: "addon_uninstall",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to uninstall",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { uninstallAddon } = await import("../lib/addon-manager.js");
    return await uninstallAddon(slug);
  },
},
{
  name: "addon_logs",
  title: "Get Add-on Logs",
  description: "Retrieve logs from a specific Home Assistant add-on.",
  annotations: {
    title: "addon_logs",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to get logs from",
      },
      lines: {
        type: "number",
        description: "Number of log lines to retrieve (max 1000)",
        default: 100,
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug, lines = 100 } = request.params;
    const { getAddonLogs } = await import("../lib/addon-manager.js");
    return await getAddonLogs(slug, lines);
  },
},
{
  name: "addon_stats",
  title: "Get Add-on Stats",
  description: "Get CPU, memory, and network statistics for a Home Assistant add-on.",
  annotations: {
    title: "addon_stats",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to get stats for",
      },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { slug } = request.params;
    const { getAddonStats } = await import("../lib/addon-manager.js");
    return await getAddonStats(slug);
  },
},
{
  name: "addon_set_options",
  title: "Set Add-on Options",
  description: "Update configuration options for a Home Assistant add-on.",
  annotations: {
    title: "addon_set_options",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Add-on slug to configure",
      },
      options: {
        type: "object",
        description: "Configuration options to set",
        additionalProperties: true,
      },
    },
    required: ["slug", "options"],
  },
  execute: async (request) => {
    const { slug, options } = request.params;
    const { setAddonOptions } = await import("../lib/addon-manager.js");
    return await setAddonOptions(slug, options);
  },
},
{
  name: "addon_add_repository",
  title: "Add Add-on Repository",
  description: "Add a custom add-on repository URL to Supervisor.",
  annotations: {
    title: "addon_add_repository",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Repository URL (e.g., 'https://github.com/author/repo')",
      },
    },
    required: ["url"],
  },
  execute: async (request) => {
    const { url } = request.params;
    const { addAddonRepository } = await import("../lib/addon-manager.js");
    return await addAddonRepository(url);
  },
},
{
  name: "addon_remove_repository",
  title: "Remove Add-on Repository",
  description: "Remove a custom add-on repository URL from Supervisor.",
  annotations: {
    title: "addon_remove_repository",
    destructive: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Repository URL to remove",
      },
    },
    required: ["url"],
  },
  execute: async (request) => {
    const { url } = request.params;
    const { removeAddonRepository } = await import("../lib/addon-manager.js");
    return await removeAddonRepository(url);
  },
},
{
  name: "frigate_status",
  title: "Frigate NVR Status",
  description: "Get Frigate NVR status with camera summary including FPS and detected objects",
  annotations: { title: "frigate_status", readOnly: true, idempotent: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { getFrigateStatus } = await import("../lib/frigate-integration.js");
    return await getFrigateStatus();
  },
},
{
  name: "frigate_events",
  title: "Frigate Events",
  description: "List recent Frigate detection events with optional camera/label filtering",
  annotations: { title: "frigate_events", readOnly: true },
  inputSchema: {
    type: "object",
    properties: {
      camera: { type: "string", description: "Filter by camera name" },
      label: { type: "string", description: "Filter by object label (person, car, etc)" },
      limit: { type: "number", description: "Max events to return (default 50)" },
    },
  },
  execute: async (request) => {
    const { getFrigateEvents } = await import("../lib/frigate-integration.js");
    return await getFrigateEvents(request.params);
  },
},
{
  name: "frigate_snapshot",
  title: "Frigate Event Snapshot",
  description: "Get snapshot URL for a Frigate detection event",
  annotations: { title: "frigate_snapshot", readOnly: true },
  inputSchema: {
    type: "object",
    properties: {
      event_id: { type: "string", description: "Event ID" },
      width: { type: "number", description: "Image width in pixels" },
    },
    required: ["event_id"],
  },
  execute: async (request) => {
    const { getFrigateSnapshot } = await import("../lib/frigate-integration.js");
    const { event_id, ...opts } = request.params;
    return await getFrigateSnapshot(event_id, opts);
  },
},
{
  name: "frigate_cameras",
  title: "Frigate Cameras",
  description: "List all Frigate cameras with current stats",
  annotations: { title: "frigate_cameras", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { listFrigateCameras } = await import("../lib/frigate-integration.js");
    return await listFrigateCameras();
  },
},
{
  name: "frigate_recordings",
  title: "Frigate Recordings",
  description: "Get Frigate recording summary by camera",
  annotations: { title: "frigate_recordings", readOnly: true },
  inputSchema: { type: "object", properties: { camera: { type: "string", description: "Camera name" } } },
  execute: async (request) => {
    const { getFrigateRecordings } = await import("../lib/frigate-integration.js");
    return await getFrigateRecordings(request.params);
  },
},
{
  name: "backup_list",
  title: "List Backups",
  description: "List all Home Assistant backups with details",
  annotations: { title: "backup_list", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { listBackups } = await import("../lib/backup-manager.js");
    return await listBackups();
  },
},
{
  name: "backup_create",
  title: "Create Backup",
  description: "Create a full Home Assistant backup",
  annotations: { title: "backup_create" },
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Backup name" },
      password: { type: "string", description: "Optional encryption password" },
    },
  },
  execute: async (request) => {
    const { createBackup } = await import("../lib/backup-manager.js");
    return await createBackup(request.params);
  },
},
{
  name: "backup_restore",
  title: "Restore Backup",
  description: "Restore a Home Assistant backup by slug",
  annotations: { title: "backup_restore", destructive: true },
  inputSchema: {
    type: "object",
    properties: {
      slug: { type: "string", description: "Backup slug to restore" },
      password: { type: "string" },
      homeassistant: { type: "boolean" },
    },
    required: ["slug"],
  },
  execute: async (request) => {
    const { restoreBackup } = await import("../lib/backup-manager.js");
    const { slug, ...opts } = request.params;
    return await restoreBackup(slug, opts);
  },
},
{
  name: "backup_delete",
  title: "Delete Backup",
  description: "Delete a Home Assistant backup",
  annotations: { title: "backup_delete", destructive: true },
  inputSchema: { type: "object", properties: { slug: { type: "string", description: "Backup slug to delete" } }, required: ["slug"] },
  execute: async (request) => {
    const { deleteBackup } = await import("../lib/backup-manager.js");
    return await deleteBackup(request.params.slug);
  },
},
{
  name: "backup_info",
  title: "Backup Storage Info",
  description: "Get backup storage information",
  annotations: { title: "backup_info", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { getBackupInfoStatus } = await import("../lib/backup-manager.js");
    return await getBackupInfoStatus();
  },
},
{
  name: "backup_download",
  title: "Download Backup",
  description: "Get download URL for a specific backup",
  annotations: { title: "backup_download", readOnly: true },
  inputSchema: { type: "object", properties: { slug: { type: "string", description: "Backup slug" } }, required: ["slug"] },
  execute: async (request) => {
    const { downloadBackup } = await import("../lib/backup-manager.js");
    return await downloadBackup(request.params.slug);
  },
},
{
  name: "ma_status",
  title: "Music Assistant Status",
  description: "Get Music Assistant status with player and provider counts",
  annotations: { title: "ma_status", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { getMusicAssistantStatus } = await import("../lib/music-assistant-integration.js");
    return await getMusicAssistantStatus();
  },
},
{
  name: "ma_players",
  title: "Music Assistant Players",
  description: "List all Music Assistant players",
  annotations: { title: "ma_players", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { listMaPlayers } = await import("../lib/music-assistant-integration.js");
    return await listMaPlayers();
  },
},
{
  name: "ma_search",
  title: "Music Assistant Search",
  description: "Search music library across all providers",
  annotations: { title: "ma_search", readOnly: true },
  inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query" }, limit: { type: "number", description: "Max results" } }, required: ["query"] },
  execute: async (request) => {
    const { searchMaMusic } = await import("../lib/music-assistant-integration.js");
    return await searchMaMusic(request.params.query, request.params);
  },
},
{
  name: "ma_playlists",
  title: "Music Assistant Playlists",
  description: "List all playlists from all providers",
  annotations: { title: "ma_playlists", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { listMaPlaylists } = await import("../lib/music-assistant-integration.js");
    return await listMaPlaylists();
  },
},
{
  name: "ma_providers",
  title: "Music Assistant Providers",
  description: "List all configured music providers",
  annotations: { title: "ma_providers", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { listMaProviders } = await import("../lib/music-assistant-integration.js");
    return await listMaProviders();
  },
},
{
  name: "devtools_status",
  title: "Developer Tools Status",
  description: "Get status of all developer tools addons",
  annotations: { title: "devtools_status", readOnly: true },
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { getDevToolsStatus } = await import("../lib/dev-tools-integration.js");
    return await getDevToolsStatus();
  },
},
{
  name: "devtools_info",
  title: "Developer Tool Info",
  description: "Get detailed info about a specific developer tool addon",
  annotations: { title: "devtools_info", readOnly: true },
  inputSchema: { type: "object", properties: { slug: { type: "string", description: "Addon slug" } }, required: ["slug"] },
  execute: async (request) => {
    const { getDevToolInfo } = await import("../lib/dev-tools-integration.js");
    return await getDevToolInfo(request.params.slug);
  },
},
{
  name: "devtools_install",
  title: "Install Developer Tool",
  description: "Install a developer tool addon",
  annotations: { title: "devtools_install", destructive: true },
  inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  execute: async (request) => {
    const { installDevTool } = await import("../lib/dev-tools-integration.js");
    return await installDevTool(request.params.slug);
  },
},
{
  name: "devtools_start",
  title: "Start Developer Tool",
  description: "Start a developer tool addon",
  annotations: { title: "devtools_start", destructive: true },
  inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  execute: async (request) => {
    const { startDevTool } = await import("../lib/dev-tools-integration.js");
    return await startDevTool(request.params.slug);
  },
},
{
  name: "devtools_stop",
  title: "Stop Developer Tool",
  description: "Stop a developer tool addon",
  annotations: { title: "devtools_stop", destructive: true },
  inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  execute: async (request) => {
    const { stopDevTool } = await import("../lib/dev-tools-integration.js");
    return await stopDevTool(request.params.slug);
  },
},
{
  name: "devtools_restart",
  title: "Restart Developer Tool",
  description: "Restart a developer tool addon",
  annotations: { title: "devtools_restart", destructive: true },
  inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  execute: async (request) => {
    const { restartDevTool } = await import("../lib/dev-tools-integration.js");
    return await restartDevTool(request.params.slug);
  },
},
{
  name: "devtools_update",
  title: "Update Developer Tool",
  description: "Update a developer tool addon to the latest version",
  annotations: { title: "devtools_update" },
  inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  execute: async (request) => {
    const { updateDevTool } = await import("../lib/dev-tools-integration.js");
    return await updateDevTool(request.params.slug);
  },
},
{
  name: "devtools_search",
  title: "Search Addons",
  description: "Search available addons by name or description",
  annotations: { title: "devtools_search", readOnly: true },
  inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
  execute: async (request) => {
    const { searchAddons } = await import("../lib/dev-tools-integration.js");
    return await searchAddons(request.params.query);
  },
  },

{
  name: "detect_addons",
  title: "Detect Installed Addons",
  description: "Auto-detect installed Home Assistant addons and recommend which MCP integrations to enable. Scans for HACS, Grafana, Node-RED, InfluxDB, Frigate, Music Assistant, Zigbee2MQTT, and more.",
  annotations: {
    title: "detect_addons",
    readOnly: true,
    idempotent: true,
  },
  inputSchema: {
    type: "object",
    properties: {
      auto_enable: {
        type: "boolean",
        description: "Automatically enable detected integrations in config (requires write access)",
        default: false,
      },
    },
    required: [],
  },
  execute: async () => {
    const { detectInstalledAddons, buildRecommendedConfig } = await import("../lib/addon-detector.js");
    const installed = await detectInstalledAddons();
    const recommendations = buildRecommendedConfig(installed);
    return {
      success: true,
      installed_addons: installed,
      recommendations: recommendations,
      message: recommendations.message,
    };
  },
},
{
  name: "update_opencode",
  title: "Update OpenCode",
  description: "Update OpenCode AI to the latest version via npm. Takes ~30-60 seconds, restarts MCP server.",
  annotations: { title: "update_opencode" },
  inputSchema: { type: "object", properties: {}, required: [] },
  execute: async () => {
    const { updateOpenCode } = await import("../lib/opencode-manager.js");
    return await updateOpenCode();
  },
},
{
  name: "edit_opencode_config_json",
  title: "Edit OpenCode Config JSON",
  description: "Read or write OpenCode's custom user config.json. Use to set providers, keybindings, themes, etc.",
  annotations: { title: "edit_opencode_config_json" },
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "Action: read (get current config), write (set new config)",
        enum: ["read", "write"],
      },
      config_json: {
        type: "string",
        description: "JSON string to write (required for write action)",
        default: "",
      },
    },
    required: ["action"],
  },
  execute: async (request) => {
    const { readOpenCodeConfig, writeOpenCodeConfig } = await import("../lib/opencode-manager.js");
    if (request.params.action === "read") {
      return readOpenCodeConfig();
    }
    if (request.params.action === "write") {
      try {
        const config = JSON.parse(request.params.config_json);
        return writeOpenCodeConfig(config);
      } catch (e) {
        return { success: false, error: "Invalid JSON: " + e.message };
      }
    }
    return { success: false, error: "Unknown action" };
  },
}];