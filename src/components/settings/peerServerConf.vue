<script setup lang="ts">
import { ref, watch } from "vue";
import { usePeer } from "../../store/peer";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const PeerStore = usePeer();
const peerModeOptions = [
    {
        value: 0,
        text: "Using Public Peer Node",
    },
    {
        value: 1,
        text: "Using Custom Peer Node",
    },
];

const peerMode = ref(peerModeOptions[PeerStore.peerModeIndex]);

watch(peerMode, (value) => {
    PeerStore.peerModeIndex = value.value;
});
</script>

<template>
    <h1>{{ $t("settings.peerSettingsTitle") }}</h1>

    <VaSelect
        text-by="text"
        v-model="peerMode"
        class="w-full mt-6 sm:mt-4"
        :label="$t('settings.peerSelectLabel')"
        :options="peerModeOptions"
        :placeholder="$t('settings.peerSelectPlaceholder')"
    />

    <VaInput
        v-if="PeerStore.peerModeIndex === 0"
        class="w-full text-gray-400 mt-3 mb-3 max-sm:pt-3"
        :label="$t('settings.serverURLInputLabel')"
        readonly
        v-model="PeerStore.defaultParams.serverURL"
    />

    <VaInput
        v-if="PeerStore.peerModeIndex === 1"
        class="w-full mt-4 mb-3"
        :label="$t('settings.serverURLInputLabel')"
        :placeholder="$t('settings.serverURLInputExamplePlaceholder')"
        v-model="PeerStore.serverURL"
    />
</template>
