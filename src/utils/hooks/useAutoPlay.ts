import { computed, Ref, watch } from "vue";
import { usePeer } from "../../store/peer";
import { useInterval } from "vue-hooks-plus";
import { useRoute } from "vue-router";
import { log } from "../console";

export function useAutoPlay(
    videoRef: Ref<HTMLVideoElement | null>,
    name: "Receiver" | "Sender" | "Fullscreen Receiver",
    time = 2000
) {
    const route = useRoute();
    const PeerStore = usePeer();
    const isReallyAutoPlay = computed(
        () => PeerStore.autoTryPlay || route.query.autoplay !== undefined
    );

    if (PeerStore.autoTryPlay) {
        log.success("autoplay", "enable");
    } else if (isReallyAutoPlay.value) {
        log.info("autoplay", "Enabled based on passing in the autoplay URL parameter");
    } else {
        log.error("autoplay", "disable");
    }

    function autoPlay() {
        if (isReallyAutoPlay.value && videoRef.value) {
            if (route.name !== name) {
                log.error("Unable to autoplay", name + "Not loaded on current page");
                return;
            }
            if (videoRef.value.srcObject === null) {
                log.error("Unable to autoplay", name + "Media stream not captured");
                return;
            }
            videoRef.value.play();
            log.info(name + "Try autoplay", new Date().toLocaleString());
        }
    }

    const { clear: clearAutoPlay, restart: restartAutoPlay } = useInterval(
        autoPlay,
        time
    );

    watch(isReallyAutoPlay, (isAutoTryPlay) => {
        if (isAutoTryPlay) {
            log.success("autoplay", "enable");
            restartAutoPlay();
        } else {
            log.error("autoplay", "disable");
            clearAutoPlay();
        }
    });

}
