import { describe, expect, it } from "vitest";

import { classifyCaptureError, deviceConstraint } from "./create-stream";

describe("classifyCaptureError", () => {
  it("maps permission denial and its legacy alias to 'denied'", () => {
    expect(classifyCaptureError(new DOMException("x", "NotAllowedError"))).toBe("denied");
    expect(classifyCaptureError(new DOMException("x", "PermissionDeniedError"))).toBe("denied");
  });

  it("maps missing, busy and over-constrained devices", () => {
    expect(classifyCaptureError(new DOMException("x", "NotFoundError"))).toBe("notfound");
    expect(classifyCaptureError(new DOMException("x", "NotReadableError"))).toBe("inuse");
    expect(classifyCaptureError(new DOMException("x", "OverconstrainedError"))).toBe("constraints");
  });

  it("falls back to 'unknown' for unrecognised or non-DOMException errors", () => {
    expect(classifyCaptureError(new DOMException("x", "AbortError"))).toBe("unknown");
    expect(classifyCaptureError(new Error("boom"))).toBe("unknown");
    expect(classifyCaptureError("nope")).toBe("unknown");
  });
});

describe("deviceConstraint", () => {
  it("omits the track when the source is not allowed", () => {
    expect(deviceConstraint(false, "")).toBe(false);
    expect(deviceConstraint(false, "dev-1")).toBe(false);
  });

  it("requests the default device when allowed but unspecified (regression guard)", () => {
    expect(deviceConstraint(true, "")).toBe(true);
    expect(deviceConstraint(true, undefined)).toBe(true);
  });

  it("pins a specific device when one is selected", () => {
    expect(deviceConstraint(true, "dev-1")).toEqual({ deviceId: { exact: "dev-1" } });
  });
});
