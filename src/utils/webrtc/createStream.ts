import { toastErr, toastTip } from "../toast";
import { usePeer } from "../../store/peer";
import { combineAudioStream } from "./combine";
import { consoleError } from "../console";
import { i18n } from "../../i18n";
const t = i18n.global.t;

function createConstraints(allowUsingDevice: boolean, deviceId: string) {
    return allowUsingDevice && deviceId && deviceId.length > 0
        ? {
              deviceId: { exact: deviceId },
          }
        : false;
}

export async function requestDevicePermissions(sendMsg = true) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toastErr(t("toast.noDevicesAccess"));
        
        return false;
    }

    try {
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100,
            },
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch (e: any) {
        consoleError("Device permission error:", e.name, e.message);

        if (sendMsg) {
            if (e.name === "NotAllowedError") {
                toastErr(t("toast.noMediaDevicesAccess"));
            } else if (e.name === "NotFoundError") {
                toastErr(t("toast.noMediaDevicesFound"));
            } else {
                toastErr(t("toast.mediaDevicesFailed") + `${e.message}`);
            }
        }
        return false;
    }
}

async function createScreenStream(mediaMode: {
    value: number;
    text: string;
    useScreen: boolean;
    useCamera: boolean;
    useAudio: boolean;
    useMircophone: boolean;
}) {
    const PeerStore = usePeer();
    const videoStream = await window.navigator.mediaDevices.getDisplayMedia({
        video: mediaMode.useScreen,
        audio: mediaMode.useAudio, //createConstraints(mediaMode.useAudio, PeerStore.audioutDeviceId),
    });

    if (!mediaMode.useMircophone) {
        return videoStream;
    }

    const audioStream = await window.navigator.mediaDevices.getUserMedia({
        audio: createConstraints(
            mediaMode.useMircophone,
            PeerStore.audioDeviceId
        ),
    });
    const combineStream = combineAudioStream([videoStream, audioStream]);

    return new MediaStream([
        ...videoStream.getVideoTracks(),
        ...combineStream.getAudioTracks(),
    ]);
}

async function createCameraStream(mediaMode: {
    value: number;
    text: string;
    useScreen: boolean;
    useCamera: boolean;
    useAudio: boolean;
    useMircophone: boolean;
}) {
    const PeerStore = usePeer();
    const constraints = {
        audio: createConstraints(
            mediaMode.useMircophone,
            PeerStore.audioDeviceId
        ),
        video: createConstraints(mediaMode.useCamera, PeerStore.videoDeviceId),
    };
    const videoStream = await window.navigator.mediaDevices.getUserMedia(
        constraints
    );

    if (!mediaMode.useAudio) {
        return videoStream;
    }

    const audioStream = await window.navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
    });

    const combineStream = combineAudioStream([videoStream, audioStream]);
    return new MediaStream([
        ...videoStream.getVideoTracks(),
        ...combineStream.getAudioTracks(),
    ]);
}

export async function createStreamNew() {
    const PeerStore = usePeer();
    const mediaMode = PeerStore.mediaMode;
    const isUsingScreen = mediaMode.useScreen;

    if (mediaMode.useCamera && mediaMode.useAudio) {
        toastTip(t("toast.tipBothUse"));
    }

    try {
        return isUsingScreen
            ? createScreenStream(mediaMode)
            : createCameraStream(mediaMode);
    } catch (e) {
        toastErr(t("toast.badMediaStream"));
        consoleError(e);
        throw e;
    }
}
