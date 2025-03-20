<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import Peer, { MediaConnection } from "peerjs";
import { usePeer } from "../../store/peer";
import { createMediaStreamFake } from "../../utils/webrtc/fakeStream";
import { useRoute, useRouter } from "vue-router";
import {
    closePeer,
    createPeerInstanceByMode,
} from "../../utils/webrtc/connect";
import { useRouteChange } from "../../router/automatch";
import { useAutoPlay } from "../../utils/hooks/useAutoPlay";
import { toastErr } from "../../utils/toast";
import { consoleError, debug, log } from "../../utils/console";
import { useAutoReceive } from "../../utils/hooks/useAutoReceive";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
let peerInstance: Ref<null | Peer> = ref(null);
let localStream: Ref<null | MediaStream> = ref(null);
let currentPeer: Ref<null | MediaConnection> = ref(null);

const route = useRoute();
const router = useRouter();
const PeerStore = usePeer();
const failedTimes = ref(0);
const isFindStream = ref(false); // 是否找到流
const isLoadingStream = ref(false); // 是否正在加载
const screenVideo = ref(null as HTMLVideoElement | null); // 屏幕分享 DOM

watch(
    () => PeerStore.targetUID,
    (value) => {
        router.push({ query: { uid: value } });
    }
);

useAutoPlay(screenVideo, "Fullscreen Receiver");
const { clearAutoReceive, restartAutoReceive } = useAutoReceive(
    screenVideo,
    receiveStream,
    true
);

function clearPeer() {
    clearAutoReceive();
    if (peerInstance.value && peerInstance.value.id) {
        log.warning("Cleaning up Peer instance soon", peerInstance.value.id);
        closePeer(peerInstance, currentPeer, localStream);
    }
}

function createReceivePeerConn() {
    peerInstance.value = createPeerInstanceByMode();
    peerInstance.value.on("open", () => {
        log.success("Peer instance has been created", peerInstance.value?.id);
        const fakeStream = createMediaStreamFake(0);

        currentPeer.value = peerInstance.value!.call(
            PeerStore.targetUID,
            fakeStream
        );

        if (null === currentPeer.value) {
            toastErr(t("toast.badPeer"));
            return;
        }

        currentPeer.value.on("stream", (stream) => {
            log.success("Media stream loading complete", PeerStore.targetUID);
            log.success("Timeout check", "Below threshold, check passed");
            debug(["Please check the media stream data", stream]);
            localStream.value = stream;
            isFindStream.value = true;
            failedTimes.value = 0;
            isLoadingStream.value = false;
            screenVideo.value!.srcObject = stream;
            screenVideo.value!.muted = true;
            restartAutoReceive();
        });
    });
}

function receiveStream() {
    clearPeer();
    isFindStream.value = false;

    if (!screenVideo.value) {
        toastErr(t("toast.loadingErr"));
        return;
    }

    try {
        isLoadingStream.value = true;
        createReceivePeerConn();
    } catch (e) {
        isLoadingStream.value = false;
        isFindStream.value = false;
        toastErr(t("toast.mediaErr"));
        consoleError(e);
    } finally {
        window.addEventListener("beforeunload", () => {
            clearPeer();
        });
    }
}

function matchUID() {
    if (route.query.uid) {
        PeerStore.targetUID = route.query.uid as string;
        return;
    }

    if (PeerStore.targetUID && !route.query.uid) {
        router.push({ query: { uid: PeerStore.targetUID } });
        return;
    }
}

matchUID();
useRouteChange(matchUID);

onMounted(() => {
    clearAutoReceive();

    if (PeerStore.targetUID && PeerStore.targetUID.length > 0) {
        receiveStream();
    } else {
        alert(t("toast.emptyUID"));
    }
});
</script>

<template>
    <Teleport to="body">
        <video
            class="video-fit-screen"
            ref="screenVideo"
            autoplay
            controls
        ></video
    ></Teleport>
</template>

<style scoped>
.video-fit-screen {
    object-fit: cover;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed;
    top: 0;
    left: 0;
}
</style>
