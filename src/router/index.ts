import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../view/home.vue";
import Page404 from "../view/page404.vue";
//import ScreenView from "../view/screen.vue";
//import ReceiveView from "../view/screen/receiveScreen.vue";
//import SettingsView from "../view/settings.vue";
const ScreenView = () => import("../view/screen.vue");
const FullView = () => import("../components/screen/fullview.vue");
const ReceiveView = () => import("../components/screen/receiveScreen.vue");
const SettingsView = () => import("../view/settings.vue");
const HistoryView = () => import("../view/history.vue");
const WebhookView = () => import("../view/webhook.vue");

const routes = [
    { path: "/", component: HomeView, name: "Home" },
    { path: "/~share", component: ScreenView, name: "Sender" },
    { path: "/~receive", component: ReceiveView, name: "Receiver" },
    { path: "/~webhook", component: WebhookView, name: "Webhook" },
    { path: "/~history", component: HistoryView, name: "History" },
    { path: "/~settings", component: SettingsView, name: "Settings" },
    { path: "/~view", component: FullView, name: "FullscreenReceiver" },
    { path: "/:pathMatch(.*)*", component: Page404, name: "404" },
];

export const routePaths = routes.map((e) => e.path);

const router = createRouter({
    routes,
    history: createWebHistory(),
});

router.beforeEach((to, from, next) => {
    if (
        Object.keys(from.query).length > 0 &&
        Object.keys(to.query).length === 0
    ) {
        next({
            path: to.path,
            query: from.query,
        });
    } else {
        next();
    }
});

export { router };
