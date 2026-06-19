import { describe, expect, it } from "vitest";

import { sdpEdit } from "./h265";

const SDP = [
  "v=0",
  "s=-",
  "m=video 9 UDP/TLS/RTP/SAVPF 96 97 98",
  "a=rtpmap:96 VP8/90000",
  "a=rtpmap:97 H264/90000",
  "a=rtpmap:98 H265/90000",
].join("\r\n");

describe("sdpEdit", () => {
  it("moves the chosen codec to the front of the m=video line", () => {
    expect(sdpEdit(SDP, "H265")).toContain("m=video 9 UDP/TLS/RTP/SAVPF 98 96 97");
  });

  it("returns the sdp unchanged when the codec is absent", () => {
    expect(sdpEdit(SDP, "AV1")).toBe(SDP);
  });

  it("returns the sdp unchanged when the codec is already preferred", () => {
    const already = [
      "v=0",
      "m=video 9 UDP/TLS/RTP/SAVPF 98 96 97",
      "a=rtpmap:96 VP8/90000",
      "a=rtpmap:98 H265/90000",
    ].join("\r\n");
    expect(sdpEdit(already, "H265")).toBe(already);
  });

  it("injects an iOS fmtp line right after the codec rtpmap", () => {
    const out = sdpEdit(SDP, "H265", true);
    expect(out).toContain("a=rtpmap:98 H265/90000\r\na=fmtp:98 level-asymmetry-allowed=1;packetization-mode=1");
    expect(out).toContain("m=video 9 UDP/TLS/RTP/SAVPF 98 96 97");
  });
});
