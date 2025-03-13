import { toastErr, toastTip } from "../toast";
import { usePeer } from "../../store/peer";
import { combineAudioStream } from "./combine";
import { consoleError } from "../console";

function createConstraints(allowUsingDevice: boolean, deviceId: string) {
    return allowUsingDevice && deviceId && deviceId.length > 0
        ? {
              deviceId: { exact: deviceId },
          }
        : false;
}

export async function requestDevicePermissions() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toastErr("Browser does not support device access");
        return false;
    }

    try {
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            },
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (e: any) {
        consoleError('Device permission error:', e.name, e.message);
        if (e.name === 'NotAllowedError') {
            toastErr("Please allow access to camera and microphone");
        } else if (e.name === 'NotFoundError') {
            toastErr("No camera or microphone device found");
        } else {
            toastErr(`Device access failed: ${e.message}`);
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
        toastTip(
            "Camera and system audio are used together, you need to manually share the system audio in the whole screen, but will not read the whole screen image information"
        );
    }

    try {
        return isUsingScreen
            ? createScreenStream(mediaMode)
            : createCameraStream(mediaMode);
    } catch (e) {
        toastErr("Unable to get audio stream 😭");
        consoleError(e);
        throw e;
    }
}
