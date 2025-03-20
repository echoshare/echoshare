<script setup lang="ts">
import { usePeer } from "../../store/peer";
const PeerStore = usePeer();
</script>

<template>
    <VaCheckbox
        v-model="PeerStore.autoRequireStream"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.autoRequireStream
                ? $t('settings.autoRequireStreamEnable')
                : $t('settings.autoRequireStreamDisable')
        "
    />

    <br />

    <VaCheckbox
        v-model="PeerStore.enableAutoRefetch"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.enableAutoRefetch
                ? $t('settings.autoRefetchEnable')
                : $t('settings.autoRefetchDisable')
        "
    />

    <br />

    <VaCheckbox
        v-model="PeerStore.autoTryPlay"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.autoTryPlay
                ? $t('settings.autoTryPlayEnable')
                : $t('settings.autoTryPlayDisable')
        "
    />

    <!-- <div class="w-full mt-2 mb-6">
        <VaInput
            class="w-full"
            v-model="PeerStore.maxOutOfTime"
            :label="$t('settings.timecheck')"
            type="number"
        />
    </div> -->
</template>
