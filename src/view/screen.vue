<script lang="ts" setup>
import { Ref, ref, watch } from "vue";
import dayjs from "dayjs";
import Peer, { MediaConnection } from "peerjs";
import ClipBoard from "clipboardy";
import { usePeer } from "../store/peer";
import MediaConfig from "../components/mediaConfig.vue";
import { createStreamNew } from "../utils/webrtc/createStream";
import { closePeer, createPeerInstanceByMode } from "../utils/webrtc/connect";
import { useAutoPlay } from "../utils/hooks/useAutoPlay";
import {
    toastBigError,
    toastErr,
    toastSuccess,
    toastTip,
} from "../utils/toast";
import { supportClipboard, supportWebRTC } from "../utils/device";
import { consoleError, debug, log } from "../utils/console";
import { useHistoryStore } from "../store/history";
import { useWebhook } from "../store/webhook";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
let peerInstance: Ref<null | Peer> = ref(null);
let localStream: Ref<null | MediaStream> = ref(null);
let currentPeer: Ref<null | MediaConnection> = ref(null);
const route = useRoute();
const router = useRouter();
const WebhookStore = useWebhook();
const HistoryStore = useHistoryStore();

const historyItem = ref({
    uid: "",
    time: "",
    timestamp: new Date().getTime(),
    result: "fail" as "fail" | "success",
    action: "share" as "share" | "receive",
});

const peerUID = ref((route.query.uid as string) || "");
const PeerStore = usePeer();
const finalID = ref("");
const isFindStream = ref(false);
const videoIsFitscreen = ref(false);
const screenVideo = ref(null as HTMLVideoElement | null);
const connectTimer = ref(null as null | NodeJS.Timeout);
const heartbeatChecker = ref(null as null | NodeJS.Timeout);

function clearConnectionTimer() {
    if (connectTimer.value !== null) {
        clearInterval(connectTimer.value);
    }

    connectTimer.value = null;
}

watch(
    () => peerUID.value,
    (value) => {
        router.push({ query: { uid: value } });
        safeClosePeer();
    }
);

watch(
    () => route.query.uid,
    (value) => {
        peerUID.value = value as string;
        safeClosePeer();
    }
);

function safeClosePeer(force = false) {
    isFindStream.value = false;
    if (peerInstance.value || force) {
        log.warning("Peer instance will be cleaned", finalID.value);
        closePeer(peerInstance, currentPeer, localStream);
    }
}

useAutoPlay(screenVideo, "Sender");

function createPeerConnection(stream: MediaStream, isFirstTime = true) {
    if (!stream.active) {
        debug(["share media check:", "stream is not active"]);
        clearConnectionTimer();
        safeClosePeer();
        return;
    }

    if (isFirstTime) {
        debug(["share media check:", "stream is active"]);
        finalID.value = peerUID.value || stream.id;
        peerInstance.value = createPeerInstanceByMode(finalID.value);

        peerInstance.value!.on("call", (call) => {
            call.answer(stream);
            currentPeer.value = call;
            log.info("Acceptad requests", call.peer);
            toastSuccess(t("toast.findConnect") + "<br />" + call.peer);
        });

        peerInstance.value!.on("connection", (conn) => {
            setInterval(() => {
                conn.send(
                    t("toast.senderheartbeatcheck") +
                        "<br />" +
                        dayjs().format("YYYY-MM-DD HH:mm:ss")
                );
            }, 2000);

            conn.on("data", (data) => {
                if (
                    typeof data === "string" &&
                    data.startsWith("[TOAST_IN_CONSOLE]")
                ) {
                    debug(["toast-in-console", data.slice(18)]);
                } else {
                    toastSuccess(t("toast.findMsg") + "<br />" + data);
                }
                if (heartbeatChecker.value) {
                    clearTimeout(heartbeatChecker.value);
                    heartbeatChecker.value = null;
                }

                heartbeatChecker.value = setTimeout(() => {
                    toastBigError(
                        t("toast.loseConnect") + "<br />" + conn.peer
                    );
                }, 4000);
            });
        });
    }
}

