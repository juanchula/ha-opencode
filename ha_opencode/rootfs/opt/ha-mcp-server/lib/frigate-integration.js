/**
 * Frigate NVR Integration for Home Assistant
 * Camera detection, events, snapshots, recordings, and camera management
 * Requires Frigate add-on to be installed and running
 */
import { callSupervisor, callHA } from "./ha-api.js";

/**
 * Discover Frigate addon via Supervisor
 * @returns {Promise<Object>} { installed, slug, version, ingress_url }
 */
export async function discoverFrigate() {
  try {
    const addonsInfo = await callSupervisor("/addons");
    const frigateAddon = (addonsInfo.addons || []).find(
      a => a.slug === "frigate" || a.name.toLowerCase().includes("frigate")
    );
    if (!frigateAddon) {
      return {
        installed: false,
        info: "Frigate add-on not found",
        how_to_install: "Install Frigate from Supervisor > Add-on Store",
      };
    }
    const frigateInfo = await callSupervisor(`/addons/${frigateAddon.slug}/info`);
    return {
      installed: true,
      slug: frigateAddon.slug,
      name: frigateInfo.name || frigateAddon.name,
      version: frigateInfo.version || frigateAddon.version,
      state: frigateInfo.state || frigateAddon.state,
      ingress_url: frigateInfo.ingress_url || null,
      has_ingress: !!frigateInfo.ingress_url,
    };
  } catch (error) {
    return { installed: false, error: error.message };
  }
}

/**
 * Get Frigate status and camera summary
 * @returns {Promise<Object>}
 */
export async function getFrigateStatus() {
  try {
    const frigate = await discoverFrigate();
    if (!frigate.installed) throw new Error("Frigate is not installed");

    const response = await fetch(`${frigate.ingress_url}/api/stats`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const stats = await response.json();

    return {
      installed: true,
      version: frigate.version,
      state: frigate.state,
      cameras: Object.keys(stats.cameras || {}).map(name => ({
        name,
        fps: stats.cameras?.[name]?.camera_fps || 0,
        detection_fps: stats.cameras?.[name]?.detection_fps || 0,
        objects: stats.cameras?.[name]?.objects?.length || 0,
      })),
      processes: stats.service?.uptime ? { uptime: stats.service.uptime } : {},
      frigate_plus: !!stats.service?.plus_version,
    };
  } catch (error) {
    if (error.message.includes("not installed")) throw error;
    throw new Error(`Failed to get Frigate status: ${error.message}`);
  }
}

/**
 * List current events from Frigate
 * @param {Object} opts - { camera, label, limit, time_range }
 * @returns {Promise<Array>}
 */
export async function getFrigateEvents(opts = {}) {
  const frigate = await discoverFrigate();
  if (!frigate.installed) throw new Error("Frigate is not installed");

  const params = new URLSearchParams();
  if (opts.camera) params.set("camera", opts.camera);
  if (opts.label) params.set("label", opts.label);
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.before) params.set("before", String(opts.before));
  if (opts.after) params.set("after", String(opts.after));

  try {
    const response = await fetch(`${frigate.ingress_url}/api/events?${params}`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const events = await response.json();
    return (events || []).map(e => ({
      id: e.id,
      camera: e.camera,
      label: e.label,
      sub_label: e.sub_label,
      start_time: e.start_time,
      end_time: e.end_time,
      has_snapshot: e.has_snapshot,
      has_clip: e.has_clip,
      top_score: e.top_score,
      false_positive: e.false_positive,
    }));
  } catch (error) {
    throw new Error(`Failed to get Frigate events: ${error.message}`);
  }
}

/**
 * Get snapshot URL for a specific event
 * @param {string} eventId - Event ID
 * @param {Object} opts - { width, height }
 * @returns {Promise<Object>}
 */
export async function getFrigateSnapshot(eventId, opts = {}) {
  const frigate = await discoverFrigate();
  if (!frigate.installed) throw new Error("Frigate is not installed");

  const params = new URLSearchParams();
  if (opts.width) params.set("w", String(opts.width));
  if (opts.height) params.set("h", String(opts.height));

  return {
    snapshot_url: `${frigate.ingress_url}/api/events/${eventId}/snapshot.jpg?${params}`,
    event_id: eventId,
  };
}

/**
 * List Frigate cameras with their stats
 * @returns {Promise<Array>}
 */
export async function listFrigateCameras() {
  try {
    const frigate = await discoverFrigate();
    if (!frigate.installed) throw new Error("Frigate is not installed");

    const response = await fetch(`${frigate.ingress_url}/api/stats`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const stats = await response.json();
    const cameras = stats.cameras || {};

    return Object.entries(cameras).map(([name, data]) => ({
      name,
      fps: data.camera_fps || 0,
      detection_fps: data.detection_fps || 0,
      audio_rms: data.audio_rms || null,
      audio_db: data.audio_db || null,
      objects: (data.objects || []).map(o => ({
        label: o[0],
        score: o[1],
        position: o[2],
      })),
      motion_detected: data.motion_detected || false,
    }));
  } catch (error) {
    if (error.message.includes("not installed")) throw error;
    throw new Error(`Failed to list cameras: ${error.message}`);
  }
}

/**
 * Get Frigate recording summary
 * @param {Object} opts - { camera }
 * @returns {Promise<Object>}
 */
export async function getFrigateRecordings(opts = {}) {
  try {
    const frigate = await discoverFrigate();
    if (!frigate.installed) throw new Error("Frigate is not installed");

    const url = opts.camera
      ? `${frigate.ingress_url}/api/recordings/summary?camera=${opts.camera}`
      : `${frigate.ingress_url}/api/recordings/summary`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    return await response.json();
  } catch (error) {
    if (error.message.includes("not installed")) throw error;
    throw new Error(`Failed to get recordings: ${error.message}`);
  }
}
