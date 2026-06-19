/**
 * PeerJS signaling protocol primitives.
 *
 * These mirror the wire contract of the reference `peerjs-server` so the
 * stock `peerjs` browser client can talk to this self-hosted server without
 * any client patches: WebSocket handshake at `/peerjs?key=&id=&token=`,
 * an `OPEN` greeting on registration, `ID-TAKEN`/`ERROR` rejections, and
 * relayed `OFFER`/`ANSWER`/`CANDIDATE`/`LEAVE`/`EXPIRE` messages.
 */

export const MessageType = {
  OPEN: "OPEN",
  LEAVE: "LEAVE",
  CANDIDATE: "CANDIDATE",
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  EXPIRE: "EXPIRE",
  HEARTBEAT: "HEARTBEAT",
  ID_TAKEN: "ID-TAKEN",
  ERROR: "ERROR",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const Errors = {
  INVALID_KEY: "Invalid key provided",
  INVALID_TOKEN: "Invalid token provided",
  INVALID_WS_PARAMETERS: "No id, token, or key supplied to websocket server",
  CONNECTION_LIMIT_EXCEED: "Server has reached its concurrent user limit",
} as const;

export type SignalError = (typeof Errors)[keyof typeof Errors];

/** A single signaling envelope. `src` is always set by the server on relay. */
export interface SignalMessage {
  type: MessageType;
  src?: string;
  dst?: string;
  payload?: unknown;
}

/**
 * Transport-agnostic socket the relay writes to. The Bun/Hono WebSocket layer
 * adapts a live socket to this interface; tests supply an in-memory double.
 */
export interface PeerConnection {
  send(data: string): void;
  close(): void;
}

export interface PeerServerConfig {
  /** Shared API key the client must present (`?key=`). Default `peerjs`. */
  key: string;
  /** Hard cap on concurrently registered peers. */
  concurrentLimit: number;
  /** How long messages for an absent destination are held before expiring. */
  expireTimeoutMs: number;
  /** Drop a peer that has not pinged within this window. */
  aliveTimeoutMs: number;
  /** Generates a random id for clients that connect without one. */
  generateClientId: () => string;
}

export interface PeerServerStats {
  peers: number;
  uptimeMs: number;
}
