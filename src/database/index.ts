import { i18n } from "../i18n";
import { useDatabase } from "../store/database";

export class BasicDatabase {
    index = 0;
    label =  "No database"
    name = "BasicDatabase";
    data = {}


    init() {
        return true;
    }

    t(key: string) {
        const t = i18n.global.t;
        return t("database." + this.name + "." + key);
    }

    async query() {
        return "";
    }

    async insert() {
        return "";
    }

    settings(): any[] {
        return [];
    }

    
}
