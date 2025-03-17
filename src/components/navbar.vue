<script setup lang="ts">
import { defineModel } from "vue";
import { useI18n } from "vue-i18n";
import { languages } from "../i18n";
import { useMetaStore } from "../store/meta";
import titleimg from "../assets/title.png";


const navColor = "#fff";
const { locale } = useI18n();
const metaStore = useMetaStore();
const showSidebar = defineModel<number>({ default: 0 });

locale.value = metaStore.language;

const changeLanguage = (item: (typeof languages)[0]) => {
    locale.value = item.value;
    metaStore.language = item.value;
};
</script>

<template>
    <VaNavbar :color="navColor" class="mb-3 shadow-md">
        <template #left>
            <VaButton
                :color="navColor"
                :icon="showSidebar ? 'menu_open' : 'menu'"
                @click="showSidebar = (showSidebar + 1) % 2"
            />
            <VaNavbarItem>
                <img
                    :src="titleimg"
                    alt="web-logo"
                    class="w-40 max-w-full max-h-full ml-3"
                />
            </VaNavbarItem>
        </template>
        <template #right>
            <VaMenu contentClass="i18n-config-bar">
                <template #anchor>
                    <VaButton :color="navColor" icon="language"></VaButton>
                </template>

                <VaMenuItem
                    @selected="changeLanguage(item)"
                    v-for="item in languages"
                    :key="item.value"
                >
                    <div class="language-item">
                        <span
                            :style="{
                                color:
                                    item.value === $i18n.locale
                                        ? 'blue'
                                        : 'default',
                            }"
                            >{{ item.text }}</span
                        >
                    </div>
                </VaMenuItem>
            </VaMenu>
        </template>
    </VaNavbar>
</template>

<style scoped>
:deep(div.va-navbar__right button span > i) {
    font-size: 1.5em !important;
}

.i18n-config-bar .va-menu-item:not(:last-child) .language-item {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5em;
}
</style>
