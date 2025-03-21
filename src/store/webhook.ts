import axios, { AxiosResponse } from "axios";
import { defineStore } from "pinia";
import { debug } from "../utils/console";

export const useWebhook = defineStore("webhook", {
    state() {
        return {
            uniURL: "",
            getURL: "",
            postURL: "",
            successURL: "",
            failURL: "",
            custompayload: "",
        };
    },

    actions: {
        sendRequest(
            hook: "get" | "post" | "success" | "fail",
            data: any,
            onsuccess: (response: AxiosResponse<any, any>) => void,
            onfail: (error: any) => void,
            onfinally?: () => void
        ) {
            let url = this.uniURL,
                method = "POST";

            const customPlayload = Object.fromEntries(
                this.custompayload
                    .split("\n")
                    .filter((e) => e && e.trim().length > 2)
                    .map((e) => e.split("="))
            );

            const body = { ...data, custom: customPlayload };
            if (hook === "get" && this.getURL) {
                method = "GET";
                url = this.getURL;
            } else if (hook === "post" && this.postURL) {
                url = this.postURL;
            } else if (hook === "success" && this.successURL) {
                url = this.successURL;
            } else if (hook === "fail" && this.failURL) {
                url = this.failURL;
            }

            if (url === "") {
                return;
            }

            axios(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                data: body,
            })
                .then((response) => {
                    debug(["WEBHOOK DEBUG", url, body, response]);
                    if (response.status === 200) {
                        onsuccess(response);
                    }
                })
                .catch((error) => {
                    onfail(error);
                    debug(["WEBHOOK DEBUG", url, body, error]);
                })
                .finally(onfinally);
        },
    },
});
