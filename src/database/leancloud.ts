import { BasicDatabase } from ".";

import handler from "leancloud-storage";
import { log } from "../utils/console";

export class LeanCloudBase extends BasicDatabase {
    index = 1;
    name  = "LeanCloud";
    label = "LeanCloud database";
    data = {
        APP_ID: "",
        APP_KEY: "",
        SERVER_URL: "",
    };


    settings() {
        return [
            {
                name: "APP_ID",
                type: "string",
                placeholder: this.t("APP_ID"),
            },
            {
                name: "APP_KEY",
                type: "string",
                placeholder: this.t("APP_KEY"),
            },
            {
                name: "SERVER_URL",
                type: "string",
                placeholder: this.t("SERVER_URL"),
            },
        ];
    }

    init() {
        if (
            typeof this.data.APP_ID === "string" &&
            typeof this.data.APP_KEY === "string" &&
            typeof this.data.SERVER_URL === "string" &&
            this.data.APP_ID.length > 0 &&
            this.data.APP_KEY.length > 0 &&
            this.data.SERVER_URL.length > 0
        ) {
            if (window.__HANDLER_IS_INIT) {
                log.warning(
                    "Remote database",
                    "Initialization has been completed"
                );
                return true;
            }
            handler.init({
                appId: this.data.APP_ID,
                appKey: this.data.APP_KEY,
                serverURL: this.data.SERVER_URL,
            });
            log.success(
                "Remote database initialization complete",
                "APP_ID = " + this.data.APP_ID
            );
            window.__HANDLER_IS_INIT = true;
            return true;
        } else {
            return false;
        }
    }

    async query() {
        return "";
    }

    async insert() {
        return "";
    }
}
