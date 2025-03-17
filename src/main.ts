import { createApp } from "vue";
import { createVuestic } from "vuestic-ui";

// css
import "./style.css";
import "./tailwind.css";
import "vuestic-ui/css";
import "material-design-icons-iconfont/dist/material-design-icons.min.css";

// vue-router is not included in the Vuestic UI plugin
import App from "./App.vue";
import { router } from "./router";

// pinia
import { createPinia } from "pinia";
import { autoStorageState } from "./store/plugins";
import { log } from "./utils/console";
import { i18n } from "./i18n";

const versionTypeID = "C8264F";

const app = createApp(App)
    .use(router)
    .use(createPinia().use(autoStorageState))
    .use(createVuestic({}))
    .use(i18n);

app.mount("#app");

log.tip(`VERSION(${versionTypeID})`, "ECHOSHARE WEBRTC SHARE SCREEN STARTED");

window.__DEBUG_LOG = import.meta.env.DEV;
window.__DEBUG_ERROR = import.meta.env.DEV;
window.__HANDLER_IS_INIT = import.meta.env.DEV;

// window.localStorage.setItem("WEBRTC_STATE_META", "")
// window.localStorage.setItem("WEBRTC_STATE_PEER", "")
