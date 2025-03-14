<script setup lang="ts">
import logo from "../assets/just-logo.png";
const props = defineProps<{
    title: string;
}>();
</script>

<template>
    <div class="mt-5">
        <div class="mt-5 flex">
            <VaCard class="m-auto flex flex-col grow-0 w-5/6 sm:w-1/2 lg:w-2/5">
                <VaCardTitle class="text-lg">
                    <img
                        :src="logo"
                        alt="web-logo"
                        class="max-w-full max-h-full m-auto echoshare-logo w-72"
                    />
                </VaCardTitle>
                <VaCardContent>
                    <h2 class="text-center">{{ props.title }}</h2>
                    <p class="text-center pt-3">When using this application for the first time in the browser,<br />please enable microphone, camera, and clipboard permissions</p>
                    <div class="flex justify-around mt-4 max-sm:pt-2 pb-4">
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
/* @keyframes echoshare-gogogo {
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
