/** WebRTC capture configuration shared by the sender flow. */
export interface MediaMode {
  value: number;
  label: string;
  /** Capture the screen via `getDisplayMedia`. */
  useScreen: boolean;
  /** Capture a camera via `getUserMedia`. */
  useCamera: boolean;
  /** Capture system/tab audio. */
  useAudio: boolean;
  /** Capture microphone audio. */
  useMicrophone: boolean;
}

export type VideoFormat = "H264" | "H265" | "H266" | "AV1" | "VP8" | "VP9";

/** Receiver intent: 0 = video + audio, 1 = video only, 2 = audio only. */
export type ReceiveMode = 0 | 1 | 2;

/** Parsed PeerJS signaling-server coordinates fed to the `Peer` constructor. */
export interface PeerServerConf {
  host: string;
  port: number;
  path: string;
  secure: boolean;
  key?: string;
}

/** A STUN/TURN server entry for `RTCPeerConnection`. */
export interface IceServerConf {
  urls: string;
  username?: string;
  credential?: string;
}
