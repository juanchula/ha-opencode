/**
 * Music Assistant Integration for Home Assistant
 * Media player management, music library, playlists, and streaming
 * Requires Music Assistant add-on to be installed and running
 */
import { callSupervisor } from "./ha-api.js";

/**
 * Discover Music Assistant addon
 * @returns {Promise<Object>}
 */
export async function discoverMusicAssistant() {
  try {
    const addonsInfo = await callSupervisor("/addons");
    const maAddon = (addonsInfo.addons || []).find(
      a => a.slug === "music_assistant" || 
           a.slug === "music-assistant" ||
           a.name.toLowerCase().includes("music assistant")
    );
    if (!maAddon) {
      return {
        installed: false,
        info: "Music Assistant add-on not found",
        how_to_install: "Install Music Assistant from Supervisor > Add-on Store",
      };
    }
    const info = await callSupervisor(`/addons/${maAddon.slug}/info`);
    return {
      installed: true,
      slug: maAddon.slug,
      name: info.name || maAddon.name,
      version: info.version || maAddon.version,
      state: info.state || maAddon.state,
      ingress_url: info.ingress_url || null,
      has_ingress: !!info.ingress_url,
    };
  } catch (error) {
    return { installed: false, error: error.message };
  }
}

/**
 * Get Music Assistant status and player summary
 * @returns {Promise<Object>}
 */
export async function getMusicAssistantStatus() {
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");
  try {
    const response = await fetch(`${ma.ingress_url}/api/status`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const status = await response.json();
    return {
      installed: true,
      version: ma.version,
      state: ma.state,
      provider_count: status.providers?.length || 0,
      player_count: status.players?.length || 0,
      running: status.running || false,
    };
  } catch (error) {
    return {
      installed: true,
      version: ma.version,
      state: ma.state,
      error: `Status unavailable: ${error.message}`,
    };
  }
}

/**
 * List players in Music Assistant
 * @returns {Promise<Array>}
 */
export async function listMaPlayers() {
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");
  try {
    const response = await fetch(`${ma.ingress_url}/api/players`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const players = await response.json();
    return (players || []).map(p => ({
      player_id: p.player_id,
      name: p.display_name,
      type: p.type,
      powered: p.powered,
      volume: p.volume_level,
      active_source: p.active_source,
      elapsed_time: p.elapsed_time,
      total_time: p.total_time,
      group_name: p.group_childs?.length > 0 ? "group_parent" : null,
    }));
  } catch (error) {
    throw new Error(`Failed to list players: ${error.message}`);
  }
}

/**
 * Get available music providers
 * @returns {Promise<Array>}
 */
export async function listMaProviders() {
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");
  try {
    const response = await fetch(`${ma.ingress_url}/api/providers`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const providers = await response.json();
    return (providers || []).map(p => ({
      provider_id: p.provider_id,
      name: p.name,
      type: p.type,
      supported_features: p.supported_features || [],
    }));
  } catch (error) {
    throw new Error(`Failed to list providers: ${error.message}`);
  }
}

/**
 * Search music library
 * @param {string} query - Search query
 * @param {Object} opts - { provider, limit }
 * @returns {Promise<Array>}
 */
export async function searchMaMusic(query, opts = {}) {
  if (!query) throw new Error("Search query is required");
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");

  const params = new URLSearchParams({ query });
  if (opts.provider) params.set("provider", opts.provider);
  if (opts.limit) params.set("limit", String(opts.limit));

  try {
    const response = await fetch(`${ma.ingress_url}/api/search?${params}`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const results = await response.json();
    return (results.items || []).map(item => ({
      name: item.name,
      artist: item.artist,
      album: item.album,
      media_type: item.media_type,
      uri: item.uri,
      duration: item.duration,
      provider: item.provider,
      image: item.image,
    }));
  } catch (error) {
    throw new Error(`Failed to search music: ${error.message}`);
  }
}

/**
 * Get playlists
 * @returns {Promise<Array>}
 */
export async function listMaPlaylists() {
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");
  try {
    const response = await fetch(`${ma.ingress_url}/api/playlists`, {
      headers: { Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}` },
    });
    const playlists = await response.json();
    return (playlists || []).map(p => ({
      name: p.name,
      uri: p.uri,
      provider: p.provider,
      total_items: p.total_items || 0,
      owner: p.owner,
    }));
  } catch (error) {
    throw new Error(`Failed to list playlists: ${error.message}`);
  }
}

/**
 * Queue a track/playlist to a player
 * @param {string} playerId - Player ID
 * @param {string} uri - Media URI to play
 * @returns {Promise<Object>}
 */
export async function playMaMedia(playerId, uri) {
  if (!playerId || !uri) throw new Error("Player ID and URI are required");
  const ma = await discoverMusicAssistant();
  if (!ma.installed) throw new Error("Music Assistant is not installed");

  try {
    const response = await fetch(`${ma.ingress_url}/api/player/${playerId}/play_media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uri, enqueue: false }),
    });
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to play media: ${error.message}`);
  }
}
