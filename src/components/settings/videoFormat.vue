<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePeer } from "../../store/peer";
import { ref, watch } from "vue";
const PeerStore = usePeer();
const { t } = useI18n();

const formatOptions = [
    {
        value: "",
        text: t("settings.decodeDefaultName"),
    },
    {
        value: "AV1",
        text: "AV1",
    },
    {
        value: "H264",
        text: "H264",
    }, {
        value: "H265",
        text: "H265",
    },
    {
        value: "H266",
        text: "H266",
    },
];

const videoFormatMode = ref(formatOptions.find((item) => item.value === PeerStore.videoFormat));

watch(videoFormatMode, (value) => {
    if (value) {
        PeerStore.videoFormat = value.value;
    }
});

</script>

<template>
    <h1>{{ $t("settings.decodeSelect") }}</h1>

    <VaSelect text-by="text" v-model="videoFormatMode" class="w-full mt-6 sm:mt-4 mb-4"
        :label="$t('settings.decodeSelectTip')" :options="formatOptions"
        :placeholder="$t('settings.decodeSelectTip')" />

</template>
