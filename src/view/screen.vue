<script lang="ts" setup>
import { Ref, ref, watch } from "vue";
import dayjs from "dayjs";
import Peer, { MediaConnection } from "peerjs";
import ClipBoard from "clipboardy";
import { usePeer } from "../store/peer";
import MediaConfig from "../components/mediaConfig.vue";
import { createStreamNew } from "../utils/webrtc/createStream";
import {
    closePeer,
    createPeerInstanceByMode,
} from "../utils/webrtc/connect";
import { useAutoPlay } from "../utils/hooks/useAutoPlay";
import { toastErr, toastTip } from "../utils/toast";
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
const isFindStream = ref(false);
const videoIsFitscreen = ref(false);
const screenVideo = ref(null as HTMLVideoElement | null);

watch(
    () => peerUID.value,
    (value) => {
        router.push({ query: { uid: value } });
    }
);

watch(
    () => route.query.uid,
    (value) => {
        peerUID.value = value as string;
    }
);

function clearPeer() {
    isFindStream.value = false;
    if (peerInstance.value && peerInstance.value.id) {
        log.warning("Peer instance will be cleaned", peerInstance.value.id);
        closePeer(peerInstance.value, currentPeer.value, localStream.value);
    }
}

useAutoPlay(screenVideo, "Sender");

function findScreenStream() {
    if (!supportWebRTC()) {
        return;
    }
    clearPeer();
    createStreamNew()
        .then((stream) => {
            // find stream
            isFindStream.value = true;
            localStream.value = stream;
            log.success("Media stream created", stream.id);
            debug(["Please check the media information", stream]);

            // create peer instance
            peerInstance.value = createPeerInstanceByMode(
                peerUID.value || stream.id
            );
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

            WebhookStore.sendRequest("post", {
                action: "share",
                uid: historyItem.value.uid ,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp
            }, () => {
                toastTip(t("webhook.getURLWebhookSuccess"));
            }, () => {
                toastErr(t("webhook.getURLWebhookFail"));
            });

            return stream;
        })
        .then((stream) => {
            peerInstance.value!.on("call", (call) => {
                call.answer(stream);
                currentPeer.value = call;
                log.info("Acceptad requests", call.peer);
            });
            historyItem.value.result = "success";

            WebhookStore.sendRequest("success", {
                action: "share",
                uid: historyItem.value.uid ,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                result: "success"
            }, () => {
                toastTip(t("webhook.successURLWebhookSuccess"));
            }, () => {
                toastErr(t("webhook.successURLWebhookFail"));
            });
            return stream;
        })
        .catch((e) => {
            consoleError(e);
            if (e.name === "NotAllowedError") {
                toastErr(t("toast.NotAllowedError"));
                return;
            }

            if (e.toString().includes("not a function")) {
                toastErr(t("toast.NoMethodError"));
                return;
            }
            if (e.toString().includes("At least one")) {
                
                toastErr(t("toast.NoSelectedError"));
                return;
            }
            toastErr(t("toast.mediaErr"));
            WebhookStore.sendRequest("fail", {
                action: "share",
                uid: historyItem.value.uid ,
                time: historyItem.value.time,
                timestamp: historyItem.value.timestamp,
                result: "success"
            }, () => {
                toastTip(t("webhook.failURLWebhookSuccess"));
            }, () => {
                toastErr(t("webhook.failURLWebhookFail"));
            });
        })
        .finally(() => {
            HistoryStore.history.push(historyItem.value);
        });

    window.addEventListener("beforeunload", () => {
        clearPeer();
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
    clearPeer();
    isFindStream.value = false;
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
                        @clear="
                            (peerUID = ''), $router.push({ query: { uid: '' } })
                        "
                    />
                    <div class="flex grow-0 flex-row justify-end ml-4">
                        <VaButton
                            @click="copyUID"
                            style="height: 34px"
                            round
                            class="grow-0"
                            icon="share"
                        />
                        <VaButton
                            @click="findScreenStream"
                            style="height: 34px"
                            round
                            class="grow-0 ml-2"
                            icon="preview"
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
