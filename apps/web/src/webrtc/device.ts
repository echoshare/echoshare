export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** WebRTC media capture only works in a secure context (https) or on localhost. */
export function isSecureWebRTCContext(): boolean {
  const { protocol, hostname } = window.location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
}
