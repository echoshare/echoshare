<script setup lang="ts">
import { computed } from "vue";
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
                        :label="$t('webhook.getURLLabel')"
                        v-model="webhook.getURL"
                        :placeholder="$t('webhook.getURLPlaceholder')"
                        class="w-full mb-4"
                    />

                    <VaInput
                        :label="$t('webhook.getURLLabel')"
                        v-model="webhook.postURL"
                        :placeholder="$t('webhook.getURLPlaceholder')"
                        class="w-full mb-4"
                    />

                    <VaInput
                        :label="$t('webhook.getURLLabel')"
                        v-model="webhook.successURL"
                        :placeholder="$t('webhook.getURLPlaceholder')"
                        class="w-full mb-4"
                    />

                    <VaInput
                        :label="$t('webhook.failURLLabel')"
                        v-model="webhook.failURL"
                        :placeholder="$t('webhook.failURLPlaceholder')"
                        class="w-full mb-4"
                    />
               
            </VaCardContent>
        </VaCard>
    </div>
</template>
