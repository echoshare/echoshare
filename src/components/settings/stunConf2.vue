<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePeer } from "../../store/peer";
import { consoleError } from "../../utils/console";
import { toastErr, toastTip } from "../../utils/toast";

const { t } = useI18n();
const PeerStore = usePeer();
const iceServerConfText = ref(JSON.stringify(PeerStore.iceServerConf));

function parseOrFetch() {
    if (iceServerConfText.value.startsWith("http")) {
        fetch(iceServerConfText.value)
            .then((res) => res.text())
            .then((data) => {
                iceServerConfText.value = data;
                parseJSON(data);
            })
            .catch((e) => {
                consoleError(e);
                toastErr(
                    t("settings.iceServerFetchErr") +
                        " " +
                        iceServerConfText.value
                );
            });
    } else {
        parseJSON(iceServerConfText.value);
    }
}

function parseJSON(json: string) {

    if(!json){
        PeerStore.iceServerConf = [];
        toastTip(t("settings.iceServerReset"));
        return;
    }
    let hasErr = false;
    try {
        PeerStore.iceServerConf = JSON.parse(json);
    } catch (e) {
        consoleError(e);
        hasErr = true;
    }

    if (hasErr || !PeerStore.iceServerConf) {
        toastErr(t("settings.iceServerParseErr"));
    } else {
        toastTip(t("settings.iceServerParseSuccess"));
    }
}
</script>

<template>
    <div class="flex flex-row items-baseline mt-6 pb-5">
        <h1 class="grow-0 sm:block hidden">
            {{ $t("settings.stunSettingsTitle") }}
        </h1>
        <h1 class="grow-0 sm:hidden block">
            {{ $t("settings.stunSettingsShortTitle") }}
        </h1>
    </div>
    <div class="flex">
        <VaTextarea
            v-model="iceServerConfText"
            :placeholder="$t('settings.iceServerTextAreaPlaceholder')"
        />
    </div>

    <div class="flex mt-4">
        <VaButton @click="parseOrFetch">
            {{
                iceServerConfText && iceServerConfText.startsWith("http")
                    ? $t("settings.iceServerTextBtnTextForURL")
                    : $t("settings.iceServerTextBtnTextForJSON")
            }}
        </VaButton>
    </div>
</template>
