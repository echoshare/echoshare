import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HistoryAction = "share" | "receive";
export type HistoryResult = "success" | "fail";

export interface HistoryRecord {
  uid: string;
  timestamp: number;
  action: HistoryAction;
  result: HistoryResult;
}

interface HistoryStore {
  records: HistoryRecord[];
  add: (record: HistoryRecord) => void;
  clear: () => void;
}

const MAX_RECORDS = 100;

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      records: [],
      add: (record) =>
        set((state) => ({ records: [record, ...state.records].slice(0, MAX_RECORDS) })),
      clear: () => set({ records: [] }),
    }),
    {
      name: "ECHOSHARE_HISTORY",
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
