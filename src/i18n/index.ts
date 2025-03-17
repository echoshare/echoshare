import { createI18n } from "vue-i18n";

import en_US from "./locales/en-US.json";
import zh_CN from "./locales/zh-CN.json";
import ja_JP from "./locales/ja-JP.json";

export const languages = [en_US, zh_CN, ja_JP];

const messages = languages.reduce(
    (acc: Record<string, (typeof languages)[0]["message"]>, cur) => {
        acc[cur.value] = cur.message;
        return acc;
    },
    {}
);

export const i18n = createI18n({
    locale: languages[0].value,
    fallbackLocale: languages[0].value,
    messages,
});
