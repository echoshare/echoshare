
import { usePeer } from "../store/peer";
import { http } from "../utils/axios";
import { AxiosResponse } from "axios";
import { handler, initLeanCloud } from "./handler";
import { toastErr } from "../utils/toast";

import { i18n } from "../i18n";
const t = i18n.global.t;

function checkEnabled<T extends any[], R extends any>(
    fn: (...args: T) => R
): (...args: T) => R | undefined {
    const PeerStore = usePeer();
    return (...args: T) => {
        if (!PeerStore.enableQuery) return;
        if (!initLeanCloud()) {
            toastErr(t("toast.noInitLeanCloud"));
            return;
        }
        return fn(...args);
    };
}

function uncheckedtryConnect(): Promise<
    AxiosResponse<{
        __type: string;
        iso: string;
    }>
> {
    const PeerStore = usePeer();
    return http.get(PeerStore.remoteSERVER_URL + "/1.1/date");
}

function uncheckedAddItem(uid: string, isSharePeer: boolean) {
    const UidClass = handler.Object.extend("uid");
    const uidObject = new UidClass();
    uidObject.set("peer_id", uid);
    uidObject.set("is_shared_peer", isSharePeer);
    return uidObject.save();
}

function uncheckedQuerySenderUID() {
    const query = new handler.Query("uid");
    query.equalTo("is_shared_peer", true);
    query.descending("createdAt");
    return query.first();
}

export const addItem = (uid: string, isSharePeer: boolean) => {
    if (!uid || uid.length === 0) return;
    return checkEnabled(uncheckedAddItem)(uid, isSharePeer);
};

export const tryConnect = checkEnabled(uncheckedtryConnect);
export const querySenderUID = checkEnabled(uncheckedQuerySenderUID);
