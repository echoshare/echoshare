import {
  collectStats,
  formatDate,
  snapshotRows,
  type InboundCarry,
  type InspectRow,
  type StatSnapshot,
} from "./stat";

interface LogEntry {
  time: string;
  snapshot: StatSnapshot;
}

/**
 * Polls `RTCPeerConnection.getStats()` over time, deriving per-tick bitrate from
 * byte deltas and retaining a downloadable log of snapshots for diagnostics.
 */
export class WebRTCAnalysis {
  private prev: InboundCarry | undefined;
  private readonly logs: LogEntry[] = [];
  latest: StatSnapshot | null = null;

  async run(pc: RTCPeerConnection): Promise<StatSnapshot> {
    const report = await pc.getStats();
    const { snapshot, carry } = collectStats(report, this.prev);
    if (carry) this.prev = carry;
    this.latest = snapshot;
    this.logs.push({ time: formatDate(new Date()), snapshot });
    return snapshot;
  }

  rows(): InspectRow[] {
    return snapshotRows(this.latest);
  }

  reset(): void {
    this.prev = undefined;
    this.latest = null;
    this.logs.length = 0;
  }

  downloadLogs(name: string): void {
    const blob = new Blob([JSON.stringify({ logs: this.logs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
