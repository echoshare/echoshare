<script setup lang="ts">
import { useHistoryStore } from "../store/history";
import { computed, ref } from "vue";
import { useWindow } from "../utils/hooks/useDOM";
import { DataTableColumnSource, useGlobalConfig } from "vuestic-ui";
import { useModal } from "vuestic-ui";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const { confirm } = useModal();
const { mergeGlobalConfig } = useGlobalConfig();

mergeGlobalConfig({
    components: {
        presets: {
            VaPagination: {
                customPagination: {
                    color: "#177884",
                    activePageColor: "#117783",
                },
            },
        },
    },
});

const { width } = useWindow();
const HistoryStore = useHistoryStore();

const historyList = computed(() => {
    return HistoryStore.history.sort((a, b) => b.timestamp - a.timestamp);
});
const perPage = ref(10);
const currentPage = ref(1);
const pages = computed(() => {
    return perPage.value && perPage.value !== 0
        ? Math.ceil(historyList.value.length / perPage.value)
        : historyList.value.length;
});

const selectedItemsEmitted = ref([]);

const columns: () => DataTableColumnSource<string>[] = () => [
    {
        key: "time",
        label: t("history.labelTime"),
        thAlign: "center",
        tdAlign: "center",
        sortable: true,
        width: "190px",
        tdClass: "echoshare-history-time",
    },
    {
        key: "UID",
        thAlign: "center",
        tdAlign: "center",
        sortable: true,
        tdClass: "echoshare-history-uid",
    },
    {
        key: "ACTION",
        label: t("history.labelAction"),
        thAlign: "center",
        tdAlign: "center",
        sortable: true,
        width: "120px",
    },
    {
        key: "RESULT",
        label: t("history.labelResult"),
        thAlign: "center",
        tdAlign: "center",
        sortable: true,
        width: "120px",
    },
];

function deleteSelected(all = false) {
    if (all) {
        HistoryStore.history = [];
        selectedItemsEmitted.value = [];
        return;
    }
    const count = selectedItemsEmitted.value.length;
    confirm(t("history.deleteRecordsTip", { count })).then((ok) => {
        if (!ok) return;

        const timestamps = selectedItemsEmitted.value.map(
            (item: any) => item.timestamp
        );
        HistoryStore.history = HistoryStore.history.filter(
            (item: any) => !timestamps.includes(item.timestamp)
        );

        selectedItemsEmitted.value = [];
    });
}
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col w-5/6 mb-4">
            <VaCardTitle class="text-lg flex items-center w-full">
                <div class="flex-1 text-left">
                    {{ $t("history.titleAlwaysShow") }}
                    <span class="max-sm:hidden">{{
                        $t("history.titleCanHide")
                    }}</span>
                </div>
                <VaButton
                    color="danger"
                    icon="delete_sweep"
                    class="flex-none"
                    @click="deleteSelected(width < 640)"
                    :disabled="(selectedItemsEmitted.length === 0 && width > 640) || historyList.length == 0"
                >
                    <span class="max-sm:hidden">{{
                        $t("history.deleteWhatPC")
                    }}</span
                    ><span class="sm:hidden">{{
                        $t("history.deleteWhatPhone")
                    }}</span>
                </VaButton>
            </VaCardTitle>
            <VaCardContent>
                <div
                    v-if="historyList.length === 0"
                    class="text-center py-4 text-gray-500"
                >
                    {{ $t("history.noRecordsTip") }}
                </div>
                <div v-else>
                    <VaDataTable
                        :selectable="width > 640"
                        :items="historyList"
                        :per-page="perPage"
                        :current-page="currentPage"
                        :columns="columns()"
                        @selection-change="
                            selectedItemsEmitted = $event.currentSelectedItems
                        "
                    >
                        <template #cell(UID)="cell">
                            <VaButton
                                preset="secondary"
                                border-color="primary"
                                class="mr-6 mb-2"
                                size="small"
                                @click="
                                    cell.rowData.uid &&
                                        $router.push({
                                            query: { uid: cell.rowData.uid },
                                            path: '/~' + cell.rowData.action,
                                        })
                                "
                            >
                                {{ cell.rowData.uid || $t("history.NO_UID_LABLE") }}
                            </VaButton>
                        </template>
                        <template #cell(ACTION)="cell">
                            <VaButton
                                size="small"
                                :color="
                                    cell.rowData.action === 'share'
                                        ? 'info'
                                        : '#663BBD'
                                "
                                gradient
                                :icon-right="
                                    cell.rowData.action === 'share'
                                        ? 'arrow_forward'
                                        : ''
                                "
                                :icon="
                                    cell.rowData.action === 'share'
                                        ? ''
                                        : 'arrow_back'
                                "
                            >
                                {{
                                    cell.rowData.action === "share"
                                        ? $t("history.actionShare")
                                        : $t("history.actionReceive")
                                }}
                            </VaButton>
                        </template>

                        <template #cell(RESULT)="cell">
                            <VaButton
                                size="small"
                                :color="
                                    cell.rowData.result === 'success'
                                        ? 'success'
                                        : 'danger'
                                "
                                gradient
                                :icon="
                                    cell.rowData.result === 'success'
                                        ? 'check'
                                        : 'clear'
                                "
                            >
                                {{
                                    cell.rowData.result === "success"
                                        ? $t("history.resultSuccess")
                                        : $t("history.resultFail")
                                }}
                            </VaButton>
                        </template>
                    </VaDataTable>
                    <div class="flex mt-4 w-full">
                        <VaPagination
                            class="justify-center"
                            v-model="currentPage"
                            :pages="pages"
                            :visible-pages="3"
                            preset="customPagination"
                            gapped
                            rounded
                        />
                    </div>
                </div>
            </VaCardContent>
        </VaCard>
    </div>
</template>

<style scoped>
:deep(.echoshare-history-time) {
    font-family: "Times New Roman", Times, serif;
}

:deep(.echoshare-history-uid) {
    font-family: "Times New Roman", Times, serif;
}
</style>
