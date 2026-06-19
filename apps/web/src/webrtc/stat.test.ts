import { describe, expect, it } from "vitest";

import { collectStats, snapshotRows } from "./stat";

function makeReport(entries: Record<string, Record<string, unknown>>): RTCStatsReport {
  // A Map satisfies the forEach/get surface collectStats uses.
  return new Map(Object.entries(entries)) as unknown as RTCStatsReport;
}

const inbound = (overrides: Record<string, unknown>) => ({
  id: "in",
  type: "inbound-rtp",
  kind: "video",
  codecId: "codecV",
  ...overrides,
});

describe("collectStats", () => {
  it("extracts video metrics, codec mime type and rtt", () => {
    const report = makeReport({
      in: inbound({ bytesReceived: 1000, timestamp: 1000, packetsReceived: 10, packetsLost: 1, frameWidth: 1920, frameHeight: 1080, framesPerSecond: 30 }),
      codecV: { id: "codecV", type: "codec", mimeType: "video/H264" },
      pair: { id: "pair", type: "candidate-pair", currentRoundTripTime: 0.05 },
    });

    const { snapshot, carry } = collectStats(report);
    expect(snapshot.codec).toBe("video/H264");
    expect(snapshot.frameWidth).toBe(1920);
    expect(snapshot.frameHeight).toBe(1080);
    expect(snapshot.framesPerSecond).toBe(30);
    expect(snapshot.packetsLost).toBe(1);
    expect(snapshot.roundTripTimeMs).toBe(50);
    expect(snapshot.bitrateKbps).toBeUndefined();
    expect(carry).toEqual({ bytesReceived: 1000, timestamp: 1000 });
  });

  it("derives bitrate from the byte/time delta against the previous reading", () => {
    const report = makeReport({
      in: inbound({ bytesReceived: 2000, timestamp: 2000 }),
    });
    const { snapshot } = collectStats(report, { bytesReceived: 1000, timestamp: 1000 });
    expect(snapshot.bitrateKbps).toBe(8);
  });

  it("ignores non-video inbound streams", () => {
    const report = makeReport({
      audio: { id: "audio", type: "inbound-rtp", kind: "audio", frameWidth: 99 },
    });
    const { snapshot } = collectStats(report);
    expect(snapshot.frameWidth).toBeUndefined();
  });
});

describe("snapshotRows", () => {
  it("returns an empty list for no snapshot", () => {
    expect(snapshotRows(null)).toEqual([]);
  });

  it("renders present fields and drops absent ones", () => {
    const rows = snapshotRows({ timestamp: 0, codec: "video/H264", frameWidth: 1280, frameHeight: 720, roundTripTimeMs: 12 });
    expect(rows).toContainEqual({ key: "codec", value: "video/H264" });
    expect(rows).toContainEqual({ key: "resolution", value: "1280 x 720" });
    expect(rows).toContainEqual({ key: "rtt", value: "12 ms" });
    expect(rows.some((r) => r.key === "fps")).toBe(false);
  });
});
