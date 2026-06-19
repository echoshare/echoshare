import Peer, { type MediaConnection, type PeerOptions } from "peerjs";

import { buildPeerOptions } from "./peer-config";
import type { IceServerConf, PeerServerConf } from "./types";

export interface PeerHandles {
  peer: Peer | null;
  media: MediaConnection | null;
  stream: MediaStream | null;
}

/** Construct a PeerJS `Peer`, with an explicit room id when provided. */
export function createPeerInstance(uid: string | undefined, options: PeerOptions): Peer {
  return uid ? new Peer(uid, options) : new Peer(options);
}

/**
 * Fully tear down a peer session: detach senders, stop every track, and destroy
 * the media connection and peer. The caller is responsible for nulling its own
 * references afterwards.
 */
export function closePeer(handles: PeerHandles): void {
  const { peer, media, stream } = handles;

  if (media?.peerConnection && stream) {
    for (const track of stream.getTracks()) {
      const sender = media.peerConnection.getSenders().find((s) => s.track?.kind === track.kind);
      if (sender) media.peerConnection.removeTrack(sender);
    }
  }

  if (media) {
    media.removeAllListeners();
    media.peerConnection?.close();
    media.close();
  }

  if (stream) {
    for (const track of stream.getTracks()) track.stop();
  }

  if (peer) {
    peer.removeAllListeners();
    peer.disconnect();
    peer.destroy();
  }
}

/**
 * PeerJS error types that mean the *signaling server* is unreachable (rather
 * than a missing peer), so retrying against a fallback server is worthwhile.
 */
export function isSignalingServerError(type: string): boolean {
  return (
    type === "network" ||
    type === "server-error" ||
    type === "socket-error" ||
    type === "socket-closed" ||
    type === "ssl-unavailable"
  );
}

export interface FailoverPeerError {
  type: string;
  message: string;
}

export interface FailoverPeerConfig {
  /** Room id for the sender; `undefined` lets the server assign one (receiver). */
  uid?: string;
  /** Signaling servers tried in order; a connection failure before `open` advances to the next. */
  servers: PeerServerConf[];
  ice: IceServerConf[];
  /** Attach the flow's success-path handlers and capture the peer reference. Re-invoked on each failover. */
  onPeer: (peer: Peer) => void;
  /** Terminal error: not a failover trigger, or every server has been exhausted. */
  onError: (error: FailoverPeerError) => void;
}

/**
 * Build a `Peer`, transparently failing over to the next signaling server when
 * the current one is unreachable before the connection opens. Once a peer opens
 * (or the list is exhausted) errors are delegated to `onError`.
 */
export function createPeerWithFallback(config: FailoverPeerConfig): void {
  let index = 0;
  let opened = false;

  const build = (): void => {
    const server = config.servers[index]!;
    const peer = createPeerInstance(config.uid, buildPeerOptions(server, config.ice));
    peer.on("open", () => {
      opened = true;
    });
    peer.on("error", (error) => {
      const canFailover = !opened && index < config.servers.length - 1 && isSignalingServerError(error.type);
      if (canFailover) {
        index += 1;
        peer.removeAllListeners();
        peer.destroy();
        build();
        return;
      }
      config.onError(error);
    });
    config.onPeer(peer);
  };

  build();
}
