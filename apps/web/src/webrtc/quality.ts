import type { MediaMode } from "./types";

/** Encoder content-hint values understood by browsers (subset of the spec). */
export type EncoderContentHint = "motion" | "detail" | "text";

/**
 * Per-capture encoding targets applied to a sender's RTP senders, capture tracks
 * and SDP. Bitrates are *ceilings* — WebRTC congestion control still adapts the
 * actual send rate below them based on the measured link.
 */
export interface QualityProfile {
  /** Video encoder ceiling, bits per second. */
  videoBitrateBps: number;
  /** Frame-rate ceiling handed to the encoder. */
  maxFramerate: number;
  /** Biases the encoder between spatial detail (screens/text) and motion (camera). */
  contentHint: EncoderContentHint;
  /** What the encoder sacrifices first under bandwidth pressure. */
  degradationPreference: RTCDegradationPreference;
  /** Opus target bitrate, bits per second. */
  audioBitrateBps: number;
}

/** Bandwidth hints written into SDP (`b=AS`/`b=TIAS` + Opus fmtp). */
export interface SdpQualityOptions {
  /** Max video bandwidth advertised on the `m=video` line, kilobits per second. */
  videoBitrateKbps: number;
  /** Opus target written into the audio fmtp, bits per second. */
  audioBitrateBps: number;
  /** Negotiate stereo Opus (`stereo=1`/`sprop-stereo=1`). */
  stereo: boolean;
}

const OPUS_BITRATE_BPS = 128_000;

/** Capture intent the encoder is tuned for. */
type CaptureKind = "screen" | "camera";

/**
 * Encoding profiles per capture intent.
 * - `screen`: static UI/text → spend bits on resolution, stay sharp under load.
 * - `camera`: motion-dominant → keep frame rate smooth, let resolution flex.
 */
const PROFILE_BY_KIND: Record<CaptureKind, QualityProfile> = {
  screen: {
    videoBitrateBps: 12_000_000,
    maxFramerate: 60,
    contentHint: "detail",
    degradationPreference: "maintain-resolution",
    audioBitrateBps: OPUS_BITRATE_BPS,
  },
  camera: {
    videoBitrateBps: 6_000_000,
    maxFramerate: 30,
    contentHint: "motion",
    degradationPreference: "balanced",
    audioBitrateBps: OPUS_BITRATE_BPS,
  },
};

/**
 * Bandwidth a *receiver* advertises it is willing to accept. Generous (above any
 * sender profile) so the receiver's offer never throttles the sender — the
 * sender's own profile/`setParameters` is the binding cap.
 */
export const RECEIVE_QUALITY: SdpQualityOptions = {
  videoBitrateKbps: 16_000,
  audioBitrateBps: OPUS_BITRATE_BPS,
  stereo: true,
};

/** Pick the encoding profile that matches the capture mode. */
export function qualityProfileFor(mode: MediaMode): QualityProfile {
  return PROFILE_BY_KIND[mode.useScreen ? "screen" : "camera"];
}

/**
 * Lift the encoder ceilings on a live sender connection. WebRTC caps video near
 * ~2.5 Mbps by default regardless of the link, which is the dominant cause of
 * soft/blurry remote video; raising `maxBitrate` lets congestion control use the
 * bandwidth actually available. Also pins frame rate, disables resolution
 * down-scaling, and sets the degradation policy. Safe to call right after PeerJS
 * `answer()`/`call()` — tracks are added synchronously.
 */
export async function applySenderQuality(pc: RTCPeerConnection, profile: QualityProfile): Promise<void> {
  const pending: Promise<void>[] = [];
  for (const sender of pc.getSenders()) {
    const kind = sender.track?.kind;
    if (kind === "video") pending.push(applyVideoSenderParams(sender, profile));
    else if (kind === "audio") pending.push(applyAudioSenderParams(sender, profile));
  }
  await Promise.all(pending);
}

