<template>
    <h1 class="mt-6" v-show="props.showTitle">{{ $t("media.title") }}</h1>

    <div class="mt-6 sm:mt-4 max-sm:mb-4 flex flex-wrap w-full xl:w-1/2">
        <div class="basis-1/2 sm:basis-1/4 grow">
            <VaCheckbox v-model="PeerStore.mediaMode.useScreen" :label="$t('media.screen')" />
        </div>
        <div class="basis-1/2 sm:basis-1/4 grow">
            <VaCheckbox v-model="PeerStore.mediaMode.useCamera" :label="$t('media.camera')" />
        </div>

        <div class="basis-1/2 sm:basis-1/4 grow max-sm:mt-4">
            <VaCheckbox v-model="PeerStore.mediaMode.useAudio" :label="$t('media.audio')" />
        </div>
        <div class="basis-1/2 sm:basis-1/4 grow max-sm:mt-4">
            <VaCheckbox
                v-model="PeerStore.mediaMode.useMircophone"
                :label="$t('media.microphone')"
            />
        </div>
    </div>
    <VaSelect
        text-by="text"
        v-model="PeerStore.mediaMode"
        class="w-full mt-4"
        :label="$t('media.mediaModeLabel')"
        :options="mediaModeOptions()"
        :placeholder="$t('media.mediaModePlaceholder')"
    />

    <VaSelect
        text-by="label"
        v-if="PeerStore.mediaMode.useCamera"
        v-model="PeerStore.videoDeviceId"
        value-by="deviceId"
        class="w-full mt-4"
        :label="$t('media.videoDeviceIdLabel')"
        :options="PeerStore.videoDevices"
        :placeholder="$t('media.videoDeviceIdPlaceholder')"
    />

    <VaSelect
        text-by="label"
        v-if="PeerStore.mediaMode.useMircophone"
        v-model="PeerStore.audioDeviceId"
        value-by="deviceId"
        class="w-full mt-4"
        :label="$t('media.audioDeviceIdLabel')"
        :options="PeerStore.audioDevices"
        :placeholder="$t('media.audioDeviceIdPlaceholder')"
    />

   
</template>

<script lang="ts" setup>
import { watch, defineEmits } from "vue";
import { usePeer } from "../store/peer";
import { useI18n } from "vue-i18n"

const { t, locale } = useI18n();
const PeerStore = usePeer();
const emit = defineEmits(["changeMediaMode"]);
const props = defineProps({
    showTitle: {
        type: Boolean,
        default: true,
    },
});

const mediaModeOptions = () => [
    {
        value: 0,
        text: t("mediaModeOptions.0"),
        useScreen: true,
        useCamera: false,
        useAudio: true,
        useMircophone: true,
    },
    {
        value: 1,
        text: t("mediaModeOptions.1"),
        useScreen: true,
        useCamera: false,
        useAudio: false,
        useMircophone: true,
    },
    {
        value: 2,
        text: t("mediaModeOptions.2"),
        useScreen: true,
        useCamera: false,
        useAudio: true,
        useMircophone: false,
    },
    {
        value: 3,
        text: t("mediaModeOptions.3"),
        useScreen: true,
        useCamera: false,
        useAudio: false,
        useMircophone: false,
    },
    {
        value: 4,
        text: t("mediaModeOptions.4"),
        useCamera: true,
        useMircophone: true,
        useScreen: false,
        useAudio: true,
    },
    {
        value: 5,
        text: t("mediaModeOptions.5"),
        useCamera: true,
        useMircophone: true,
        useScreen: false,
        useAudio: false,
    },
    {
        value: 6,
        text: t("mediaModeOptions.6"),
        useCamera: true,
        useMircophone: false,
        useScreen: false,
        useAudio: true,
    },
    {
        value: 7,
        text: t("mediaModeOptions.7"),
        useCamera: true,
        useMircophone: false,
        useScreen: false,
        useAudio: false,
    },
];

watch(
    [() => PeerStore.mediaMode.useScreen, () => PeerStore.mediaMode.useCamera],
    ([useScreen, useCamera], [useScreenOld, useCameraOld]) => {
        if (useScreenOld !== useScreen) {
            PeerStore.mediaMode.useCamera = !useScreen;
            return;
        }

        if (useCameraOld !== useCamera) {
            PeerStore.mediaMode.useScreen = !useCamera;
            return;
        }
    }
);

function findSelectedOption() {
    return mediaModeOptions().find(
        (item) =>
            item.useAudio === PeerStore.mediaMode.useAudio &&
            item.useCamera === PeerStore.mediaMode.useCamera &&
            item.useMircophone === PeerStore.mediaMode.useMircophone &&
            item.useScreen === PeerStore.mediaMode.useScreen
    );
}

PeerStore.mediaMode.text = findSelectedOption()?.text ?? "";
PeerStore.mediaMode.value = findSelectedOption()?.value ?? 0;

watch(
    [
        PeerStore.mediaMode,
        () => PeerStore.audioDeviceId,
        () => PeerStore.videoDeviceId,
        () => PeerStore.audioutDeviceId,
        () => locale.value
    ],
    () => {
        PeerStore.mediaMode.text = findSelectedOption()?.text ?? "";
        PeerStore.mediaMode.value = findSelectedOption()?.value ?? 0;
        emit("changeMediaMode");
    }
);
</script>
