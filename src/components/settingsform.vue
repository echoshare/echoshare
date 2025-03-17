<script setup lang="ts">
import StunConf from "./settings/stunConf.vue";
import CheckboxConf from "./settings/checkboxConf.vue";
import PeerServerConf from "./settings/peerServerConf.vue";
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col xl6 sm10 xs11">
            <VaCardTitle class="text-lg"> {{ $t("settings.title") }} </VaCardTitle>
            <VaCardContent>
                <CheckboxConf></CheckboxConf>
                <PeerServerConf></PeerServerConf>
                <StunConf></StunConf>
            </VaCardContent>
        </VaCard>
    </div>
</template>
