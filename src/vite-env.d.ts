/// <reference types="vite/client" />

// custom define variable in vite.config.ts
declare const __TITLE__: string;

declare module "./locales/*.json" {
    const json: {
        value: string;
        text: string;
        message: Record<string, string>;
    };

    export default json;
}

declare interface Window {
    __DEBUG_LOG: undefined | boolean;
    __DEBUG_ERROR: undefined | boolean;
    __HANDLER_IS_INIT: undefined | boolean;
}
