<script setup lang="ts">
import { usePeer } from "../../store/peer";
import { tryConnect } from "../../leancloud/query";
import { toastErr, toastTip } from "../../utils/toast";
import { ref } from "vue";

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
            toastTip("Connect to remote UID database successfully 👍");
        }).catch(() => {
            isLoading.value = false;
            toastErr("Connection failed 😭");
        });
    }
}
</script>

<template>
    <!-- <VaCheckbox
        v-model="MetaStore.debug"
        class="w-full ml-3 mb-4"
        :label="
            MetaStore.debug
                ? '启用详细 debug'
                : '关闭详细 debug'
        "
    /> -->

    <VaCheckbox
        v-model="PeerStore.autoRequireStream"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.autoRequireStream
                ? 'Enable automatic media reception'
                : 'Disable automatic media reception'
        "
    />

    <br />

    <VaCheckbox
        v-model="PeerStore.enableAutoRefetch"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="
            PeerStore.enableAutoRefetch
                ? 'Enable automatic disconnect and reconnect'
                : 'Disable automatic disconnect and reconnect'
        "
    />

    <br />

    <VaCheckbox
        v-model="PeerStore.autoTryPlay"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="PeerStore.autoTryPlay ? 'Enable timed playback check' : 'Disable timed playback check'"
    />

    <!-- <VaCheckbox
        class="w-full ml-3 mb-4"
        v-model="PeerStore.enableSmartSTUN"
        :label="
            PeerStore.enableSmartSTUN
                ? '启用自动 STUN/TURN'
                : '关闭自动 STUN/TURN'
        "
    /> -->

    <br />

    <VaCheckbox
        v-model="PeerStore.enableQuery"
        class="w-full ml-3 mb-6 sm:mb-4"
        :label="PeerStore.enableQuery ? 'Enable UID Remote Database' : 'Disable UID Remote Database'"
    />

    <div v-if="PeerStore.enableQuery" class="mb-4">
        <VaButton class="ml-2" @click="checkSqlConnect" :loading="isLoading">
            测试远程数据库</VaButton
        >

        <VaInput
            class="w-full mt-6"
            v-model="PeerStore.remoteAPP_ID"
            label="APP_ID (Only leanCloud is currently supported)"
        />

        <VaInput
            class="w-full mt-4"
            v-model="PeerStore.remoteAPP_KEY"
            label="APP_KEY (Only leanCloud is currently supported)"
        />

        <VaInput
            class="w-full mt-4"
            v-model="PeerStore.remoteSERVER_URL"
            label="SERVER_URL (Only leanCloud is currently supported)"
        />
    </div>

    <div class="w-full mt-2 mb-6">
        <VaInput
            class="w-full"
            v-model="PeerStore.maxOutOfTime"
            label="Global maximum timeout threshold for all network communications (ms)"
            type="number"
        />
    </div>
</template>
