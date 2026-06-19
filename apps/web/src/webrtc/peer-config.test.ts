import { describe, expect, it } from "vitest";

import { buildPeerOptions, parseIceServers, PUBLIC_PEER_SERVER, resolvePeerServerURL } from "./peer-config";

describe("resolvePeerServerURL", () => {
  it("parses an https url, defaulting to port 443", () => {
    expect(resolvePeerServerURL("https://signal.example.com/")).toEqual({
      host: "signal.example.com",
      port: 443,
      path: "/",
      secure: true,
      key: "peerjs",
    });
  });

  it("parses an http url with an explicit port and a custom key", () => {
    expect(resolvePeerServerURL("http://localhost:3000/?key=secret")).toEqual({
      host: "localhost",
      port: 3000,
      path: "/",
      secure: false,
      key: "secret",
    });
  });

  it("defaults http to port 80 and preserves the pathname", () => {
    expect(resolvePeerServerURL("http://example.com/myapp")).toMatchObject({
      host: "example.com",
      port: 80,
      path: "/myapp",
      secure: false,
    });
  });

  it("resolves a blank url to the public peerjs cloud", () => {
    expect(resolvePeerServerURL("")).toEqual(PUBLIC_PEER_SERVER);
    expect(resolvePeerServerURL("   ")).toEqual(PUBLIC_PEER_SERVER);
  });

  it("parses the public cloud url to the same coordinates as the constant", () => {
    expect(resolvePeerServerURL("https://0.peerjs.com/")).toEqual(PUBLIC_PEER_SERVER);
  });
});

describe("parseIceServers", () => {
  it("parses the pipe-delimited form", () => {
    expect(parseIceServers(["turn:t.example.com|user|pass"])).toEqual([
      { urls: "turn:t.example.com", username: "user", credential: "pass" },
    ]);
  });

  it("parses the caret/at form", () => {
    expect(parseIceServers(["turn:t.example.com^user@pass"])).toEqual([
      { urls: "turn:t.example.com", username: "user", credential: "pass" },
    ]);
  });

  it("parses a bare stun url and drops blank lines", () => {
    expect(parseIceServers(["stun:stun.l.google.com:19302", "   "])).toEqual([
      { urls: "stun:stun.l.google.com:19302" },
    ]);
  });
});

describe("buildPeerOptions", () => {
  it("omits config when there are no ice servers", () => {
    expect(buildPeerOptions({ host: "h", port: 1, path: "/", secure: false, key: "k" }, [])).toEqual({
      host: "h",
      port: 1,
      path: "/",
      secure: false,
      key: "k",
    });
  });

  it("attaches ice servers when present", () => {
    const options = buildPeerOptions({ host: "h", port: 1, path: "/", secure: true }, [{ urls: "stun:x" }]);
    expect(options.config).toEqual({ iceServers: [{ urls: "stun:x" }] });
  });
});
