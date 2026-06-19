import type { Context as HonoContext } from "hono";

/** A WebRTC ICE (STUN/TURN) server descriptor, as consumed by `RTCPeerConnection`. */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * Live signaling facts the API exposes to clients. Implemented by the server
 * app over its in-memory PeerServer and injected at context creation, so the
 * API package stays free of any transport/runtime dependency.
 */
export interface SignalingService {
  /** Shared key clients must use when constructing a PeerJS `Peer`. */
  key: string;
  peerCount(): number;
  uptimeMs(): number;
  iceServers(): IceServer[];
}

export interface CreateContextOptions {
  context: HonoContext;
  signaling: SignalingService;
}

// A `type` alias (not `interface`) so it carries an implicit string index
// signature and stays assignable to the tRPC adapter's `Record<string, unknown>`.
export type Context = {
  signaling: SignalingService;
};

export async function createContext(opts: CreateContextOptions): Promise<Context> {
  return { signaling: opts.signaling };
}
