import { defineStore } from "pinia";

export const usePeer = defineStore("peer", {
    state() {
        return {
            targetUID: "",
            peerModeIndex: 0,
            audioDeviceId: "",
            videoDeviceId: "",
            audioutDeviceId: "",
            audioDevices: [] as MediaDeviceInfo[],
            videoDevices: [] as MediaDeviceInfo[],
            audioutDevices: [] as MediaDeviceInfo[],
            mediaMode: {
                value: 0,
                text: "Screen + Audio + Microphone",
                useScreen: true,
                useCamera: false,
                useAudio: true,
                useMircophone: true,
            },
            receiveModeIndex: 0,
            autoTryPlay: false,
            enableQuery: false,
            enableAutoRefetch: false,
            remoteAPP_ID: "",
            remoteAPP_KEY: "",
            remoteSERVER_URL: "",
            maxOutOfTime: 20000,
            autoRequireStream: false,
            serverURL: "0.peerjs.com:443",
            iceServers: [] as string[], // "stun:stun.l.google.com:19302", "turn:homeo@turn.bistri.com:80^homeo",
        };
    },
    actions: {
        async findDevices() {
            const devices =
                await window.navigator.mediaDevices.enumerateDevices();
            this.audioDevices = devices.filter(
                (device) => device.kind === "audioinput"
            );

            this.videoDevices = devices.filter(
                (device) => device.kind === "videoinput"
            );

            this.audioutDevices = devices.filter(
                (device) => device.kind === "audiooutput"
            );
        },
    },
    getters: {
        defaultParams: () => ({
            targetUID: "",
            peerModeIndex: 0,
            mediaModeIndex: 0,
            autoTryPlay: false,
            autoRequireStream: false,
            serverURL: "0.peerjs.com:443",
        }),
        getServerConf: (state) => {
            if (state.peerModeIndex === 0) {
                return { url: "0.peerjs.com", port: 443, path: "/" };
            }

            let serverURL = state.serverURL;
            if (serverURL.startsWith("http://")) {
                serverURL = serverURL.slice(7);
            } else if (serverURL.startsWith("https://")) {
                serverURL = serverURL.slice(8);
            }

            const firstColon = serverURL.indexOf(":");

            const url = serverURL.slice(0, firstColon);
            const rest = serverURL.slice(firstColon + 1);
            const secondColon = rest.indexOf("/");
            if (secondColon === -1) {
                return { url, port: parseInt(rest), path: "/" };
            }
            const port = parseInt(rest.slice(0, secondColon));
            const path = rest.slice(secondColon);
            return { url, port, path };
        },

        getIceServers(state): Array<{
            urls: string;
            credential?: string;
        }> {
            return state.iceServers
                .filter((e) => e.length > 0)
                .map((e) => {
                    const sp = e.split("|");
                    if (sp.length === 3) {
                        return {
                            urls: sp[0],
                            username: sp[1],
                            credential: sp[2],
                        };
                    }
                    const index = e.lastIndexOf("^");
                    if (index === -1) {
                        return { urls: e };
                    }
                    const urls = e.slice(0, index);
                    let spt = e.slice(index + 1).split("@");
                    if (spt.length !== 2) {
                        spt = e.slice(index + 1).split(":");
                    }
                    const [username, credential] = spt;

                    return {
                        urls,
                        username: username ?? "",
                        credential: credential ?? "",
                    };
                });
        },
    },
});
