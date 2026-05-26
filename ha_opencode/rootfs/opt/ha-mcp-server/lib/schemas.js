/**
 * JSON Schemas for MCP tool inputs and outputs.
 * Extracted from index.js for testability.
 */

export const SCHEMAS = {
  entityState: {
    type: "object",
    properties: {
      entity_id: { type: "string", description: "Entity identifier" },
      state: { type: "string", description: "Current state value" },
      friendly_name: { type: "string", description: "Human-readable name" },
      device_class: { type: "string", description: "Device classification" },
      last_changed: { type: "string", description: "ISO timestamp of last state change" },
      last_updated: { type: "string", description: "ISO timestamp of last update" },
    },
    required: ["entity_id", "state"],
  },

  entityStateArray: {
    type: "array",
    items: {
      type: "object",
      properties: {
        entity_id: { type: "string" },
        state: { type: "string" },
        friendly_name: { type: "string" },
        device_class: { type: "string" },
      },
      required: ["entity_id", "state"],
    },
  },

  searchResult: {
    type: "array",
    items: {
      type: "object",
      properties: {
        entity_id: { type: "string" },
        state: { type: "string" },
        friendly_name: { type: "string" },
        device_class: { type: "string" },
        score: { type: "number", description: "Search relevance score" },
      },
      required: ["entity_id", "state", "score"],
    },
  },

  entityDetails: {
    type: "object",
    properties: {
      entity_id: { type: "string" },
      friendly_name: { type: "string" },
      state: { type: "string" },
      domain: { type: "string" },
      device_class: { type: "string" },
      device_id: { type: "string" },
      area_id: { type: "string" },
      attributes: { type: "object" },
      related_entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            entity_id: { type: "string" },
            friendly_name: { type: "string" },
            state: { type: "string" },
            relationship: { type: "string", enum: ["same_device", "same_area"] },
          },
        },
      },
    },
    required: ["entity_id", "state", "domain"],
  },

  serviceCallResult: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      domain: { type: "string" },
      service: { type: "string" },
      affected_entities: { type: "array", items: { type: "string" } },
    },
    required: ["success", "domain", "service"],
  },

  anomaly: {
    type: "object",
    properties: {
      entity_id: { type: "string" },
      reason: { type: "string" },
      severity: { type: "string", enum: ["info", "warning", "error"] },
    },
    required: ["entity_id", "reason", "severity"],
  },

  anomalyArray: {
    type: "array",
    items: {
      type: "object",
      properties: {
        entity_id: { type: "string" },
        reason: { type: "string" },
        severity: { type: "string", enum: ["info", "warning", "error"] },
      },
      required: ["entity_id", "reason", "severity"],
    },
  },

  suggestion: {
    type: "object",
    properties: {
      type: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      entities: { type: "array", items: { type: "string" } },
    },
    required: ["type", "title", "description"],
  },

  suggestionArray: {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["type", "title", "description"],
    },
  },

  diagnostics: {
    type: "object",
    properties: {
      entity_id: { type: "string" },
      timestamp: { type: "string" },
      current_state: { type: "object" },
      checks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            check: { type: "string" },
            status: { type: "string", enum: ["ok", "info", "warning", "error"] },
            details: { type: "string" },
          },
        },
      },
      history_summary: { type: "object" },
      relationships: { type: "object" },
    },
    required: ["entity_id", "timestamp", "checks"],
  },

  configValidation: {
    type: "object",
    properties: {
      result: { type: "string", enum: ["valid", "invalid"] },
      errors: { type: "string" },
    },
    required: ["result"],
  },

  integrationDocs: {
    type: "object",
    properties: {
      integration: { type: "string", description: "Integration name" },
      url: { type: "string", description: "Documentation URL" },
      title: { type: "string", description: "Integration title" },
      description: { type: "string", description: "Integration description" },
      configuration: { type: "string", description: "Configuration section content" },
      ha_version: { type: "string", description: "Current HA version" },
      fetched_at: { type: "string", description: "Timestamp when docs were fetched" },
    },
    required: ["integration", "url"],
  },

  breakingChanges: {
    type: "object",
    properties: {
      ha_version: { type: "string", description: "Current Home Assistant version" },
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            version: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            integration: { type: "string" },
            url: { type: "string" },
          },
        },
      },
    },
    required: ["ha_version", "changes"],
  },

  configSyntaxCheck: {
    type: "object",
    properties: {
      valid: { type: "boolean", description: "Whether the syntax appears valid" },
      deprecated: { type: "boolean", description: "Whether deprecated syntax was detected" },
      warnings: {
        type: "array",
        items: { type: "string" },
        description: "List of warnings about the configuration",
      },
      suggestions: {
        type: "array",
        items: { type: "string" },
        description: "Suggestions for improving the configuration",
      },
      docs_url: { type: "string", description: "URL to relevant documentation" },
    },
    required: ["valid", "deprecated", "warnings", "suggestions"],
  },

  safeWriteResult: {
    type: "object",
    properties: {
      success: { type: "boolean", description: "Whether the config was successfully written and validated" },
      dry_run: { type: "boolean", description: "Whether this was a dry-run (no file written)" },
      file_path: { type: "string", description: "The resolved file path" },
      validation_result: { type: "string", enum: ["valid", "invalid", "skipped"], description: "Result of HA core config validation" },
      validation_errors: { type: "string", description: "HA config validation error details" },
      deprecation_warnings: { type: "array", items: { type: "string" }, description: "Deprecation patterns detected" },
      template_results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            template: { type: "string" },
            status: { type: "string", enum: ["valid", "error", "skipped"] },
            error: { type: "string" },
          },
        },
        description: "Template validation results",
      },
      structural_issues: { type: "array", items: { type: "string" }, description: "Structural YAML issues found" },
      suggestions: { type: "array", items: { type: "string" }, description: "Improvement suggestions" },
      file_written: { type: "boolean", description: "Whether the file was actually written to disk" },
      backup_restored: { type: "boolean", description: "Whether the backup was restored due to validation failure" },
    },
    required: ["success", "dry_run", "validation_result"],
  },

  area: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
    },
    required: ["id", "name"],
  },

  areaArray: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
      required: ["id", "name"],
    },
  },
};
