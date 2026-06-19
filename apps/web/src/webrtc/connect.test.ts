import { describe, expect, it } from "vitest";

import { isSignalingServerError } from "./connect";

describe("isSignalingServerError", () => {
  it("flags errors that mean the signaling server is unreachable", () => {
    for (const type of ["network", "server-error", "socket-error", "socket-closed", "ssl-unavailable"]) {
      expect(isSignalingServerError(type)).toBe(true);
    }
  });

  it("does not flag peer/usage errors a fallback server would not fix", () => {
    for (const type of [
      "peer-unavailable",
      "invalid-id",
      "invalid-key",
      "unavailable-id",
      "webrtc",
      "browser-incompatible",
      "disconnected",
    ]) {
      expect(isSignalingServerError(type)).toBe(false);
    }
  });
});
