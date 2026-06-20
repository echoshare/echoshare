import { useCallback, useEffect, useRef, useState } from "react";

import Peer, { type MediaConnection } from "peerjs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useHistoryStore } from "@/store/history";
import { getMediaMode, usePeerStore } from "@/store/peer";
import { sendWebhook, useWebhookStore } from "@/store/webhook";
import { closePeer, createPeerWithFallback } from "@/webrtc/connect";
import { classifyCaptureError, createStream } from "@/webrtc/create-stream";
import { isIOS, isSecureWebRTCContext } from "@/webrtc/device";
import { sdpEdit } from "@/webrtc/h265";
import { parseIceServers, PUBLIC_PEER_SERVER, resolvePeerServerURL } from "@/webrtc/peer-config";
import { applySenderQuality, qualityProfileFor, tuneSdpQuality, type SdpQualityOptions } from "@/webrtc/quality";

export type ShareStatus = "idle" | "requesting" | "live";

export interface ShareSession {
  status: ShareStatus;
  roomId: string;
  viewers: number;
  start: () => Promise<void>;
  stop: () => void;
}

export function useShare(): ShareSession {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [roomId, setRoomId] = useState("");
  const [viewers, setViewers] = useState(0);

  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Set<MediaConnection>>(new Set());

  const stop = useCallback(() => {
    callsRef.current.clear();
    closePeer({ peer: peerRef.current, media: null, stream: streamRef.current });
    peerRef.current = null;
    streamRef.current = null;
    setViewers(0);
    setRoomId("");
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (peerRef.current) return;
    if (!isSecureWebRTCContext()) {
      toast.error(t("toast.insecureContext"));
      return;
    }

    const settings = usePeerStore.getState();
    const mediaMode = getMediaMode(settings.mediaModeValue);
    setStatus("requesting");

    let stream: MediaStream;
    try {
      stream = await createStream({
        mediaMode,
        audioDeviceId: settings.audioDeviceId,
        videoDeviceId: settings.videoDeviceId,
      });
    } catch (error) {
      setStatus("idle");
      console.error("[echoshare] media capture failed", error);
      const reason = classifyCaptureError(error);
      const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      toast.error(t(`toast.capture.${reason}`), { description: detail });
      return;
    }
    streamRef.current = stream;

    const primary = resolvePeerServerURL(settings.serverURL);
    const servers = primary.host === PUBLIC_PEER_SERVER.host ? [primary] : [primary, PUBLIC_PEER_SERVER];
    const uid = settings.customUID.trim() || stream.id;
    const profile = qualityProfileFor(mediaMode);
    const sdpQuality: SdpQualityOptions = {
      videoBitrateKbps: Math.round(profile.videoBitrateBps / 1000),
      audioBitrateBps: profile.audioBitrateBps,
      stereo: true,
    };
    const transform = (sdp: string) => tuneSdpQuality(sdpEdit(sdp, settings.videoFormat, isIOS()), sdpQuality);

    const bind = (peer: Peer) => {
      peerRef.current = peer;

      peer.on("open", (id) => {
        setRoomId(id);
        setStatus("live");
        useHistoryStore.getState().add({ uid: id, timestamp: Date.now(), action: "share", result: "success" });
        void sendWebhook(useWebhookStore.getState(), "success", { action: "share", uid: id });
      });

      // Sender answers every incoming viewer with the same stream.
      peer.on("call", (call) => {
        call.answer(stream, { sdpTransform: transform });
        void applySenderQuality(call.peerConnection, profile);
        callsRef.current.add(call);
        setViewers(callsRef.current.size);
        const drop = () => {
          callsRef.current.delete(call);
          setViewers(callsRef.current.size);
        };
        call.on("close", drop);
        call.on("error", drop);
      });
    };

    createPeerWithFallback({
      uid,
      servers,
      ice: parseIceServers(settings.iceServers),
      onPeer: bind,
      onError: (err) => {
        toast.error(t("toast.peerError", { message: err.message }));
        useHistoryStore.getState().add({ uid, timestamp: Date.now(), action: "share", result: "fail" });
        void sendWebhook(useWebhookStore.getState(), "fail", { action: "share", uid, error: err.message });
        stop();
      },
    });

    // The browser's own "Stop sharing" control ends the capture track.
    const [videoTrack] = stream.getVideoTracks();
    videoTrack?.addEventListener("ended", stop, { once: true });
  }, [t, stop]);

  useEffect(() => () => stop(), [stop]);

  return { status, roomId, viewers, start, stop };
}
