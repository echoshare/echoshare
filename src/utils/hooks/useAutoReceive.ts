import { Ref } from "vue";
import { useInterval } from "vue-hooks-plus";
import { toastTip } from "../toast";
import { log } from "../console";
import { usePeer } from "../../store/peer";

export function useAutoReceive(
    videoRef: Ref<HTMLVideoElement | null>,
    reFetchAction: () => void,
    defaultEnabled = false,
    time = 5000
) {
    const PeerStore = usePeer();
    function cb() {
        if (!defaultEnabled && !PeerStore.enableAutoRefetch) return;
        if (videoRef.value === null) return;
        if (videoRef.value.srcObject === null) return;
        const mediaStream = videoRef.value.srcObject as MediaStream;
        if (mediaStream.active) return;
        if (mediaStream.active) return;
        toastTip("视频流中断, 尝试重新获取");
        log.error("Video stream interrupted", "Trying to recapture");
        reFetchAction();
    }

    const { clear: clearAutoReceive, restart: restartAutoReceive } =
        useInterval(cb, time);

    return {
        clearAutoReceive,
        restartAutoReceive,
    };
}
