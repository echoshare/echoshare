import { LocationQueryValue } from "vue-router";

export function resolveQueryUID(
    queryUID?: LocationQueryValue | LocationQueryValue[]
) {
    if (!queryUID) return "";
    if (typeof queryUID === "string") {
        return queryUID;
    } else if (Array.isArray(queryUID)) {
        return String(queryUID[0] ?? "");
    } else {
        return String(queryUID);
    }
}

export function resolvePeerServerURL(serverURL: string) {
    const urlObj = new URL(serverURL);
    const searchParams = urlObj.searchParams
        .toString()
        .split("&")
        .reduce((previous, current) => {
            const [key, value] = current.split("=");
            (previous as Record<string, string>)[key] = value;
            return previous;
        }, {});
    let port = parseInt(urlObj.port);
    const { host, protocol, pathname: path } = urlObj;
    if (!port || isNaN(port)) {
        port = protocol === "https:" ? 443 : 80;
    }

    const key = (searchParams as Record<string, string>)?.key || "peerjs";

    return { host, port, path, secure: protocol === "https:", key };
}
