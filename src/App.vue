<script setup lang="ts">
import { ref } from "vue";
import navBar from "./components/navbar.vue";
import footerApp from "./components/footer.vue";
import { autoMatchRoute } from "./router/automatch";
import { usePeer } from "./store/peer";
import { debug, log } from "./utils/console";
import { requestDevicePermissions } from "./utils/webrtc/createStream";

const page = ref(0);
const showSidebar = ref(0);

function closeSideBar(activePage: number) {
    page.value = activePage;
    showSidebar.value = 0;
}
autoMatchRoute(page);
const PeerStore = usePeer();
PeerStore.findDevices().then(async () => {
    log.success(
        "DEVICE FOUND",
        "Available device information for the current device has been obtained"
    );
    await requestDevicePermissions(false);
    debug("Please check devices", [
        ...PeerStore.audioDevices,
        ...PeerStore.videoDevices,
    ]);
});

</script>

<template>
    <VaLayout>
        <template #top>
            <navBar v-model="showSidebar"></navBar>
        </template>

        <template #left>
            <Transition name="va-sidebar-trans">
                <VaSidebar v-if="showSidebar" class="w-screen md:w-full">
                    <VaSidebarItem
                        :active="page === 0"
                        @click="closeSideBar(0)"
                        to="/"
                    >
                        <VaSidebarItemContent>
                            <VaIcon name="home" />
                            <VaSidebarItemTitle>{{
                                $t("sidebar.home")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>
                    <VaSidebarItem
                        :active="page === 1"
                        @click="closeSideBar(1)"
                        to="/~share"
                    >
                        <VaSidebarItemContent>
                            <VaIcon class="material-icons">cast</VaIcon>
                            <VaSidebarItemTitle>{{
                                $t("sidebar.share")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>

                    <VaSidebarItem
                        :active="page === 2"
                        @click="closeSideBar(2)"
                        to="/~receive"
                    >
                        <VaSidebarItemContent>
                            <VaIcon class="material-icons"> preview </VaIcon>
                            <VaSidebarItemTitle>{{
                                $t("sidebar.receive")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>

                    <VaSidebarItem
                        :active="page === 3"
                        @click="closeSideBar(3)"
                        to="/~webhook"
                    >
                        <VaSidebarItemContent>
                            <VaIcon class="material-icons"> webhook </VaIcon>
                            <VaSidebarItemTitle>{{
                                $t("sidebar.webhook")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>

                    <VaSidebarItem
                        :active="page === 4"
                        @click="closeSideBar(4)"
                        to="/~history"
                    >
                        <VaSidebarItemContent>
                            <VaIcon name="history" />
                            <VaSidebarItemTitle>{{
                                $t("sidebar.history")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>

                    <VaSidebarItem
                        :active="page === 5"
                        @click="closeSideBar(5)"
                        to="/~settings"
                    >
                        <VaSidebarItemContent>
                            <VaIcon name="settings" />
                            <VaSidebarItemTitle>{{
                                $t("sidebar.settings")
                            }}</VaSidebarItemTitle>
                        </VaSidebarItemContent>
                    </VaSidebarItem>
                </VaSidebar>
            </Transition>
        </template>

        <template #content>
            <div class="transition ease-linear delay-300 max-sm:pt-2">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
            <footerApp></footerApp>
        </template>
    </VaLayout>
</template>

<style lang="css" scoped>
.va-sidebar-trans-enter-active,
.va-sidebar-trans-leave-active {
    transition: all 0.5s ease;
}

.va-sidebar-trans-enter-from,
.va-sidebar-trans-leave-to {
    transform: translateX(-100%);
}

:deep(.va-sidebar-item--active) {
    background-color: #117783 !important;
}
</style>
