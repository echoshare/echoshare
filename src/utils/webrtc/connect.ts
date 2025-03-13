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

const smartCreatePeer = (params: { uid?: string; options?: PeerOptions }) => {
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
    log.info("准备创建 Peer", "启用公用节点服务器配置");
    return smartCreatePeer({ uid });
}

function createPeerInstanceOnlySTUN(
    iceServers: Array<{ urls: string; credential?: string }>,
    uid?: string
) {
    log.info("准备创建 Peer", "启用 STUN/TURN 服务器配置");
    debug("请检查配置信息", iceServers);
    return smartCreatePeer({
        uid,
        options: {
            config: { iceServers },
        },
    });
}

function createPeerInstanceOnlyPeerServer(
    serverConf: { url: string; port: number; path: string },
    uid?: string
) {
    log.info("准备创建 Peer", "启用自定义节点服务器配置");
    debug("请检查配置信息", serverConf);
    return smartCreatePeer({
        uid,
        options: serverConf,
    });
}

function createPeerInstanceBothPeerServerAndSTUN(
    serverConf: { url: string; port: number; path: string },
    iceServers: Array<{ urls: string; credential?: string }>,
    uid?: string
) {
    log.info("准备创建 Peer", "启用 自定义节点服务器 + STUN/TURN 服务器配置");

    debug("请检查配置信息", serverConf, iceServers);
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
                sender.track?.id && log.warning("已销毁", "video track " + sender.track?.id);
            }
        });

        stream.getAudioTracks().forEach((track) => {
            const sender = media?.peerConnection
                .getSenders()
                .find((s) => s && s.track && s.track.kind == track.kind);

            if (sender) {
                media?.peerConnection.removeTrack(sender);
                sender.track?.id && log.warning("已销毁", "audio track " + sender.track?.id);
            }
        });

        media.close();
        log.warning("已销毁", "MediaConnection");
    }

    if (stream) {
        stream.getTracks().forEach((track) => {
            track.stop();
        });

        log.warning("已销毁", "MediaStream");
    }

    if (peer) {
        peer.disconnect();
        peer.destroy();
        log.warning("已销毁", "Peer 实例");
    }

    peer = null;
    media = null;
    stream = null;
}

// export function createPeerInstance(uid?: string, failedTimes = 0) {
//     const PeerStore = usePeer();
//     const iceServers = PeerStore.getIceServers;
//     const hasIceServer = iceServers && iceServers.length > 0;

//     if (!PeerStore.enableSmartSTUN) {
//         log.info("智能 STUN/TURN", "已禁用");
//         return createPeerInstanceByMode(uid);
//     }

//     if (!hasIceServer) {
//         log.info("智能 STUN/TURN", "未配置 STUN/TURN 服务器，自动禁用");
//         return createPeerInstanceByMode(uid);
//     }

//     log.info("智能 STUN/TURN", "已启用");
//     if (failedTimes === 0) {
//         log.info("智能 STUN/TURN", "首次连接不使用 STUN/TURN 服务器");
//         return PeerStore.peerModeIndex === 0
//             ? createPeerInstanceByDefault(uid)
//             : createPeerInstanceOnlyPeerServer(PeerStore.getServerConf, uid);
//     } else {
//         log.info(
//             "智能 STUN/TURN",
//             "第 " + failedTimes + " 次尝试使用 STUN/TURN 服务器"
//         );
//         return PeerStore.peerModeIndex === 0
//             ? createPeerInstanceOnlySTUN(iceServers, uid)
//             : createPeerInstanceBothPeerServerAndSTUN(
//                   PeerStore.getServerConf,
//                   iceServers,
//                   uid
//               );
//     }
// }
