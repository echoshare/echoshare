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
import { supportClipboard } from "../../utils/device";
import { consoleError, debug, log } from "../../utils/console";
import { useHistoryStore } from "../../store/history";
import dayjs from "dayjs";

import { useI18n } from "vue-i18n";
import { useWebhook } from "../../store/webhook";
const { t, locale } = useI18n();
let peerInstance: Ref<null | Peer> = ref(null);
let receiveTimer: Ref<number | null> = ref(null);
let localStream: Ref<null | MediaStream> = ref(null);
let currentPeer: Ref<null | MediaConnection> = ref(null);

const HistoryStore = useHistoryStore();

const historyItem = ref({
    uid: "",
    time: "",
    timestamp: new Date().getTime(),
    result: "fail" as "fail" | "success",
    action: "receive" as "share" | "receive",
});

const route = useRoute();
const router = useRouter();
const PeerStore = usePeer();
const { width } = useWindow();
const isFindStream = ref(false);
const isLoadingStream = ref(false);
const isLoadingQuery = ref(false);
const videoIsFitscreen = ref(false);
const WebhookStore = useWebhook();
const screenVideo = ref(null as HTMLVideoElement | null);

const receiveModeOptions = () => [
    {
        value: 0,
        text: t("receiveModeOptions.0"),
    },
    {
        value: 1,
        text: t("receiveModeOptions.1"),
    },
    {
        value: 2,
        text: t("receiveModeOptions.2"),
    },
];

const receiveMode = ref(receiveModeOptions()[PeerStore.receiveModeIndex]);

watch(locale, () => {
    receiveMode.value = receiveModeOptions()[PeerStore.receiveModeIndex];
});

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

    if(WebhookStore.getURL.length === 0) {
        toastErr(t("webhook.getURLNotSet"));
        isLoadingQuery.value = false;
        return;
    }

    WebhookStore.sendRequest(
        "get",
        {
            timestamp: historyItem.value,
            action: "receive",
        },
        (response) => {
            toastTip(t("webhook.getURLWebhookSuccess"));
            PeerStore.targetUID = response.data?.uid || "";
            isLoadingQuery.value = false;
        },
        () => {
            toastErr(t("webhook.getURLWebhookFail"));
            isLoadingQuery.value = false;
        }
    );
}

function clearPeer() {
    clearAutoReceive();
    if (peerInstance.value && peerInstance.value.id) {
        log.warning("Cleaning up Peer instance soon", peerInstance.value.id);
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
        if (WebhookStore.getURL.length > 0) {
            toastTip(t("toast.noUIDAndQuery"));
        } else {
            toastErr(t("toast.noUID"));
        }
        return;
    }

    if (!screenVideo.value) {
        toastErr(t("toast.loadingErr"));
        return;
    }

    if (receiveTimer.value !== null) {
        clearTimeout(receiveTimer.value);
        log.info("Timeout check", "Last check cleared");
    }

    try {
        isLoadingStream.value = true;
        historyItem.value.uid = PeerStore.targetUID;
        historyItem.value.time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        peerInstance.value = createPeerInstanceByMode();
        peerInstance.value.on("open", () => {
            log.success("Peer instance is created", peerInstance.value?.id);
            const fakeStream = createMediaStreamFake(receiveMode.value.value);

            log.warning(
                "Timeout check",
                "Timer has been activated, Threshold:" +
                    PeerStore.maxOutOfTime +
                    "ms"
            );
            receiveTimer.value = setTimeout(() => {
                if (!isFindStream.value) {
                    toastErr(t("toast.timeoutCapture"));
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
                toastErr(t("toast.badPeer"));
                return;
            }
            currentPeer.value.on("stream", (stream) => {
                if (isFindStream.value) {
                    receiveTimer.value && clearTimeout(receiveTimer.value);
                    log.success(
                        "Media stream loading complete",
                        PeerStore.targetUID
                    );
                    log.success(
                        "Timeout check",
                        "Below threshold, check passed"
                    );
                    debug("Please check the media stream data", stream);
                }
                localStream.value = stream;
                screenVideo.value!.srcObject = stream;
                isFindStream.value = true;
                isLoadingStream.value = false;
                screenVideo.value!.muted = true;
                historyItem.value.result = "success";

                WebhookStore.sendRequest(
                    "success",
                    {
                        action: "receive",
                        uid: historyItem.value.uid,
                        time: historyItem.value.time,
                        timestamp: historyItem.value.timestamp,
                        result: "success",
                    },
                    () => {
                        toastTip(t("webhook.successURLWebhookSuccess"));
                    },
                    () => {
                        toastErr(t("webhook.successURLWebhookFail"));
                    }
                );
                restartAutoReceive();
            });
        });
    } catch (e) {
        isFindStream.value = false;
        isLoadingStream.value = false;
        toastErr(t("toast.mediaErr"));

        WebhookStore.sendRequest(
            "fail",
            {
                action: "share",
                uid: historyItem.value.uid,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                result: "success",
            },
            () => {
                toastTip(t("webhook.failURLWebhookSuccess"));
            },
            () => {
                toastErr(t("webhook.failURLWebhookFail"));
            }
        );
        consoleError(e);
    } finally {
        HistoryStore.history.push(historyItem.value);
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

// const autoFetchStream = ref(PeerStore.autoRequireStream);

onMounted(() => {
    clearAutoReceive();
    if (
        PeerStore.targetUID &&
        PeerStore.targetUID.length > 0 &&
        (PeerStore.autoRequireStream || route.query.autoplay !== undefined)
    ) {
        if (WebhookStore.getURL.length > 0 && PeerStore.targetUID.length === 0) {
            toastTip(t("toast.autoFetchUID"));
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
                <VaCardTitle class="text-lg">
                    {{ $t("receive.title") }}
                </VaCardTitle>
                <VaCardContent>
                    <div class="flex flex-1 items-end flex-wrap">
                        <VaInput
                            :label="$t('receive.inputLabel')"
                            class="grow w-24 md:w-auto"
                            v-model="PeerStore.targetUID"
                            clearable
                            :placeholder="
                                WebhookStore.getURL.length > 0
                                    ? $t('receive.queryPlaceholder')
                                    : $t('receive.noqueryPlaceholder')
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
                                v-if="WebhookStore.getURL.length > 0"
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
                        :label="$t('receive.selectLabel')"
                        :options="receiveModeOptions()"
                        :placeholder="$t('receive.selectPlaceholder')"
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
