<script setup lang="ts">
import Welcome from "../components/welcome.vue";
</script>

<template>
    <div class="app-home">
        <Welcome :title="$t('home.title')"></Welcome>
    </div>
</template>

<style>
.app-home .echoshare-logo {
    animation: echoshare-gogogo 2s ease-in-out 0s alternate-reverse infinite;
}
</style>
