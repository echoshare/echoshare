import { usePeer } from "../store/peer";
import handler from "leancloud-storage";
import { log } from "../utils/console";

export function initLeanCloud() {
    const PeerStore = usePeer();
    const APP_ID = PeerStore.remoteAPP_ID;
    const APP_KEY = PeerStore.remoteAPP_KEY;
    const SERVER_URL = PeerStore.remoteSERVER_URL;
    if (
        typeof APP_ID === "string" &&
        typeof APP_KEY === "string" &&
        typeof SERVER_URL === "string" &&
        APP_ID.length > 0 &&
        APP_KEY.length > 0 &&
        SERVER_URL.length > 0
    ) {
        if (window.__HANDLER_IS_INIT)  {
            log.warning("Remote database","Initialization has been completed" );
            return true;
        }
        handler.init({
            appId: APP_ID,
            appKey: APP_KEY,
            serverURL: SERVER_URL,
        });
        log.success("Remote database initialization complete", "APP_ID = " + APP_ID);
        window.__HANDLER_IS_INIT = true;
        return true
    } else {
        return false;
    }
}

export { handler };
