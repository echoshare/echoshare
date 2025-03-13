import { defineStore } from "pinia";

export const useMetaStore = defineStore("meta", {
    state() {
        return {
            title: __TITLE__,
            anthor: "EchoShare",
            year: "2025",
            debug: true
        };
    },
});
