import { toastErr } from "../toast";
import { i18n } from "../../i18n";
const t = i18n.global.t;


export function supportWebRTC() {
    const href = new URL(window.location.href);
    if (
        href.protocol !== "https:" &&
        href.hostname !== "localhost" &&
        href.hostname !== "127.0.0.1"
    ) {
        toastErr(t("toast.notHttpsWebRTC"));
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
        toastErr(t("toast.notHttpsClipboard"));
        return false;
    }

    if (!window.navigator?.clipboard) {
        toastErr(t("toast.noClipboard"));
        return false;
    }
    return true;
}

export function isDeviceMobile() {
    return /Andriod|iphone|ipad|webOs|Windows Phone|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}
