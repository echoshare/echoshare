import { createI18n } from "vue-i18n";
// import { useMetaStore } from "./store/meta";
// const metaStore = useMetaStore();

export const i18n = createI18n({
    locale: "en-US",
    fallbackLocale: "en-US",
    messages: {
        "en-US": {
            home: {
                title: "WebRTC-based online screen sharing",
                share: "Sharing",
                receive: "Receive",
            },
            sidebar: {
                home: "Home",
                share: "Share",
                receive: "Receive",
                history: "History",
                settings: "Settings",
            },
            share: {
                title: "Sharing Panel",
                input: "Current UID",
                placeholder: "Share to get UID"
            },
            media: {
                title: "Media Capture Mode Configuration",
                screen: "Screen",
                camera: "Camera",
                audio: "Audio",
                microphone: "Microphone",
                mediaModeLabel: "Media Capture Mode",
                mediaModePlaceholder:"Please select the media capture mode",
                videoDeviceIdLabel:"Available Camera Devices",
                videoDeviceIdPlaceholder:"Please select an available camera device",
                audioDeviceIdLabel:"Available Microphone Devices",
                audioDeviceIdPlaceholder:"Please select an available microphone device",
            },
            mediaModeOptions: {
                0: "Screen + Audio + Microphone",
                1: "Screen + Microphone",
                2: "Screen + Audio",
                3: "Screen",
                4: "Camera + Audio + Microphone",
                5: "Camera + Microphone",
                6: "Camera + Audio",
                7: "Camera",
            }
        },
        "zh-CN": {
            home: {
                title: "基于 WebRTC 的在线屏幕共享",
                share: "媒体共享",
                receive: "媒体接收",
            },
            sidebar: {
                home: "主页",
                share: "共享",
                receive: "接收",
                history: "历史",
                settings: "设置",
            },
            share: {
                title: "共享面板",
                input: "当前 UID",
                placeholder: "分享获取 UID"
            },
            media: {
                title: "媒体捕获模式配置",
                screen: "屏幕",
                camera: "摄像头",
                audio: "音频",
                microphone: "麦克风",
                mediaModeLabel: "媒体捕获模式",
                mediaModePlaceholder:"请选择媒体捕获模式",
                videoDeviceIdLabel:"可用摄像头设备",
                videoDeviceIdPlaceholder:"请选择可用摄像头设备",
                audioDeviceIdLabel:"可用麦克风设备",
                audioDeviceIdPlaceholder:"请选择可用麦克风设备",
            },
            mediaModeOptions: {
                0: "屏幕 + 音频 + 麦克风",
                1: "屏幕 + 麦克风",
                2: "屏幕 + 音频",
                3: "屏幕",
                4: "摄像头 + 音频 + 麦克风",
                5: "摄像头 + 麦克风",
                6: "摄像头 + 音频",
                7: "摄像头",
            }
        },
    },
});

export const languages = [
    { value: "en-US", text: "English (US)" },
    { value: "zh-CN", text: "简体中文" },
];
