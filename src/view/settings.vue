<script setup lang="ts">
import StunConf2 from "../components/settings/stunConf2.vue";
import videoFormat from "../components/settings/videoFormat.vue";
import CheckboxConf from "../components/settings/checkboxConf.vue";
import PeerServerConf from "../components/settings/peerServerConf.vue";
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col xl6 sm10 xs11">
            <VaCardTitle class="text-lg"> {{ $t("settings.title") }} </VaCardTitle>
            <VaCardContent>
                <CheckboxConf></CheckboxConf>
                <videoFormat></videoFormat>
                <PeerServerConf></PeerServerConf>
                <StunConf2></StunConf2>
            </VaCardContent>
        </VaCard>
    </div>
</template>
