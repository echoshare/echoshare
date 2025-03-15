<script setup lang="ts">
import { usePeer } from "../../store/peer";

const PeerStore = usePeer();
function addIceServers() {
    PeerStore.iceServers = [...PeerStore.iceServers, ""];
}

function deleteIceServers(index: number) {
    PeerStore.iceServers.splice(index, 1);
}
</script>

<template>
    <div class="flex flex-row items-baseline">
        <h1 class="grow-0 sm:block hidden">STUN/TURN Server Configuration</h1>
        <h1 class="grow-0 sm:hidden block">STUN/TURN Configuration</h1>
        <VaButton
            @click="addIceServers"
            round
            class="grow-0 scale-50 translate-y-1"
            icon="add"
        />
    </div>

    <p
        v-if="!PeerStore.iceServers || PeerStore.iceServers.length === 0"
        class="max-sm:pt-2 mt-3.5 font-mono"
    >
        😊 No STUN/TURN server
    </p>

    <template v-for="(_item, index) in PeerStore.iceServers">
        <div class="flex flex-row items-baseline flex-wrap">
            <VaInput
                class="mt-3 pr-4"
                style="width:calc(100% - 48px)"
                placeholder='Example "turn:example.com^username:password"'
                v-model="PeerStore.iceServers[index]"
            />

            <VaButton
                @click="deleteIceServers(index)"
                round
                class="grow-0 scale-75 translate-y-0.5"
                icon="delete"
            />
        </div>
    </template>
</template>
