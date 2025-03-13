<script setup lang="ts">
import logo from "../assets/just-logo.png";
const props = defineProps<{
    title: string;
}>();
</script>

<template>
    <div class="mt-5">
        <div class="mt-5 flex">
            <VaCard class="m-auto flex flex-col grow-0 w-5/6 sm:w-1/2 lg:w-1/3">
                <VaCardTitle class="text-lg">
                    <img
                        :src="logo"
                        alt="web-logo"
                        class="max-w-full max-h-full m-auto hajimi-logo w-64"
                    />
                </VaCardTitle>
                <VaCardContent>
                    <h2 class="text-center">{{ props.title }}</h2>
                    <div class="flex justify-around mt-5 max-sm:pt-2">
                        <VaButton class="grow-0" to="/~share">
                            Sharing
                        </VaButton>
                        <VaButton class="grow-0" to="/~receive">
                            Receive
                        </VaButton>
                    </div>
                </VaCardContent>
            </VaCard>
        </div>
    </div>
</template>

<style>
/* @keyframes hajimi-gogogo {
    0% {
        transform: rotate(10deg) scale(0.9);
    }

    50% {
        transform: rotate(0deg) scale(1);
    }

    100% {
        transform: rotate(-10deg) scale(0.9);
    }
} */
</style>
