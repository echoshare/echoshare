import { defineStore } from "pinia";
export const useWebhook = defineStore("webhook", {
    state() {
        return {
            getURL: "",
            postURL: "",
            successURL: "",
            failURL: "",

        };
    },

   
});
