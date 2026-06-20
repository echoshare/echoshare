import { describe, expect, it } from "vitest";

import type { MediaMode } from "./types";

import { applySenderQuality, qualityProfileFor, RECEIVE_QUALITY, tuneSdpQuality } from "./quality";

const screenMode: MediaMode = { value: 2, label: "screenOnly", useScreen: true, useCamera: false, useAudio: false, useMicrophone: false };
const cameraMode: MediaMode = { value: 5, label: "cameraOnly", useScreen: false, useCamera: true, useAudio: false, useMicrophone: false };

const SDP = [
  "v=0",
  "s=-",
  "t=0 0",
  "m=audio 9 UDP/TLS/RTP/SAVPF 111 103",
  "c=IN IP4 0.0.0.0",
  "a=rtpmap:111 opus/48000/2",
  "a=fmtp:111 minptime=10;useinbandfec=1",
  "m=video 9 UDP/TLS/RTP/SAVPF 96 97",
  "c=IN IP4 0.0.0.0",
  "a=rtpmap:96 H264/90000",
  "a=fmtp:96 level-asymmetry-allowed=1",
].join("\r\n");

describe("qualityProfileFor", () => {
  it("favours resolution for screen capture", () => {
    const profile = qualityProfileFor(screenMode);
    expect(profile.contentHint).toBe("detail");
    expect(profile.degradationPreference).toBe("maintain-resolution");
    expect(profile.videoBitrateBps).toBe(12_000_000);
  });

  it("favours motion for camera capture", () => {
    const profile = qualityProfileFor(cameraMode);
    expect(profile.contentHint).toBe("motion");
    expect(profile.degradationPreference).toBe("balanced");
    expect(profile.maxFramerate).toBe(30);
  });
});

describe("tuneSdpQuality", () => {
  it("inserts video bandwidth lines right after the m=video c= line", () => {
    const out = tuneSdpQuality(SDP, RECEIVE_QUALITY).split("\r\n");
    const videoIndex = out.findIndex((line) => line.startsWith("m=video"));
    expect(out[videoIndex + 1]).toBe("c=IN IP4 0.0.0.0");
    expect(out[videoIndex + 2]).toBe(`b=AS:${RECEIVE_QUALITY.videoBitrateKbps}`);
    expect(out[videoIndex + 3]).toBe(`b=TIAS:${RECEIVE_QUALITY.videoBitrateKbps * 1000}`);
  });

  it("does not add a bandwidth line to the audio m-line", () => {
    const out = tuneSdpQuality(SDP, RECEIVE_QUALITY).split("\r\n");
    const audioIndex = out.findIndex((line) => line.startsWith("m=audio"));
    const videoIndex = out.findIndex((line) => line.startsWith("m=video"));
    const audioSection = out.slice(audioIndex, videoIndex);
    expect(audioSection.some((line) => line.startsWith("b="))).toBe(false);
  });

  it("strengthens the opus fmtp with stereo and a high bitrate, overriding clashing keys", () => {
    const out = tuneSdpQuality(SDP, RECEIVE_QUALITY);
    const fmtp = out.split("\r\n").find((line) => line.startsWith("a=fmtp:111"));
    expect(fmtp).toContain("minptime=10");
    expect(fmtp).toContain("stereo=1");
    expect(fmtp).toContain("sprop-stereo=1");
    expect(fmtp).toContain(`maxaveragebitrate=${RECEIVE_QUALITY.audioBitrateBps}`);
    // useinbandfec was present already; it must appear once, not duplicated.
    expect(fmtp!.match(/useinbandfec=1/g)).toHaveLength(1);
  });

  it("is idempotent", () => {
    const once = tuneSdpQuality(SDP, RECEIVE_QUALITY);
    const twice = tuneSdpQuality(once, RECEIVE_QUALITY);
    expect(twice).toBe(once);
    expect(twice.match(/b=AS:/g)).toHaveLength(1);
    expect(twice.match(/stereo=1/g)).toHaveLength(2); // stereo=1 + sprop-stereo=1
  });

  it("adds an opus fmtp line when none exists", () => {
    const noFmtp = ["m=audio 9 RTP 111", "c=IN IP4 0.0.0.0", "a=rtpmap:111 opus/48000/2"].join("\r\n");
    const out = tuneSdpQuality(noFmtp, RECEIVE_QUALITY);
    expect(out).toContain("a=rtpmap:111 opus/48000/2\r\na=fmtp:111 maxaveragebitrate=");
  });

  it("returns empty input untouched", () => {
    expect(tuneSdpQuality("", RECEIVE_QUALITY)).toBe("");
  });
});

interface CapturedSender {
  sender: RTCRtpSender;
  applied: RTCRtpSendParameters[];
}

function captureSender(kind: "video" | "audio"): CapturedSender {
  const applied: RTCRtpSendParameters[] = [];
  const params: RTCRtpSendParameters = { encodings: [{}], transactionId: "tx", codecs: [], headerExtensions: [], rtcp: {} };
  const sender = {
    track: { kind } as MediaStreamTrack,
    getParameters: () => params,
    setParameters: async (next: RTCRtpSendParameters) => {
      applied.push(next);
    },
  } as unknown as RTCRtpSender;
  return { sender, applied };
}

describe("applySenderQuality", () => {
  it("raises the video sender bitrate, frame rate and degradation policy", async () => {
    const video = captureSender("video");
    const audio = captureSender("audio");
    const pc = { getSenders: () => [video.sender, audio.sender] } as unknown as RTCPeerConnection;

    await applySenderQuality(pc, qualityProfileFor(screenMode));

    const v = video.applied[0]!;
    expect(v.encodings[0]!.maxBitrate).toBe(12_000_000);
    expect(v.encodings[0]!.maxFramerate).toBe(60);
    expect(v.encodings[0]!.scaleResolutionDownBy).toBe(1);
    expect(v.degradationPreference).toBe("maintain-resolution");

    expect(audio.applied[0]!.encodings[0]!.maxBitrate).toBe(128_000);
  });

  it("creates an encoding when the sender has none", async () => {
    const applied: RTCRtpSendParameters[] = [];
    const params: RTCRtpSendParameters = { encodings: [], transactionId: "tx", codecs: [], headerExtensions: [], rtcp: {} };
    const sender = {
      track: { kind: "video" } as MediaStreamTrack,
      getParameters: () => params,
      setParameters: async (next: RTCRtpSendParameters) => {
        applied.push(next);
      },
    } as unknown as RTCRtpSender;
    const pc = { getSenders: () => [sender] } as unknown as RTCPeerConnection;

    await applySenderQuality(pc, qualityProfileFor(cameraMode));

    expect(applied[0]!.encodings[0]!.maxBitrate).toBe(6_000_000);
  });
});
