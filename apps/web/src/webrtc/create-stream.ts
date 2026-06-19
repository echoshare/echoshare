import { combineAudioStream } from "./combine";
import type { MediaMode } from "./types";

export type CaptureFailureReason = "denied" | "notfound" | "inuse" | "constraints" | "unsupported" | "unknown";

export interface PermissionResult {
  ok: boolean;
  error?: CaptureFailureReason;
}

/**
 * Map a `getUserMedia`/`getDisplayMedia` rejection to a stable, localizable
 * reason. Covers the legacy DOMException aliases (`PermissionDeniedError`,
 * `DevicesNotFoundError`, `TrackStartError`, `ConstraintNotSatisfiedError`).
 */
export function classifyCaptureError(error: unknown): CaptureFailureReason {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "notfound";
  if (name === "NotReadableError" || name === "TrackStartError") return "inuse";
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") return "constraints";
  return "unknown";
}

export interface StreamOptions {
  mediaMode: MediaMode;
  audioDeviceId?: string;
  videoDeviceId?: string;
}

/**
 * Resolve a track request into a `getUserMedia` constraint: `false` omits the
 * track, `true` requests the browser's default device, and an object pins a
 * specific device. Returning `false` for an allowed-but-unspecified device was
 * the cause of "At least one of audio and video must be requested".
 */
export function deviceConstraint(allow: boolean, deviceId: string | undefined): MediaTrackConstraints | boolean {
  if (!allow) return false;
  if (deviceId && deviceId.length > 0) return { deviceId: { exact: deviceId } };
  return true;
}

/**
 * Pre-flight a `getUserMedia` call to trigger the permission prompt early and
 * surface a localizable reason. Tracks are stopped immediately — this only
 * primes permissions, it does not keep a stream.
 */
export async function requestDevicePermissions(): Promise<PermissionResult> {
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, error: "unsupported" };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    for (const track of stream.getTracks()) track.stop();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: classifyCaptureError(error) };
  }
}

async function createScreenStream(opts: StreamOptions): Promise<MediaStream> {
  const { mediaMode, audioDeviceId } = opts;
  const videoStream = await navigator.mediaDevices.getDisplayMedia({
    video: mediaMode.useScreen && {
      width: { ideal: window.screen.width },
      height: { ideal: window.screen.height },
      frameRate: { ideal: 120 },
    },
    audio: mediaMode.useAudio,
  });

  if (!mediaMode.useMicrophone) return videoStream;

  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: deviceConstraint(mediaMode.useMicrophone, audioDeviceId),
  });
  const mixed = combineAudioStream([videoStream, micStream]);
  return new MediaStream([...videoStream.getVideoTracks(), ...mixed.getAudioTracks()]);
}

async function createCameraStream(opts: StreamOptions): Promise<MediaStream> {
  const { mediaMode, audioDeviceId, videoDeviceId } = opts;
  const cameraStream = await navigator.mediaDevices.getUserMedia({
    audio: deviceConstraint(mediaMode.useMicrophone, audioDeviceId),
    video: deviceConstraint(mediaMode.useCamera, videoDeviceId),
  });

  if (!mediaMode.useAudio) return cameraStream;

  const systemAudio = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  const mixed = combineAudioStream([cameraStream, systemAudio]);
  return new MediaStream([...cameraStream.getVideoTracks(), ...mixed.getAudioTracks()]);
}

/** Capture a media stream per the selected mode (screen vs camera, with optional audio mixing). */
export function createStream(opts: StreamOptions): Promise<MediaStream> {
  return opts.mediaMode.useScreen ? createScreenStream(opts) : createCameraStream(opts);
}