async function applyVideoSenderParams(sender: RTCRtpSender, profile: QualityProfile): Promise<void> {
  const params = sender.getParameters();
  const encodings = params.encodings.length > 0 ? params.encodings : [{}];
  for (const encoding of encodings) {
    encoding.maxBitrate = profile.videoBitrateBps;
    encoding.maxFramerate = profile.maxFramerate;
    encoding.scaleResolutionDownBy = 1;
  }
  params.encodings = encodings;
  params.degradationPreference = profile.degradationPreference;
  await sender.setParameters(params);
}

async function applyAudioSenderParams(sender: RTCRtpSender, profile: QualityProfile): Promise<void> {
  const params = sender.getParameters();
  const encodings = params.encodings.length > 0 ? params.encodings : [{}];
  for (const encoding of encodings) encoding.maxBitrate = profile.audioBitrateBps;
  params.encodings = encodings;
  await sender.setParameters(params);
}

/**
 * Inject the bandwidth + Opus quality hints that `setParameters` cannot express
 * in SDP: the `b=AS`/`b=TIAS` ceilings (honoured by Safari/Firefox, where
 * `setParameters(maxBitrate)` is partially ignored) and stereo / high-bitrate
 * Opus fmtp. Codec ordering is handled separately by `sdpEdit`. Idempotent.
 */
export function tuneSdpQuality(sdp: string, options: SdpQualityOptions): string {
  if (!sdp) return sdp;
  const withBandwidth = applyVideoBandwidth(sdp.split("\r\n"), options.videoBitrateKbps);
  const withOpus = applyOpusQuality(withBandwidth, options.audioBitrateBps, options.stereo);
  return withOpus.join("\r\n");
}

/** Index of the next `m=` line after `from`, or the array length when none. */
function nextMediaIndex(lines: string[], from: number): number {
  for (let i = from + 1; i < lines.length; i += 1) {
    if (lines[i]!.startsWith("m=")) return i;
  }
  return lines.length;
}

/** Replace the `m=video` section's bandwidth lines with `b=AS`/`b=TIAS` after `c=`. */
function applyVideoBandwidth(lines: string[], kbps: number): string[] {
  const start = lines.findIndex((line) => line.startsWith("m=video"));
  if (start === -1) return lines;

  const end = nextMediaIndex(lines, start);
  const section = lines.slice(start, end).filter((line) => !line.startsWith("b="));
  const cIndex = section.findIndex((line) => line.startsWith("c="));
  if (cIndex === -1) return lines;

  section.splice(cIndex + 1, 0, `b=AS:${kbps}`, `b=TIAS:${kbps * 1000}`);
  return [...lines.slice(0, start), ...section, ...lines.slice(end)];
}

/** Add/strengthen the Opus fmtp line with stereo + a high average bitrate. */
function applyOpusQuality(lines: string[], bitrateBps: number, stereo: boolean): string[] {
  const rtpmap = lines.find((line) => /^a=rtpmap:\d+ opus\//i.test(line));
  const codecId = rtpmap?.match(/^a=rtpmap:(\d+)/)?.[1];
  if (!rtpmap || !codecId) return lines;

  const additions = [
    `maxaveragebitrate=${bitrateBps}`,
    "useinbandfec=1",
    ...(stereo ? ["stereo=1", "sprop-stereo=1"] : []),
  ];

  const result = [...lines];
  const fmtpIndex = result.findIndex((line) => line.startsWith(`a=fmtp:${codecId}`));
  if (fmtpIndex === -1) {
    result.splice(result.indexOf(rtpmap) + 1, 0, `a=fmtp:${codecId} ${additions.join(";")}`);
    return result;
  }
  result[fmtpIndex] = mergeFmtp(result[fmtpIndex]!, additions);
  return result;
}

/** Merge fmtp parameters, overriding any keys present in `additions`. */
function mergeFmtp(line: string, additions: string[]): string {
  const space = line.indexOf(" ");
  if (space === -1) return `${line} ${additions.join(";")}`;

  const overridden = new Set(additions.map((entry) => entry.split("=")[0]));
  const kept = line
    .slice(space + 1)
    .split(";")
    .filter((entry) => entry.length > 0 && !overridden.has(entry.split("=")[0]));
  return `${line.slice(0, space)} ${[...kept, ...additions].join(";")}`;
}
