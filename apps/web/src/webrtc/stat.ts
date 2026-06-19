/**
 * Live WebRTC inbound-video metrics, extracted from `RTCPeerConnection.getStats()`.
 * Field keys are stable, English, and i18n-translated at the UI (`stat.*`).
 */
export interface StatSnapshot {
  timestamp: number;
  codec?: string;
  frameWidth?: number;
  frameHeight?: number;
  framesPerSecond?: number;
  framesDecoded?: number;
  framesDropped?: number;
  packetsReceived?: number;
  packetsLost?: number;
  jitter?: number;
  bitrateKbps?: number;
  roundTripTimeMs?: number;
}

/** Carries the previous byte/time reading so bitrate can be derived from the delta. */
export interface InboundCarry {
  bytesReceived: number;
  timestamp: number;
}

export interface CollectResult {
  snapshot: StatSnapshot;
  carry?: InboundCarry;
}

export interface InspectRow {
  key: string;
  value: string | number;
}

// The getStats() dictionaries are dynamic; we read only the documented subset.
interface VideoInboundStat {
  kind?: string;
  bytesReceived?: number;
  packetsReceived?: number;
  packetsLost?: number;
  framesDecoded?: number;
  framesDropped?: number;
  framesPerSecond?: number;
  frameWidth?: number;
  frameHeight?: number;
  jitter?: number;
  codecId?: string;
  timestamp: number;
}
interface CandidatePairStat {
  currentRoundTripTime?: number;
}
interface CodecStat {
  mimeType?: string;
}

export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Reduce a stats report to a video snapshot, deriving bitrate from `prev`. */
export function collectStats(report: RTCStatsReport, prev?: InboundCarry): CollectResult {
  const snapshot: StatSnapshot = { timestamp: Date.now() };
  let carry: InboundCarry | undefined;

  report.forEach((value) => {
    const stat = value as RTCStats;

    if (stat.type === "inbound-rtp") {
      const inbound = stat as unknown as VideoInboundStat;
      if (inbound.kind !== "video") return;

      snapshot.frameWidth = inbound.frameWidth;
      snapshot.frameHeight = inbound.frameHeight;
      snapshot.framesPerSecond = inbound.framesPerSecond;
      snapshot.framesDecoded = inbound.framesDecoded;
      snapshot.framesDropped = inbound.framesDropped;
      snapshot.packetsReceived = inbound.packetsReceived;
      snapshot.packetsLost = inbound.packetsLost;
      snapshot.jitter = inbound.jitter;

      if (typeof inbound.bytesReceived === "number") {
        carry = { bytesReceived: inbound.bytesReceived, timestamp: inbound.timestamp };
        if (prev && inbound.timestamp > prev.timestamp) {
          const kbps = (8 * (inbound.bytesReceived - prev.bytesReceived)) / (inbound.timestamp - prev.timestamp);
          snapshot.bitrateKbps = Math.max(0, Math.round(kbps));
        }
      }

      if (inbound.codecId) {
        const codec = report.get(inbound.codecId) as CodecStat | undefined;
        snapshot.codec = codec?.mimeType;
      }
    } else if (stat.type === "candidate-pair") {
      const pair = stat as unknown as CandidatePairStat;
      if (typeof pair.currentRoundTripTime === "number") {
        snapshot.roundTripTimeMs = Math.round(pair.currentRoundTripTime * 1000);
      }
    }
  });

  return { snapshot, carry };
}

const SNAPSHOT_FIELDS: { key: string; pick: (s: StatSnapshot) => string | number | undefined }[] = [
  { key: "codec", pick: (s) => s.codec },
  { key: "resolution", pick: (s) => (s.frameWidth && s.frameHeight ? `${s.frameWidth} x ${s.frameHeight}` : undefined) },
  { key: "fps", pick: (s) => s.framesPerSecond },
  { key: "bitrate", pick: (s) => (s.bitrateKbps === undefined ? undefined : `${s.bitrateKbps} kbps`) },
  { key: "framesDecoded", pick: (s) => s.framesDecoded },
  { key: "framesDropped", pick: (s) => s.framesDropped },
  { key: "packetsReceived", pick: (s) => s.packetsReceived },
  { key: "packetsLost", pick: (s) => s.packetsLost },
  { key: "jitter", pick: (s) => s.jitter },
  { key: "rtt", pick: (s) => (s.roundTripTimeMs === undefined ? undefined : `${s.roundTripTimeMs} ms`) },
];

/** Flatten a snapshot to displayable rows, dropping fields that are absent. */
export function snapshotRows(snapshot: StatSnapshot | null): InspectRow[] {
  if (!snapshot) return [];
  const rows: InspectRow[] = [];
  for (const field of SNAPSHOT_FIELDS) {
    const value = field.pick(snapshot);
    if (value !== undefined && value !== "") rows.push({ key: field.key, value });
  }
  return rows;
}
