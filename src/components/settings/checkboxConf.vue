<script setup lang="ts">
import { usePeer } from "../../store/peer";
import { tryConnect } from "../../leancloud/query";
import { toastErr, toastTip } from "../../utils/toast";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const PeerStore = usePeer();
const isLoading = ref(false);

function checkSqlConnect() {
    const conn = tryConnect();
    if (conn) {
        isLoading.value = true;
        conn.then((res) => {
            if (!res.data?.iso) {
                throw new Error();
            }
            isLoading.value = false;
            toastTip(t("toast.sqlSuccess"));
        }).catch(() => {
            isLoading.value = false;
            toastErr(t("toast.sqlFail"));
        });
    }
}
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

    <br />

    <VaCheckbox
        v-model="PeerStore.enableQuery"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.enableQuery
                ? $t('settings.queryEnable')
                : $t('settings.queryDisable')
        "
    />

    

    <div v-if="PeerStore.enableQuery" class="mb-4">
        <VaButton class="ml-2" @click="checkSqlConnect" :loading="isLoading">
            {{ $t("settings.remoteDatabaseTest") }}
        </VaButton>

        <VaInput
            class="w-full mt-6"
            v-model="PeerStore.remoteAPP_ID"
            :label="$t('settings.remoteAPP_ID')"
        />

        <VaInput
            class="w-full mt-4"
            v-model="PeerStore.remoteAPP_KEY"
            :label="$t('settings.remoteAPP_KEY')"
        />

        <VaInput
            class="w-full mt-4"
            v-model="PeerStore.remoteSERVER_URL"
            :label="$t('settings.remoteSERVER_URL')"
        />
    </div>

    <div class="w-full mt-2 mb-6">
        <VaInput
            class="w-full"
            v-model="PeerStore.maxOutOfTime"
            :label="$t('settings.timecheck')"
            type="number"
        />
    </div>
</template>
