import type { PeerOptions } from "peerjs";

import type { IceServerConf, PeerServerConf } from "./types";

/**
 * The public PeerJS cloud node. Used as a zero-config signaling target when no
 * self-hosted server is configured, and as the automatic failover destination
 * when a configured server is unreachable.
 */
export const PUBLIC_PEER_SERVER: PeerServerConf = {
  host: "0.peerjs.com",
  port: 443,
  path: "/",
  secure: true,
  key: "peerjs",
};

/**
 * Parse a signaling-server URL into PeerJS `Peer` coordinates.
 *
 * A blank URL resolves to the public PeerJS cloud (`PUBLIC_PEER_SERVER`).
 *
 * Accepts an optional `?key=` query (defaults to `peerjs`). The port falls back
 * to 443/80 by protocol when absent. Uses `hostname` (never `host`) so the port
 * is not duplicated into the host field.
 */
export function resolvePeerServerURL(serverURL: string): PeerServerConf {
  if (!serverURL.trim()) return PUBLIC_PEER_SERVER;
  const url = new URL(serverURL);
  let port = Number.parseInt(url.port, 10);
  if (!port || Number.isNaN(port)) {
    port = url.protocol === "https:" ? 443 : 80;
  }
  return {
    host: url.hostname,
    port,
    path: url.pathname || "/",
    secure: url.protocol === "https:",
    key: url.searchParams.get("key") ?? "peerjs",
  };
}

/**
 * Parse user-entered ICE server lines. Two encodings are supported (matching
 * the legacy app): `urls|username|credential` (pipe-delimited) and
 * `urls^username@credential` / `urls^username:credential`.
 */
export function parseIceServers(entries: string[]): IceServerConf[] {
  return entries
    .filter((entry) => entry.trim().length > 0)
    .map((entry) => {
      const pipe = entry.split("|");
      if (pipe.length === 3) {
        return { urls: pipe[0], username: pipe[1], credential: pipe[2] };
      }
      const caret = entry.lastIndexOf("^");
      if (caret === -1) return { urls: entry };
      const urls = entry.slice(0, caret);
      const rest = entry.slice(caret + 1);
      const parts = rest.includes("@") ? rest.split("@") : rest.split(":");
      return { urls, username: parts[0] ?? "", credential: parts[1] ?? "" };
    });
}

export function buildPeerOptions(serverConf: PeerServerConf, iceServers: IceServerConf[]): PeerOptions {
  const options: PeerOptions = {
    host: serverConf.host,
    port: serverConf.port,
    path: serverConf.path,
    secure: serverConf.secure,
  };
  if (serverConf.key) options.key = serverConf.key;
  if (iceServers.length > 0) options.config = { iceServers };
  return options;
}
