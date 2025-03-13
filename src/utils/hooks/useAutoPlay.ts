import { computed, Ref, watch } from "vue";
import { usePeer } from "../../store/peer";
import { useInterval } from "vue-hooks-plus";
import { useRoute } from "vue-router";
import { log } from "../console";

export function useAutoPlay(
    videoRef: Ref<HTMLVideoElement | null>,
    name: "Receiver" | "Sender" | "全屏Receiver",
    time = 2000
) {
    const route = useRoute();
    const PeerStore = usePeer();
    const isReallyAutoPlay = computed(
        () => PeerStore.autoTryPlay || route.query.autoplay !== undefined
    );

    if (PeerStore.autoTryPlay) {
        log.success("自动播放", "启用");
    } else if (isReallyAutoPlay.value) {
        log.info("自动播放", "根据传入 autoplay URL 参数启用");
    } else {
        log.error("自动播放", "关闭");
    }

    function autoPlay() {
        if (isReallyAutoPlay.value && videoRef.value) {
            if (route.name !== name) {
                log.error("无法自动播放", name + "没有加载到当前页面");
                return;
            }
            if (videoRef.value.srcObject === null) {
                log.error("无法自动播放", name + "媒体流未捕获");
                return;
            }
            videoRef.value.play();
            log.info(name + "尝试自动播放", new Date().toLocaleString());
        }
    }

    const { clear: clearAutoPlay, restart: restartAutoPlay } = useInterval(
        autoPlay,
        time
    );

    watch(isReallyAutoPlay, (isAutoTryPlay) => {
        if (isAutoTryPlay) {
            log.success("自动播放", "启用");
            restartAutoPlay();
        } else {
            log.error("自动播放", "关闭");
            clearAutoPlay();
        }
    });

}
