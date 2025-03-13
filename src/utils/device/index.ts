import { toastErr } from "../toast";

export function supportWebRTC() {
    const href = new URL(window.location.href);
    if (
        href.protocol !== "https:" &&
        href.hostname !== "localhost" &&
        href.hostname !== "127.0.0.1"
    ) {
        toastErr("非 localhost 环境请使用 HTTPS 协议，以启用 WebRTC API");
        return false;
    }

    return true;
}

export function supportClipboard() {
    const href = new URL(window.location.href);
    if (
        href.protocol !== "https:" &&
        href.hostname !== "localhost" &&
        href.hostname !== "127.0.0.1"
    ) {
        toastErr("非 localhost 环境请使用 HTTPS 协议，以启用 Clipboard API");
        return false;
    }

    if (!window.navigator?.clipboard) {
        toastErr("此设备不支持 Clipboard API");
        return false;
    }
    return true;
}

export function isDeviceMobile() {
    return /Andriod|iphone|ipad|webOs|Windows Phone|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}
