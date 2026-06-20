import { useCallback, useEffect, useRef, useState } from "react";

import Peer, { type MediaConnection } from "peerjs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useHistoryStore } from "@/store/history";
import { usePeerStore } from "@/store/peer";
import { sendWebhook, useWebhookStore } from "@/store/webhook";
import { WebRTCAnalysis } from "@/webrtc/analysis";
import { closePeer, createPeerWithFallback } from "@/webrtc/connect";
import { isIOS, isSecureWebRTCContext } from "@/webrtc/device";
import { createMediaStreamFake } from "@/webrtc/fake-stream";
import { sdpEdit } from "@/webrtc/h265";
import { parseIceServers, PUBLIC_PEER_SERVER, resolvePeerServerURL } from "@/webrtc/peer-config";
import { RECEIVE_QUALITY, tuneSdpQuality } from "@/webrtc/quality";
import type { StatSnapshot } from "@/webrtc/stat";

export type ReceiveStatus = "idle" | "connecting" | "playing";

export interface ReceiveOptions {
  /** Force autoplay regardless of the user setting (used by the fullscreen view). */
  autoplayDefault?: boolean;
}

export interface ReceiveSession {
  status: ReceiveStatus;
  targetId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  analysis: WebRTCAnalysis;
  stats: StatSnapshot | null;
  start: (target?: string) => void;
  stop: () => void;
  play: () => void;
  muted: boolean;
  unmute: () => void;
}

export function useReceive(options?: ReceiveOptions): ReceiveSession {
  const { t } = useTranslation();
  const autoplayDefault = options?.autoplayDefault ?? false;

  const [status, setStatus] = useState<ReceiveStatus>("idle");
  const [targetId, setTargetId] = useState("");
  const [stats, setStats] = useState<StatSnapshot | null>(null);
  const [muted, setMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const targetRef = useRef("");
  const monitorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analysisRef = useRef<WebRTCAnalysis | null>(null);
  const analysis = (analysisRef.current ??= new WebRTCAnalysis());

  const stop = useCallback(() => {
    if (monitorRef.current) {
      clearInterval(monitorRef.current);
      monitorRef.current = null;
    }
    closePeer({ peer: peerRef.current, media: callRef.current, stream: streamRef.current });
    peerRef.current = null;
    callRef.current = null;
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    analysis.reset();
    setStats(null);
    setMuted(false);
    setStatus("idle");
  }, [analysis]);

  const attemptPlay = useCallback(async (video: HTMLVideoElement) => {
    video.muted = false;
    try {
      await video.play();
      setMuted(false);
    } catch {
      // Browsers block unmuted autoplay without a user gesture. Fall back to muted
      // playback so the picture is visible, and surface an unmute control.
      video.muted = true;
      setMuted(true);
      await video.play().catch(() => undefined);
    }
  }, []);

  const play = useCallback(() => {
    if (videoRef.current) void attemptPlay(videoRef.current);
  }, [attemptPlay]);

  const unmute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    void video.play().catch(() => undefined);
  }, []);

  const start = useCallback(
    (target?: string) => {
      const settings = usePeerStore.getState();
      const resolved = (target ?? settings.targetUID).trim();
      if (!resolved) {
        toast.error(t("toast.missingTarget"));
        return;
      }
      if (!isSecureWebRTCContext()) {
        toast.error(t("toast.insecureContext"));
        return;
      }

      if (peerRef.current) stop();
      targetRef.current = resolved;
      setTargetId(resolved);
      setStatus("connecting");

      const primary = resolvePeerServerURL(settings.serverURL);
      const servers = primary.host === PUBLIC_PEER_SERVER.host ? [primary] : [primary, PUBLIC_PEER_SERVER];

      const transform = (sdp: string) => tuneSdpQuality(sdpEdit(sdp, settings.videoFormat, isIOS()), RECEIVE_QUALITY);

      const dial = () => {
        const active = peerRef.current;
        if (!active) return;
        const placeholder = createMediaStreamFake(settings.receiveMode);
        const call = active.call(targetRef.current, placeholder, { sdpTransform: transform });
        callRef.current = call;
        call.on("stream", (remote) => {
          streamRef.current = remote;
          if (videoRef.current) {
            videoRef.current.srcObject = remote;
            void attemptPlay(videoRef.current);
          }
          setStatus("playing");
          useHistoryStore.getState().add({ uid: targetRef.current, timestamp: Date.now(), action: "receive", result: "success" });
          void sendWebhook(useWebhookStore.getState(), "success", { action: "receive", uid: targetRef.current });
          toast.success(t("toast.streamReceived"));
        });
      };

      createPeerWithFallback({
        servers,
        ice: parseIceServers(settings.iceServers),
        onPeer: (peer) => {
          peerRef.current = peer;
          peer.on("open", dial);
        },
        onError: (err) => {
          toast.error(t("toast.peerError", { message: err.message }));
          useHistoryStore.getState().add({ uid: targetRef.current, timestamp: Date.now(), action: "receive", result: "fail" });
          void sendWebhook(useWebhookStore.getState(), "fail", { action: "receive", uid: targetRef.current, error: err.message });
        },
      });

      monitorRef.current = setInterval(() => {
        const pc = callRef.current?.peerConnection;
        if (pc) void analysis.run(pc).then(setStats);

        const video = videoRef.current;
        const remote = streamRef.current;
        const live = usePeerStore.getState();
        if ((autoplayDefault || live.autoTryPlay) && video?.srcObject && video.paused) {
          void video.play().catch(() => undefined);
        }
        if (live.autoRefetch && remote && !remote.active) {
          toast.message(t("toast.reconnecting"));
          dial();
        }
      }, 1000);
    },
    [t, stop, analysis, autoplayDefault, attemptPlay],
  );

  useEffect(() => () => stop(), [stop]);

  return { status, targetId, videoRef, analysis, stats, start, stop, play, muted, unmute };
}
