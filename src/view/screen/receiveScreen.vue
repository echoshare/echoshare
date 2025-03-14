<script lang="ts" setup>
import ClipBoard from "clipboardy";
import { onMounted, Ref, ref, watch } from "vue";
import Peer, { MediaConnection } from "peerjs";
import { usePeer } from "../../store/peer";
import { createMediaStreamFake } from "../../utils/webrtc/fakeStream";
import { useRoute, useRouter } from "vue-router";
import {
    closePeer,
    createPeerInstanceByMode,
} from "../../utils/webrtc/connect";
import { useWindow } from "../../utils/hooks/useDOM";
import { useRouteChange } from "../../router/automatch";
import { useAutoPlay } from "../../utils/hooks/useAutoPlay";
import { useAutoReceive } from "../../utils/hooks/useAutoReceive";
import { toastErr, toastTip } from "../../utils/toast";
import { querySenderUID } from "../../leancloud/query";
import { supportClipboard } from "../../utils/device";
import { consoleError, debug, log } from "../../utils/console";

let peerInstance: Ref<null | Peer> = ref(null);
let receiveTimer: Ref<number | null> = ref(null);
let localStream: Ref<null | MediaStream> = ref(null);
let currentPeer: Ref<null | MediaConnection> = ref(null);

const route = useRoute();
const router = useRouter();
const PeerStore = usePeer();
const { width } = useWindow();
const isFindStream = ref(false);
const isLoadingStream = ref(false); 
const isLoadingQuery = ref(false); 
const videoIsFitscreen = ref(false); 
const screenVideo = ref(null as HTMLVideoElement | null); 

const receiveModeOptions = [
    {
        value: 0,
        text: "Audio + Video",
    },
    {
        value: 1,
        text: "Only Video",
    },
    {
        value: 2,
        text: "Only Audio",
    },
];

const receiveMode = ref(receiveModeOptions[PeerStore.receiveModeIndex]);

watch(receiveMode, (value) => {
    changeMediaMode();
    PeerStore.receiveModeIndex = value.value;
});

watch(
    () => PeerStore.targetUID,
    (value) => {
        router.push({ query: { uid: value } });
    }
);

function queryUID() {
    isLoadingQuery.value = true;
    const promise = querySenderUID();
    if (!promise) {
        isLoadingQuery.value = false;
        return;
    }

    promise
        .then((res) => {
            let find = false;
            if (res) {
                const uid = (res as any)?._serverData?.peer_id;
                if (uid) {
                    find = true;
                    PeerStore.targetUID = uid;
                    router.push({ query: { uid: PeerStore.targetUID } });
                    toastTip("可用 UID 查询成功");
                    if (autoFetchStream.value) {
                        receiveStream();
                    }
                }
            }

            if (!find) {
                toastErr("查询失败: 未找到可用 UID");
                throw new Error("未找到可用 UID");
            }
        })
        .catch((e) => {
            toastErr("请求 UID 数据库失败");
            consoleError(e);
        })
        .finally(() => {
            isLoadingQuery.value = false;
        });
}

function clearPeer() {
    clearAutoReceive();
    if (peerInstance.value && peerInstance.value.id) {
        log.warning("即将清理 Peer 实例", peerInstance.value.id);
        closePeer(peerInstance.value, currentPeer.value, localStream.value);
    }
    isFindStream.value = false;
    isLoadingStream.value = false;
}

function videoFitscreen() {
    if (!screenVideo.value) return;
    videoIsFitscreen.value = !videoIsFitscreen.value;
    const app = document.getElementById("app");
    if (app) app.style.display = videoIsFitscreen.value ? "none" : "block";
}

