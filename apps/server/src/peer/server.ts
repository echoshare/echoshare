import {
  Errors,
  MessageType,
  type PeerConnection,
  type PeerServerConfig,
  type PeerServerStats,
  type SignalError,
  type SignalMessage,
} from "./types";

interface Client {
  id: string;
  token: string;
  conn: PeerConnection | null;
  lastSeen: number;
}

interface PendingQueue {
  messages: SignalMessage[];
  timer: ReturnType<typeof setTimeout>;
}

export const DEFAULT_PEER_SERVER_CONFIG: PeerServerConfig = {
  key: "peerjs",
  concurrentLimit: 5000,
  expireTimeoutMs: 5000,
  aliveTimeoutMs: 60000,
  generateClientId: () => crypto.randomUUID(),
};

/**
 * In-memory PeerJS signaling server.
 *
 * State is a flat registry of connected peers plus short-lived per-destination
 * queues that hold messages for a peer that has not connected yet (e.g. a
 * receiver dials a sender a moment before the sender's socket opens). The relay
 * is intentionally transport-agnostic — see {@link PeerConnection} — so the
 * core logic is unit-testable without a real WebSocket.
 *
 * NOTE: state is process-local. A single instance is correct; horizontal
 * scaling needs sticky sessions or an external pub/sub fan-out.
 */
export class PeerServer {
  private readonly config: PeerServerConfig;
  private readonly clients = new Map<string, Client>();
  private readonly connClients = new Map<PeerConnection, Client>();
  private readonly queues = new Map<string, PendingQueue>();
  private readonly startedAt = Date.now();
  private reaper: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<PeerServerConfig>) {
    this.config = { ...DEFAULT_PEER_SERVER_CONFIG, ...config };
  }

  get key(): string {
    return this.config.key;
  }

  generateClientId(): string {
    return this.config.generateClientId();
  }

  getClientIds(): string[] {
    return [...this.clients.keys()];
  }

  stats(): PeerServerStats {
    return { peers: this.clients.size, uptimeMs: Date.now() - this.startedAt };
  }

  /** Handle a freshly upgraded socket. Validates params, then registers or rebinds. */
  open(params: { id?: string; token?: string; key?: string; conn: PeerConnection }): void {
    const { id, token, key, conn } = params;

    if (!id || !token || !key) {
      this.fail(conn, Errors.INVALID_WS_PARAMETERS);
      return;
    }
    if (key !== this.config.key) {
      this.fail(conn, Errors.INVALID_KEY);
      return;
    }

    const existing = this.clients.get(id);
    if (existing) {
      if (existing.token !== token) {
        conn.send(JSON.stringify({ type: MessageType.ID_TAKEN, payload: { msg: "ID is taken" } }));
        conn.close();
        return;
      }
      // Same peer reconnecting: rebind the live socket and replay anything queued.
      existing.conn = conn;
      existing.lastSeen = Date.now();
      this.connClients.set(conn, existing);
      conn.send(JSON.stringify({ type: MessageType.OPEN }));
      this.flushQueue(id);
      return;
    }

    if (this.clients.size >= this.config.concurrentLimit) {
      this.fail(conn, Errors.CONNECTION_LIMIT_EXCEED);
      return;
    }

    const client: Client = { id, token, conn, lastSeen: Date.now() };
    this.clients.set(id, client);
    this.connClients.set(conn, client);
    conn.send(JSON.stringify({ type: MessageType.OPEN }));
    this.flushQueue(id);
  }

  /** Handle an inbound frame from a registered socket. */
  message(conn: PeerConnection, raw: string): void {
    const client = this.connClients.get(conn);
    if (!client) return;

    let msg: SignalMessage;
    try {
      msg = JSON.parse(raw) as SignalMessage;
    } catch {
      return;
    }

    client.lastSeen = Date.now();
    msg.src = client.id;

    if (msg.type === MessageType.HEARTBEAT) return;

    this.transmit(msg);
  }

  /** Handle a socket close. Only forgets the client if this socket is still the bound one. */
  close(conn: PeerConnection): void {
    const client = this.connClients.get(conn);
    this.connClients.delete(conn);
    if (!client) return;
    if (client.conn === conn) {
      client.conn = null;
      this.clients.delete(client.id);
    }
  }

  startReaper(): void {
    if (this.reaper) return;
    const interval = Math.max(1000, Math.floor(this.config.aliveTimeoutMs / 2));
    this.reaper = setInterval(() => {
      const now = Date.now();
      for (const client of this.clients.values()) {
        if (now - client.lastSeen > this.config.aliveTimeoutMs) {
          client.conn?.close();
        }
      }
    }, interval);
  }

  stopReaper(): void {
    if (!this.reaper) return;
    clearInterval(this.reaper);
    this.reaper = null;
  }

  private transmit(msg: SignalMessage): void {
    const dstId = msg.dst;
    if (!dstId) return;

    const dst = this.clients.get(dstId);
    if (dst?.conn) {
      dst.conn.send(JSON.stringify(msg));
      return;
    }

    // No live destination. LEAVE/EXPIRE are fire-and-forget; everything else is
    // held briefly in case the destination is about to connect.
    if (msg.type === MessageType.LEAVE || msg.type === MessageType.EXPIRE) return;
    this.enqueue(dstId, msg);
  }

  private enqueue(dstId: string, msg: SignalMessage): void {
    let queue = this.queues.get(dstId);
    if (!queue) {
      queue = {
        messages: [],
        timer: setTimeout(() => this.expireQueue(dstId), this.config.expireTimeoutMs),
      };
      this.queues.set(dstId, queue);
    }
    queue.messages.push(msg);
  }

  private flushQueue(id: string): void {
    const queue = this.queues.get(id);
    if (!queue) return;
    clearTimeout(queue.timer);
    this.queues.delete(id);

    const client = this.clients.get(id);
    if (!client?.conn) return;
    for (const msg of queue.messages) {
      client.conn.send(JSON.stringify(msg));
    }
  }

  private expireQueue(dstId: string): void {
    const queue = this.queues.get(dstId);
    if (!queue) return;
    this.queues.delete(dstId);

    // Tell each waiting sender that the peer never showed up.
    for (const msg of queue.messages) {
      const src = msg.src ? this.clients.get(msg.src) : undefined;
      src?.conn?.send(JSON.stringify({ type: MessageType.EXPIRE, src: dstId, dst: msg.src }));
    }
  }

  private fail(conn: PeerConnection, msg: SignalError): void {
    conn.send(JSON.stringify({ type: MessageType.ERROR, payload: { msg } }));
    conn.close();
  }
}
