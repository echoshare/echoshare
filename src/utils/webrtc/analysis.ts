import dayjs from "dayjs";
import { generateContentJson, generateContentText, getWebRTCStat } from "./stat";

// 假设你已有一个 RTCPeerConnection 实例 pc

// 获取视频编码格式
async function getVideoCodecMimeType(pc: RTCPeerConnection): Promise<string | null> {
    const stats = await pc.getStats(null);
    let codecMimeType = null;

    stats.forEach(report => {
        if ((report.type === 'inbound-rtp' || report.type === 'outbound-rtp') && report.kind === 'video') {
            const codec = stats.get(report.codecId);
            if (codec && codec.mimeType) {
                codecMimeType = codec.mimeType;
            }
        }
    });

    return codecMimeType;
}

//  监测FPS
function createFPSMonitor() {
    let fps = 0;
    let frameCount = 0;
    let lastTime = window.performance.now();

    function loop() {
        frameCount++;
        const now = window.performance.now();
        if (now - lastTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(loop);
    }

    loop();
    return () => fps; // 返回当前fps的函数
}


function guessDecodeType(codecMimeType: string, fps: number) {

    // 简单阈值示例，fps低于20可能软解码负载高
    const hwSupportedCodecs = ['video/AV1', 'video/H264', 'video/H265', 'video/H266', 'video/VP8', 'video/VP9'];

    if (!codecMimeType) {
        return 'cannot guess';
    }

    if (!hwSupportedCodecs.includes(codecMimeType)) {
        return `soft decoding`;
    }

    if (fps >= 25) {
        return `hardware decoding`;
    } else {
        return `soft decoding or performance bottleneck`;
    }
}



export class WebRTCAnalysis {
    private peerConnection: RTCPeerConnection | undefined;
    private _logs: Array<{ time: string, data: any }> = [];

    private bitrateSent = 0;
    private bytesSentPrev = 0;
    private timeSentstampPrev = 0;
    private bitrateReceive = 0;
    private bytesReceivePrev = 0;
    private timeReceivestampPrev = 0;
    private rtcType: 'send' | 'receive' = 'send';

    constructor(rtcType: typeof this.rtcType) {
        this.rtcType = rtcType;
    }

    private getFPS = createFPSMonitor();

    private log(data: any) {
        this._logs.push({
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            data: data,
        });
    }

    public inspectTable: {
        key: string;
        value: any;
    }[] = [];

    public update(peerConnection?: RTCPeerConnection) {
        if (!peerConnection) return;
        if (!this.peerConnection) this.peerConnection = peerConnection;
    }

    public async inspectRTCRtpParameters() {
        this.peerConnection?.getReceivers()?.forEach(receiver => {
            if (receiver.track.kind === 'video') {
                const params = receiver.getParameters();
                console.log('decoder params:', params);
            }
        });

        const sender = this.peerConnection?.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            const params = sender.getParameters();
            if (!params.encodings) params.encodings = [{}];
            if (params.encodings?.[0]?.maxBitrate) params.encodings[0].maxBitrate = 3000000; // 3Mbps
            await sender.setParameters(params);
        }
    }

    public getStats() {
        this.peerConnection?.getStats(null).then(stats => {
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    const codec = stats.get(report.codecId);
                    console.log('decode format:', codec?.mimeType);
                    console.log('decode fps:', report.framesEncoded);
                }
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    const codec = stats.get(report.codecId);
                    console.log('decode format:', codec?.mimeType);
                    console.log('decode fps:', report.framesDecoded);
                    console.log('packet loss:', report.packetsLost);
                }
            });
        });
    }

    public async monitorDecodeType() {
        const fps = this.getFPS();
        const codecMimeType = await getVideoCodecMimeType(this.peerConnection!);
        const guess = codecMimeType ? guessDecodeType(codecMimeType, fps) : '';
        return { fps, codecMimeType, guess };
    }

    public async getVideoSendBitrate() {
        if (this.rtcType !== 'send' || !this.peerConnection) return;
        const stats = await this.peerConnection.getStats(null);
        stats.forEach(report => {
            if (report.type === 'outbound-rtp' && report.kind === 'video') {
                const bytesSent = report.bytesSent;
                const timestamp = report.timestamp;

                if (this.timeSentstampPrev) {
                    const bitrate = 8 * (bytesSent - this.bytesSentPrev) / ((timestamp - this.timeSentstampPrev) / 1000);
                    console.log(`视频发送码率: ${Math.round(bitrate / 1000)} kbps`);
                    this.bitrateSent = Math.round(bitrate / 1000);
                }

                this.bytesSentPrev = bytesSent;
                this.timeSentstampPrev = timestamp
            }
        });
    }

    public async getVideoReceiveBitrate() {
        if (this.rtcType !== 'receive' || !this.peerConnection) return;
        const stats = await this.peerConnection.getStats(null);
        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                const bytesReceived = report.bytesReceived;
                const timestamp = report.timestamp;

                if (this.timeReceivestampPrev) {
                    const bitrate = 8 * (bytesReceived - this.bytesReceivePrev) / ((timestamp - this.timeReceivestampPrev) / 1000);
                    console.log(`视频接收码率: ${Math.round(bitrate / 1000)} kbps`);
                    this.bitrateReceive = Math.round(bitrate / 1000);
                }

                this.bytesReceivePrev = bytesReceived;
                this.timeReceivestampPrev = timestamp
            }
        });
    }

    public async run(peerConnection?: RTCPeerConnection) {
        if (!peerConnection) return;
        this.update(peerConnection);
        await this.inspectRTCRtpParameters();
        // this.getStats();
        const { fps, codecMimeType, guess } = await this.monitorDecodeType();
        const stat = await this.peerConnection?.getStats(null);
        if (!stat) return;
        const statData = getWebRTCStat(stat);
        await this.getVideoSendBitrate();
        await this.getVideoReceiveBitrate();
        this.inspectTable = [...generateContentJson(statData), { key: 'fps', value: fps }, { key: 'mime type', value: codecMimeType }, { key: 'decode type', value: guess }, { key: 'send bitrate', value: this.bitrateSent }, { key: 'receive bitrate', value: this.bitrateReceive }]
        if (this.inspectTable.length > 0) {
            this.log(this.inspectTable);
        }
    }

    public downloadLogs(name: string) {
        const jsonStr = JSON.stringify({ logs: this._logs }, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
