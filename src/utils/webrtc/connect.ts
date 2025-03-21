import { Ref } from "vue";
import { usePeer } from "../../store/peer";
import { debug, log } from "../console";
import Peer, { MediaConnection, PeerOptions } from "peerjs";
import { resolvePeerServerURL } from "..";

export function createPeerInstanceByMode(uid?: string, peerServerURL?: string) {
    debug(["createPeerInstanceByMode", uid, peerServerURL]);
    const PeerStore = usePeer();
    const iceServers = PeerStore.iceServerConf; // PeerStore.getIceServers;
    const hasIceServer = iceServers && iceServers.length > 0;

    let peerServer = PeerStore.getServerConf;

    let mode = PeerStore.peerModeIndex;

    if (peerServerURL && peerServerURL.startsWith("http")) {
        mode = 1;
        debug(
            "peer server url has been changed due to url params",
            peerServerURL
        );
        peerServer = resolvePeerServerURL(peerServerURL);
    }

    debug(["Peer mode", mode]);
    debug(["Peer server", iceServers]);

    switch (mode) {
        case 0:
            return hasIceServer
                ? createPeerInstanceOnlySTUN(iceServers, uid)
                : createPeerInstanceByDefault(uid);
        default:
            return hasIceServer
                ? createPeerInstanceBothPeerServerAndSTUN(
                      peerServer,
                      iceServers,
                      uid
                  )
                : createPeerInstanceOnlyPeerServer(peerServer, uid);
    }
}

const createSmartPeerInstance = (params: { uid?: string; options?: PeerOptions }) => {
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
    return createSmartPeerInstance({ uid });
}

function createPeerInstanceOnlySTUN(
    iceServers: Array<{ urls: string; credential?: string }>,
    uid?: string
) {
    log.info("Prepare to create Peer", "Enable custom STUN/TURN server");
    debug(["Please check configuration", iceServers]);
    return createSmartPeerInstance({
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

    debug(["Please check configuration", serverConf]);
    return createSmartPeerInstance({
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

    debug(["Please check configuration", serverConf, iceServers]);
    return createSmartPeerInstance({
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
    peer: Ref<null | Peer>,
    media: Ref<null | MediaConnection>,
    stream: Ref<null | MediaStream>
) {
    if (media.value && media.value?.peerConnection && stream.value) {
        stream.value.getVideoTracks().forEach((track) => {
            const sender = media.value?.peerConnection
                ?.getSenders()
                ?.find((s) => s && s.track && s.track?.kind == track?.kind);

            if (sender) {
                media.value?.peerConnection?.removeTrack(sender);
                sender.track?.id &&
                    log.warning("Destroyed", "video track " + sender.track?.id);
            }
        });

        stream.value.getAudioTracks().forEach((track) => {
            const sender = media.value?.peerConnection
                ?.getSenders()
                ?.find((s) => s && s?.track && s?.track?.kind == track.kind);

            if (sender) {
                media.value?.peerConnection?.removeTrack(sender);
                sender.track?.id &&
                    log.warning("Destory", "audio track " + sender.track?.id);
            }
        });
    }

    if (media.value) {
        media.value.removeAllListeners();
        media.value.peerConnection?.close();
        media.value.dataChannel?.close();
        media.value.close();
        log.warning("Destroyed", "MediaConnection");
    }

    if (stream.value) {
        stream.value.getTracks().forEach((track) => {
            track.stop();
        });

        log.warning("Destroyed", "MediaStream");
    }

    if (peer.value) {
        peer.value.removeAllListeners();
        peer.value.disconnect();
        peer.value.destroy();
        log.warning("Destroyed", "Peer instance");
    }

    peer.value = null;
    media.value = null;
    stream.value = null;
}
