import { log } from "../console";

const createEmptyAudioTrack = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    //@ts-ignore
    const track = dst.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = (
    params: { width: number; height: number } = {
        width: 640,
        height: 480,
    }
) => {
    const { width, height } = params;
    const canvas = Object.assign(document.createElement("canvas"), {
        width,
        height,
    });
    const ctx = canvas.getContext("2d");
    ctx!.fillStyle = "green";
    ctx!.fillRect(0, 0, width, height);

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];

    return Object.assign(track, { enabled: false });
};

export const createMediaStreamFake = (mode: number = 0) => {
    if (mode === 1) {
        log.info("接收模式", "仅视频");
        return new MediaStream([createEmptyVideoTrack()]);
    } else if (mode === 2) {
        log.info("接收模式", "仅音频");
        return new MediaStream([createEmptyAudioTrack()]);
    } else {
        log.info("接收模式", "视频 + 音频");
        
        return new MediaStream([
            createEmptyAudioTrack(),
            createEmptyVideoTrack(),
        ]);
    }
};
