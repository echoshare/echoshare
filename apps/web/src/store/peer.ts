import { env } from "@echoshare-v2/env/web";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MediaMode, ReceiveMode, VideoFormat } from "@/webrtc/types";

/** Capture presets offered in the sender UI. `label` is an i18n key suffix. */
export const MEDIA_MODES: MediaMode[] = [
  { value: 0, label: "screenAudioMic", useScreen: true, useCamera: false, useAudio: true, useMicrophone: true },
  { value: 1, label: "screenAudio", useScreen: true, useCamera: false, useAudio: true, useMicrophone: false },
  { value: 2, label: "screenOnly", useScreen: true, useCamera: false, useAudio: false, useMicrophone: false },
  { value: 3, label: "cameraMic", useScreen: false, useCamera: true, useAudio: false, useMicrophone: true },
  { value: 4, label: "cameraSystemAudio", useScreen: false, useCamera: true, useAudio: true, useMicrophone: false },
  { value: 5, label: "cameraOnly", useScreen: false, useCamera: true, useAudio: false, useMicrophone: false },
];

export const VIDEO_FORMATS: VideoFormat[] = ["H264", "H265", "H266", "AV1", "VP8", "VP9"];

export function getMediaMode(value: number): MediaMode {
  return MEDIA_MODES.find((mode) => mode.value === value) ?? MEDIA_MODES[0]!;
}

/** Persisted user configuration for both sender and receiver flows. */
export interface PeerSettings {
  /** Room id the receiver dials. */
  targetUID: string;
  /** Optional fixed room id the sender advertises (else the stream id is used). */
  customUID: string;
  audioDeviceId: string;
  videoDeviceId: string;
  mediaModeValue: number;
  receiveMode: ReceiveMode;
  autoTryPlay: boolean;
  autoRefetch: boolean;
  /** Signaling server URL (parsed into PeerJS coordinates). */
  serverURL: string;
  /** Raw ICE server lines, parsed by `parseIceServers`. */
  iceServers: string[];
  videoFormat: VideoFormat;
}

interface PeerStore extends PeerSettings {
  patch: (partial: Partial<PeerSettings>) => void;
}

export const usePeerStore = create<PeerStore>()(
  persist(
    (set) => ({
      targetUID: "",
      customUID: "",
      audioDeviceId: "",
      videoDeviceId: "",
      mediaModeValue: 0,
      receiveMode: 0,
      autoTryPlay: false,
      autoRefetch: false,
      serverURL: env.VITE_SIGNALING_URL,
      iceServers: [],
      videoFormat: "H264",
      patch: (partial) => set(partial),
    }),
    {
      name: "ECHOSHARE_PEER",
      partialize: ({ patch: _patch, ...settings }) => settings,
    },
  ),
);