async function findScreenStream() {
    if (!supportWebRTC()) {
        return;
    }
    safeClosePeer();
    clearConnectionTimer();

    try {
        // find stream
        const stream = await createStreamNew();
        isFindStream.value = true;
        localStream.value = stream;
        log.success("Media stream created", stream.id);
        debug(["Please check the media information", stream]);

        // create peer instance
        createPeerConnection(stream, true);

        connectTimer.value = setInterval(() => {
            createPeerConnection(stream, false);
        }, 2000) as NodeJS.Timeout;

        log.success("Peer instance created", peerInstance.value?.id);
        debug(["Please check Peer instance", { ...peerInstance.value }]);

        // set peer UID
        peerUID.value = peerInstance.value!.id;
        historyItem.value.uid = peerUID.value;
        historyItem.value.time = dayjs().format("YYYY-MM-DD HH:mm:ss");

        // play video
        if (screenVideo.value !== null) {
            screenVideo.value.srcObject = stream;
            screenVideo.value.play();
            screenVideo.value.muted = true;
        }

        WebhookStore.sendRequest(
            "post",
            {
                action: "share",
                uid: historyItem.value.uid,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                hook: "on-post",
            },
            () => {
                toastTip(t("webhook.postURLWebhookSuccess"));
            },
            () => {
                toastErr(t("webhook.postURLWebhookFail"));
            }
        );

        historyItem.value.result = "success";

        WebhookStore.sendRequest(
            "success",
            {
                action: "share",
                uid: historyItem.value.uid,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                result: "success",
                hook: "on-success",
            },
            () => {
                toastTip(t("webhook.successURLWebhookSuccess"));
            },
            () => {
                toastErr(t("webhook.successURLWebhookFail"));
            }
        );
    } catch (e: any) {
        safeClosePeer(true);
        consoleError([
            "sharing error",
            e,
            dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ]);
        if (e.name === "NotAllowedError") {
            toastErr(t("toast.NotAllowedError"));
        } else if (e.toString().includes("not a function")) {
            toastErr(t("toast.NoMethodError"));
        } else if (e.toString().includes("At least one")) {
            toastErr(t("toast.NoSelectedError"));
        } else {
            toastErr(t("toast.mediaErr"));
        }
        WebhookStore.sendRequest(
            "fail",
            {
                action: "share",
                uid: historyItem.value.uid,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                result: "fail",
                hook: "on-fail",
            },
            () => {
                toastTip(t("webhook.failURLWebhookSuccess"));
            },
            () => {
                toastErr(t("webhook.failURLWebhookFail"));
            }
        );
    }
    HistoryStore.history.push(historyItem.value);

    window.addEventListener("beforeunload", () => {
        safeClosePeer();
    });
}

function copyUID() {
    if (!supportClipboard()) {
        return;
    }
    if (!peerUID.value) {
        toastErr(t("toast.noUIDToShare"));
        return;
    }

    let url =
        new URL(window.location.href).origin + "/~receive?uid=" + peerUID.value;
    if (PeerStore.autoTryPlay) {
        url += "&autoplay";
    }
    ClipBoard.write(url).then(() => {
        toastTip(t("toast.copySuccess") + url);
    });
}

function changeMediaMode() {
    safeClosePeer();
    isFindStream.value = false;
}

function clearPeerUID() {
    peerUID.value = "";
    PeerStore.targetUID = "";
    router.push({ query: { uid: "" } });
}
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col w-5/6 mb-4">
            <VaCardTitle class="text-lg">{{ $t("share.title") }}</VaCardTitle>

            <VaCardContent>
                <div class="flex items-end">
                    <VaInput
                        clearable
                        :label="$t('share.input')"
                        class="grow w-24 md:w-auto"
                        v-model="peerUID"
                        :placeholder="$t('share.placeholder')"
                        @clear="clearPeerUID"
                    />
                    <div class="flex grow-0 flex-row justify-end ml-2">
                        <VaButton
                            @click="copyUID"
                            style="height: 34px"
                            round
                            class="grow-0"
                            icon="share"
                            v-if="isFindStream"
                        />
                        <VaButton
                            @click="findScreenStream"
                            style="height: 34px"
                            round
                            class="grow-0 ml-2"
                            icon="preview"
                            v-else
                        />
                    </div>
                </div>
                <MediaConfig
                    :show-title="false"
                    @changeMediaMode="changeMediaMode"
                ></MediaConfig>
            </VaCardContent>
        </VaCard>

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
            </div>
        </Teleport>
    </div>
</template>
