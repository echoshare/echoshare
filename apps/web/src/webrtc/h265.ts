import type { VideoFormat } from "./types";

/** Find the dynamic payload-type id assigned to a codec in the negotiated SDP. */
function findCodecId(lines: string[], mimetype: string): string | null {
  const videoIndex = lines.findIndex((line) => line.startsWith("m=video"));
  if (videoIndex === -1) return null;

  const rtpmap = lines
    .slice(videoIndex)
    .filter((line) => line.startsWith("a=rtpmap:"))
    .find((line) => line.includes(mimetype));
  if (!rtpmap) return null;

  return rtpmap.match(/a=rtpmap:(\d+)/)?.[1] ?? null;
}

/**
 * Reorder an SDP `m=video` line so `mimetype` becomes the preferred codec.
 *
 * Moves the codec's payload type to the front of the codec list (position 3,
 * right after the `m=video <port> <proto>` prefix). On iOS, also injects a
 * `level-asymmetry-allowed` fmtp line right after the codec's rtpmap, which some
 * iOS builds require to accept the offer. Returns the SDP unchanged when the
 * codec is absent or already preferred.
 */
export function sdpEdit(sdp: string, mimetype: VideoFormat | string = "H264", iosDevice = false): string {
  if (!sdp) return sdp;

  const lines = sdp.split("\r\n");
  const codecId = findCodecId(lines, mimetype);
  if (!codecId) return sdp;

  const videoIndex = lines.findIndex((line) => line.startsWith("m=video"));
  const parts = lines[videoIndex]!.split(" ");
  const codecPos = parts.findIndex((part) => part === codecId);
  if (codecPos === -1 || codecPos === 3) return sdp;

  parts.splice(codecPos, 1);
  parts.splice(3, 0, codecId);
  const newVideoLine = parts.join(" ");

  let result = sdp;
  if (iosDevice) {
    const rtpmapIndex = lines.findIndex((line) => line.startsWith(`a=rtpmap:${codecId}`));
    const hasFmtp = lines.some(
      (line) => line.startsWith(`a=fmtp:${codecId}`) && line.includes("level-asymmetry-allowed"),
    );
    if (rtpmapIndex !== -1 && !hasFmtp) {
      lines.splice(rtpmapIndex + 1, 0, `a=fmtp:${codecId} level-asymmetry-allowed=1;packetization-mode=1`);
      result = lines.join("\r\n");
    }
  }

  return result.replace(/m=video.*/, newVideoLine);
}
