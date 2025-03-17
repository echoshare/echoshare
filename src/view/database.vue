<script setup lang="ts">
import { computed } from "vue";
import { useDatabase } from "../store/database";
const databaseStore = useDatabase();

const options = databaseStore.instances.map((e) => ({
    label: e.label,
    index: e.index,
}));

function saveConfig() {
    const isSuccess = databaseStore.instances[databaseStore.index]?.init();
}
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col xl6 sm10 xs11">
            <VaCardTitle class="text-lg">
                {{ $t("database.panel.title") }}
            </VaCardTitle>
            <VaCardContent>
                <VaSelect
                    text-by="label"
                    v-model="databaseStore.index"
                    value-by="index"
                    class="w-full mb-4"
                    :label="$t('database.panel.selectLabel')"
                    :options="options"
                />

                <template
                    v-for="item in databaseStore.instances[
                        databaseStore.index
                    ].settings()"
                    :key="item.name"
                >
                    <VaInput
                        :label="item.name"
                        v-model="(databaseStore.instances[databaseStore.index].data as any)[item.name]"
                        :placeholder="item.placeholder"
                        class="w-full mb-4"
                    />
                </template>
                <div class="flex flex-row-reverse mt-4">
                    <VaButton class="flex-none" @click="saveConfig">{{
                        $t("database.panel.confirm")
                    }}</VaButton>
                </div>
            </VaCardContent>
        </VaCard>
    </div>
</template>
