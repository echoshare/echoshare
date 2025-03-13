<script setup lang="ts">
import logo from "../assets/navlogo.png"
import { defineModel } from "vue"

const navColor = "#fff";
const showSidebar = defineModel<number>({ default: 0 });

</script>

<template>
  <VaNavbar :color="navColor" class="mb-3 shadow-md">
    <template #left>
      <VaButton :color="navColor" :icon="showSidebar ? 'menu_open' : 'menu'" @click="showSidebar = (showSidebar+1)%2" />
      <VaNavbarItem>
        <p class="ml-2.5 w-full whitespace-nowrap">EchoShare</p>
      </VaNavbarItem>
    </template>
    <template #right>
      <VaNavbarItem class="hidden sm:block">
        <img :src="logo" alt="web-logo" class="w-16 max-w-full max-h-full" />
      </VaNavbarItem>
    </template>
  </VaNavbar>
</template>
