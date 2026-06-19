import { afterEach, describe, expect, it, vi } from "vitest";

import { PeerServer } from "./server";
import { MessageType, type PeerConnection, type SignalMessage } from "./types";

interface Sink {
  conn: PeerConnection;
  sent: SignalMessage[];
  isClosed: () => boolean;
}

function sink(): Sink {
  const sent: SignalMessage[] = [];
  let closed = false;
  return {
    conn: {
      send: (data) => sent.push(JSON.parse(data) as SignalMessage),
      close: () => {
        closed = true;
      },
    },
    sent,
    isClosed: () => closed,
  };
}

const VALID = { key: "peerjs" };

afterEach(() => {
  vi.useRealTimers();
});

describe("PeerServer registration", () => {
  it("greets a new peer with OPEN", () => {
    const server = new PeerServer();
    const a = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    expect(a.sent).toEqual([{ type: MessageType.OPEN }]);
    expect(server.getClientIds()).toEqual(["a"]);
  });

  it("rejects a missing key/id/token with ERROR and closes", () => {
    const server = new PeerServer();
    const a = sink();
    server.open({ id: "a", token: "", key: VALID.key, conn: a.conn });
    expect(a.sent[0]?.type).toBe(MessageType.ERROR);
    expect(a.isClosed()).toBe(true);
    expect(server.getClientIds()).toEqual([]);
  });

  it("rejects a wrong key with ERROR and closes", () => {
    const server = new PeerServer();
    const a = sink();
    server.open({ id: "a", token: "t1", key: "wrong", conn: a.conn });
    expect(a.sent[0]?.type).toBe(MessageType.ERROR);
    expect(a.isClosed()).toBe(true);
  });

  it("rejects a duplicate id holding a different token with ID-TAKEN", () => {
    const server = new PeerServer();
    const a = sink();
    const b = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    server.open({ id: "a", token: "other", key: VALID.key, conn: b.conn });
    expect(b.sent[0]?.type).toBe(MessageType.ID_TAKEN);
    expect(b.isClosed()).toBe(true);
  });

  it("enforces the concurrent limit", () => {
    const server = new PeerServer({ concurrentLimit: 1 });
    const a = sink();
    const b = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    server.open({ id: "b", token: "t2", key: VALID.key, conn: b.conn });
    expect(b.sent[0]?.type).toBe(MessageType.ERROR);
    expect(b.isClosed()).toBe(true);
  });
});

describe("PeerServer relay", () => {
  it("forwards an OFFER to a connected destination with src injected", () => {
    const server = new PeerServer();
    const a = sink();
    const b = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    server.open({ id: "b", token: "t2", key: VALID.key, conn: b.conn });

    server.message(a.conn, JSON.stringify({ type: MessageType.OFFER, dst: "b", payload: { sdp: "x" } }));

    const relayed = b.sent.find((m) => m.type === MessageType.OFFER);
    expect(relayed).toMatchObject({ type: MessageType.OFFER, src: "a", dst: "b", payload: { sdp: "x" } });
  });

  it("does not relay HEARTBEAT", () => {
    const server = new PeerServer();
    const a = sink();
    const b = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    server.open({ id: "b", token: "t2", key: VALID.key, conn: b.conn });
    b.sent.length = 0;
    server.message(a.conn, JSON.stringify({ type: MessageType.HEARTBEAT }));
    expect(b.sent).toEqual([]);
  });

  it("queues messages for an absent destination and replays them on connect", () => {
    const server = new PeerServer();
    const a = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });

    server.message(a.conn, JSON.stringify({ type: MessageType.OFFER, dst: "b", payload: 1 }));

    const b = sink();
    server.open({ id: "b", token: "t2", key: VALID.key, conn: b.conn });

    const relayed = b.sent.find((m) => m.type === MessageType.OFFER);
    expect(relayed).toMatchObject({ type: MessageType.OFFER, src: "a", dst: "b" });
  });

  it("sends EXPIRE back to the sender when a queued destination never connects", () => {
    vi.useFakeTimers();
    const server = new PeerServer({ expireTimeoutMs: 1000 });
    const a = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    a.sent.length = 0;

    server.message(a.conn, JSON.stringify({ type: MessageType.OFFER, dst: "ghost" }));
    vi.advanceTimersByTime(1001);

    expect(a.sent).toContainEqual({ type: MessageType.EXPIRE, src: "ghost", dst: "a" });
  });
});

describe("PeerServer disconnect", () => {
  it("forgets a client when its socket closes", () => {
    const server = new PeerServer();
    const a = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: a.conn });
    server.close(a.conn);
    expect(server.getClientIds()).toEqual([]);
  });

  it("keeps the client when a stale socket closes after reconnect", () => {
    const server = new PeerServer();
    const first = sink();
    const second = sink();
    server.open({ id: "a", token: "t1", key: VALID.key, conn: first.conn });
    server.open({ id: "a", token: "t1", key: VALID.key, conn: second.conn });
    server.close(first.conn);
    expect(server.getClientIds()).toEqual(["a"]);
  });
});
