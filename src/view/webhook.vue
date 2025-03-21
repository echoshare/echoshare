<script setup lang="ts">
import { useWebhook } from "../store/webhook";
const webhook = useWebhook();
</script>

<template>
    <div class="mt-4">
        <VaCard class="m-auto flex flex-col xl6 sm10 xs11">
            <VaCardTitle class="text-lg">
                {{ $t("webhook.title") }}
            </VaCardTitle>
            <VaCardContent>
                <VaInput
                    :label="$t('webhook.CommonAPILabel')"
                    v-model="webhook.uniURL"
                    :placeholder="$t('webhook.CommonAPIPlaceholder')"
                    class="w-full mb-4"
                    clearable
                />

                <VaInput
                    :label="$t('webhook.getURLLabel')"
                    v-model="webhook.getURL"
                    :placeholder="$t('webhook.getURLPlaceholder')"
                    class="w-full mb-4"
                    clearable
                />

                <VaInput
                    :label="$t('webhook.postURLLabel')"
                    v-model="webhook.postURL"
                    :placeholder="$t('webhook.postURLPlaceholder')"
                    class="w-full mb-6"
                    clearable
                />

                <VaInput
                    :label="$t('webhook.successURLLabel')"
                    v-model="webhook.successURL"
                    :placeholder="$t('webhook.successURLPlaceholder')"
                    class="w-full mb-6"
                    clearable
                />

                <VaInput
                    :label="$t('webhook.failURLLabel')"
                    v-model="webhook.failURL"
                    :placeholder="$t('webhook.failURLPlaceholder')"
                    class="w-full mb-6"
                    clearable
                />

                <VaTextarea
                    :label="$t('webhook.customPlayloadLabel')"
                    v-model="webhook.custompayload"
                    style="min-height: 3em"
                    :placeholder="$t('webhook.customPlayloadPlaceholder')"
                    class="w-full mb-6"
                    minRows="3"
                    clearable
                    autosize
                />
            </VaCardContent>
        </VaCard>
    </div>
</template>
