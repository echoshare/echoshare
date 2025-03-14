import { defineStore } from "pinia";

export const useHistoryStore = defineStore("history", {
    state() {
        return {
            history: [] as Array<{
                uid: string;
                timestamp: number;
                result: "success" | "fail";
                action: "share" | "receive";
                time: string; // YYYY-MM-DD HH:MM:SS
            }>,
        }
    },
});
