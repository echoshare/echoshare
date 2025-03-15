<template>
    <div class="mt-8 pb-6 text-center">

        <a
            href="https://github.com/echoshare/echoshare"
            target="_blank"
            class="inline-block"
        >
            <img :src="githubSvg" alt="github" class="w-8 h-8" />
        </a>

        <p class="mt-3.5 mb-2">{{ anthor }} &copy; {{ year }}</p>

        
    </div>
</template>

<script lang="ts" setup>
import { useMetaStore } from "../store/meta";
import githubSvg from "../assets/github.svg";

const { anthor, year } = useMetaStore();
</script>


