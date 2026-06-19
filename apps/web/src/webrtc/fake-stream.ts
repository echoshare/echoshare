import type { ReceiveMode } from "./types";

/**
 * A disabled silent audio track. PeerJS media calls require a stream argument
 * even from the receiver, so the receiver answers/dials with a placeholder.
 */
function createEmptyAudioTrack(): MediaStreamTrack {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const destination = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const [track] = (destination as MediaStreamAudioDestinationNode).stream.getAudioTracks();
  return Object.assign(track!, { enabled: false });
}

/** A disabled 1-frame canvas video track used as a placeholder. */
function createEmptyVideoTrack(width = 640, height = 480): MediaStreamTrack {
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, width, height);
  }
  const [track] = canvas.captureStream().getVideoTracks();
  return Object.assign(track!, { enabled: false });
}

/** Build the placeholder stream the receiver hands to PeerJS, shaped by intent. */
export function createMediaStreamFake(mode: ReceiveMode = 0): MediaStream {
  if (mode === 1) return new MediaStream([createEmptyVideoTrack()]);
  if (mode === 2) return new MediaStream([createEmptyAudioTrack()]);
  return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack()]);
}
