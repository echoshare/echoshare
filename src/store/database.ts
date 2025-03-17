import { defineStore } from "pinia";
import { BasicDatabase } from "../database";

export const useDatabase = defineStore("database", {
    state() {
        return {
            index: 0,
            instances: [] as Array<BasicDatabase>,
        };
    },

    actions:{
        loadDataBase(databases: Array<BasicDatabase>) {
            for(const database of databases) {
                const data = this.instances[database.index]?.data || {};
                database.data = data;
                this.instances[database.index] = database;
            }

            this.instances[this.index]?.init();
        }
    }
});
