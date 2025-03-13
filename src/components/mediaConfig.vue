<template>
    <h1 class="mt-6" v-show="props.showTitle">Media Capture Mode Configuration</h1>

    <div class="mt-6 sm:mt-4 max-sm:mb-4 flex flex-wrap w-full md:w-1/2">
        <div class="basis-1/2 sm:basis-1/4 grow">
            <VaCheckbox v-model="PeerStore.mediaMode.useScreen" label="Screen" />
        </div>
        <div class="basis-1/2 sm:basis-1/4 grow">
            <VaCheckbox v-model="PeerStore.mediaMode.useCamera" label="Camera" />
        </div>

        <div class="basis-1/2 sm:basis-1/4 grow max-sm:mt-4">
            <VaCheckbox v-model="PeerStore.mediaMode.useAudio" label="Audio" />
        </div>
        <div class="basis-1/2 sm:basis-1/4 grow max-sm:mt-4">
            <VaCheckbox
                v-model="PeerStore.mediaMode.useMircophone"
                label="Microphone"
            />
        </div>
    </div>
    <VaSelect
        text-by="text"
        v-model="PeerStore.mediaMode"
        class="w-full mt-4"
        label="Media Capture Mode"
        :options="mediaModeOptions"
        placeholder="Please select the media capture mode"
    />

    <VaSelect
        text-by="label"
        v-if="PeerStore.mediaMode.useCamera"
        v-model="PeerStore.videoDeviceId"
        value-by="deviceId"
        class="w-full mt-4"
        label="Available Camera Devices"
        :options="PeerStore.videoDevices"
        placeholder="Please select an available camera device"
    />

    <VaSelect
        text-by="label"
        v-if="PeerStore.mediaMode.useMircophone"
        v-model="PeerStore.audioDeviceId"
        value-by="deviceId"
        class="w-full mt-4"
        label="Available Microphone device"
        :options="PeerStore.audioDevices"
        placeholder="Please select an available microphone device"
    />

    <!-- <VaSelect
        text-by="label"
        v-if="PeerStore.mediaMode.useAudio"
        v-model="PeerStore.audioutDeviceId"
        value-by="deviceId"
        class="w-full mt-4"
        label="可用扬声器设备"
        :options="PeerStore.audioutDevices"
        placeholder="请选择可用扬声器设备"
    /> -->
</template>

<script lang="ts" setup>
import {  watch, defineEmits } from "vue";
import { usePeer } from "../store/peer";

const PeerStore = usePeer();
const emit = defineEmits(["changeMediaMode"]);
const props = defineProps({
    showTitle: {
        type: Boolean,
        default: true,
    },
});

const mediaModeOptions = [
    {
        value: 0,
        text: "Screen + Audio + Microphone",
        useScreen: true,
        useCamera: false,
        useAudio: true,
        useMircophone: true,
    },
    {
        value: 1,
        text: "Screen + Microphone",
        useScreen: true,
        useCamera: false,
        useAudio: false,
        useMircophone: true,
    },
    {
        value: 2,
        text: "Screen + Audio",
        useScreen: true,
        useCamera: false,
        useAudio: true,
        useMircophone: false,
    },
    {
        value: 3,
        text: "Screen",
        useScreen: true,
        useCamera: false,
        useAudio: false,
        useMircophone: false,
    },
    {
        value: 4,
        text: "Camera + Audio + Microphone",
        useCamera: true,
        useMircophone: true,
        useScreen: false,
        useAudio: true,
    },
    {
        value: 5,
        text: "Camera + Microphone",
        useCamera: true,
        useMircophone: true,
        useScreen: false,
        useAudio: false,
    },
    {
        value: 6,
        text: "Camera + Audio",
        useCamera: true,
        useMircophone: false,
        useScreen: false,
        useAudio: true,
    },
    {
        value: 7,
        text: "Camera",
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
    return mediaModeOptions.find(
        (item) =>
            item.useAudio === PeerStore.mediaMode.useAudio &&
            item.useCamera === PeerStore.mediaMode.useCamera &&
            item.useMircophone === PeerStore.mediaMode.useMircophone &&
            item.useScreen === PeerStore.mediaMode.useScreen
    );
}

watch(
    [
        PeerStore.mediaMode,
        () => PeerStore.audioDeviceId,
        () => PeerStore.videoDeviceId,
        () => PeerStore.audioutDeviceId,
    ],
    () => {
        PeerStore.mediaMode.text = findSelectedOption()?.text ?? "";
        PeerStore.mediaMode.value = findSelectedOption()?.value ?? 0;
        emit("changeMediaMode");
    }
);
</script>