function receiveStream() {
    clearPeer();
    isFindStream.value = false;

    if (!PeerStore.targetUID) {
        if (PeerStore.enableQuery) {
            toastTip("目标 UID 为空，可尝试查询可用目标 UID");
        } else {
            toastErr("目标 UID 为空");
        }
        return;
    }

    if (!screenVideo.value) {
        toastErr("当前页面未加载完成");
        return;
    }

    if (receiveTimer.value !== null) {
        clearTimeout(receiveTimer.value);
        log.info("超时检查", "已清除上一次检查");
    }

    try {
        isLoadingStream.value = true;
        peerInstance.value = createPeerInstanceByMode();
        peerInstance.value.on("open", () => {
            log.success("Peer 实例已创建", peerInstance.value?.id);
            const fakeStream = createMediaStreamFake(receiveMode.value.value);

            log.warning(
                "Timeout check",
                "Timer has been activated, Threshold:" + PeerStore.maxOutOfTime + "ms"
            );
            receiveTimer.value = setTimeout(() => {
                if (!isFindStream.value) {
                    toastErr("Request timed out, unable to capture media stream 😭");
                    log.error(
                        "Timeout " + PeerStore.maxOutOfTime + "ms",
                        "unable to capture media stream"
                    );
                    clearPeer();
                    isLoadingStream.value = false;
                }
            }, PeerStore.maxOutOfTime) as any as number;

            currentPeer.value = peerInstance.value!.call(
                PeerStore.targetUID,
                fakeStream
            );

            if (!currentPeer) {
                toastErr("Unable to connect to Peer node, check Peer configuration!");
                return;
            }
            currentPeer.value.on("stream", (stream) => {
                if (isFindStream.value) {
                    receiveTimer.value && clearTimeout(receiveTimer.value);
                    log.success("Media stream loading complete", PeerStore.targetUID);
                    log.success("Timeout check", "Below threshold, check passed");
                    debug("Please check the media stream data", stream);
                }
                localStream.value = stream;
                screenVideo.value!.srcObject = stream;
                isFindStream.value = true;
                isLoadingStream.value = false;
                screenVideo.value!.muted = true;
                restartAutoReceive();
            });
        });
    } catch (e) {
        isFindStream.value = false;
        isLoadingStream.value = false;
        toastErr("Unable to capture media stream 😭");
        consoleError(e);
    } finally {
        window.addEventListener("beforeunload", () => {
            clearPeer();
        });
    }
}

function changeMediaMode() {
    clearPeer();
    isFindStream.value = false;
}

function readPaste() {
    (window as any).vdo = screenVideo.value;
    console.log(screenVideo.value);
    if (!supportClipboard()) {
        return;
    }
    ClipBoard.read().then((text) => {
        PeerStore.targetUID = text;
    });
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
useAutoPlay(screenVideo, "Receiver");
const { clearAutoReceive, restartAutoReceive } = useAutoReceive(
    screenVideo,
    receiveStream
);
const autoFetchStream = ref(PeerStore.autoRequireStream);

onMounted(() => {
    clearAutoReceive();
    if (
        PeerStore.targetUID &&
        PeerStore.targetUID.length > 0 &&
        (PeerStore.autoRequireStream || route.query.autoplay !== undefined)
    ) {
        if (PeerStore.enableQuery) {
            toastTip("Automatically query available target UID");
            queryUID();
            return;
        }
        receiveStream();
    }

});
</script>

<template>
    <div>
        <div class="mt-4">
            <VaCard class="m-auto flex flex-col w-5/6 mb-4">
                <VaCardTitle class="text-lg"> Receive Panel </VaCardTitle>
                <VaCardContent>
                    <div class="flex flex-1 items-end flex-wrap">
                        <VaInput
                            label="目标 UID"
                            class="grow w-24 md:w-auto"
                            v-model="PeerStore.targetUID"
                            :placeholder="
                                PeerStore.enableQuery
                                    ? 'Click to check available target UID'
                                    : 'Please enter the target UID'
                            "
                        />
                        <div class="flex flex-none flex-row justify-end ml-4">
                            <VaButton
                                @click="readPaste"
                                style="height: 34px"
                                round
                                class="flex-none"
                                icon="content_paste"
                            />
                            <VaButton
                                @click="queryUID"
                                style="height: 34px"
                                round
                                :loading="isLoadingQuery"
                                v-if="PeerStore.enableQuery"
                                class="flex-none ml-2"
                                icon="autorenew"
                            />
                            <VaButton
                                @click="receiveStream"
                                style="height: 34px"
                                round
                                :loading="isLoadingStream"
                                class="flex-none ml-2"
                                icon="connected_tv"
                            />
                        </div>
                    </div>

                    <VaSelect
                        text-by="text"
                        v-model="receiveMode"
                        class="w-full mt-4 mb-3"
                        label="Media Reception Mode"
                        :options="receiveModeOptions"
                        placeholder="Please select media reception mode"
                    />
                </VaCardContent>
            </VaCard>
        </div>
        <Teleport to="body" :disabled="!videoIsFitscreen">
            <div class="relative">
                <video
                    v-show="isFindStream"
                    class="w-5/6 m-auto shadow-md"
                    :class="{ 'video-fit-screen': videoIsFitscreen }"
                    ref="screenVideo"
                    autoplay
                    controls
                ></video>
                <VaButton
                    v-show="isFindStream && width > 768"
                    round
                    class="ml-3 absolute opacity-20 hover:opacity-100 top-[0.5em]"
                    :style="{
                        right: videoIsFitscreen
                            ? '0.5em'
                            : 'calc(8.33333% + 0.5em)',
                    }"
                    @click="videoFitscreen"
                    icon="fit_screen"
                />
            </div>
        </Teleport>
    </div>
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
