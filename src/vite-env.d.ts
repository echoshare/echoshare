/// <reference types="vite/client" />

import { WebRTCAnalysis } from "./utils/webrtc/analysis";

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


declare global {
    interface Window {
        webRTCAnalysis: WebRTCAnalysis;
    }
}

