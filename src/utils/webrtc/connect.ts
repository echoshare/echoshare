import { usePeer } from "../../store/peer";
import { debug, log } from "../console";
import Peer, { MediaConnection, PeerOptions } from "peerjs";

export function createPeerInstanceByMode(uid?: string) {
    const PeerStore = usePeer();
    const iceServers = PeerStore.getIceServers;
    const hasIceServer = iceServers && iceServers.length > 0;

    switch (PeerStore.peerModeIndex) {
        case 0:
            return hasIceServer
                ? createPeerInstanceOnlySTUN(iceServers, uid)
                : createPeerInstanceByDefault(uid);
        default:
            return hasIceServer
                ? createPeerInstanceBothPeerServerAndSTUN(
                      PeerStore.getServerConf,
                      iceServers,
                      uid
                  )
                : createPeerInstanceOnlyPeerServer(
                      PeerStore.getServerConf,
                      uid
                  );
    }
}

const smartCreatePeer = (params: {
    uid?: string;
    options?: PeerOptions
}) => {
    if (params.uid && params.options) {
        return new Peer(params.uid, params.options);
    } else if (params.options) {
        return new Peer(params.options);
    } else if (params.uid) {
        return new Peer(params.uid);
    } else {
        return new Peer();
    }
};

function createPeerInstanceByDefault(uid?: string) {
    log.info("Prepare to create Peer", "Enable public node server");
    return smartCreatePeer({ uid });
}

function createPeerInstanceOnlySTUN(
    iceServers: Array<{ urls: string; credential?: string }>,
    uid?: string
) {
    log.info("Prepare to create Peer", "Enable custom STUN/TURN server");
    debug("Please check configuration", iceServers);
    return smartCreatePeer({
        uid,
        options: {
            config: { iceServers },
        },
    });
}

function createPeerInstanceOnlyPeerServer(
    serverConf: { host: string; port: number; path: string },
    uid?: string
) {
    log.info("Prepare to create Peer", "Enable custom node server");
    debug("Please check configuration", serverConf);
    return smartCreatePeer({
        uid,
        options: serverConf,
    });
}

function createPeerInstanceBothPeerServerAndSTUN(
    serverConf: { host: string; port: number; path: string },
    iceServers: Array<{ urls: string; credential?: string }>,
    uid?: string
) {
    log.info(
        "Prepare to create Peer",
        "Enable custom node server + STUN/TURN server"
    );

    debug("Please check configuration", serverConf, iceServers);
    return smartCreatePeer({
        uid,
        options: {
            ...serverConf,
            config: {
                iceServers,
            },
        },
    });
}

export function closePeer(
    peer: null | Peer,
    media: null | MediaConnection,
    stream: null | MediaStream
) {
    if (media && media.peerConnection && stream) {
        stream.getVideoTracks().forEach((track) => {
            const sender = media?.peerConnection
                .getSenders()
                .find((s) => s && s.track && s.track.kind == track.kind);

            if (sender) {
                media?.peerConnection.removeTrack(sender);
                sender.track?.id &&
                    log.warning("Destroyed", "video track " + sender.track?.id);
            }
        });

        stream.getAudioTracks().forEach((track) => {
            const sender = media?.peerConnection
                .getSenders()
                .find((s) => s && s.track && s.track.kind == track.kind);

            if (sender) {
                media?.peerConnection.removeTrack(sender);
                sender.track?.id &&
                    log.warning("Destory", "audio track " + sender.track?.id);
            }
        });

        media.close();
        log.warning("Destroyed", "MediaConnection");
    }

    if (stream) {
        stream.getTracks().forEach((track) => {
            track.stop();
        });

        log.warning("Destroyed", "MediaStream");
    }

    if (peer) {
        peer.disconnect();
        peer.destroy();
        log.warning("Destroyed", "Peer instance");
    }

    peer = null;
    media = null;
    stream = null;
}

