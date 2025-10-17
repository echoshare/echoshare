import dayjs from "dayjs";

interface IJson<T = any> {
    [key: string]: T;
}


let firstFrameDelay = 0;
let isReceiveVideoData = false;
let isKeyFramesDecoded = false;
let reportedFrameSize = false;
const statStatic = {
    minFrameRate: 0,
    maxFrameRate: 0,
    minBitRate: 0,
    maxBitRate: 0,
    totalDecodeTime: 0,
    status: 'initial',
};

let lastStatData: IJson = {
    audio: {},
};
const lastVideoStatData: IJson = {
    rtp: {},
    track: {},
};

export function getLastStat() {
    return lastStatData;
}

export function getLastVideoStatData() {
    return lastVideoStatData;
}

function isVideoStat(stat: any) {
    return ((stat.type === 'track' || stat.type === 'inbound-rtp') && (stat.trackIdentifier === 'video_label' || stat.kind === 'video' || typeof stat.framesReceived === 'number'));
}

// return kbps
function countBitRate(bytes: number, time: number) {
    return Math.round((8 * bytes / (time / 1000)) / 1024);
}

function countFrameRate(frames: number, time: number) {
    return Math.round(frames / (time / 1000));
}


export function getWebRTCStat(stats: RTCStatsReport) {
    const newStat: IJson = {
        firstFrameDelay,
        status: statStatic.status,
        audio: {},
    };
    // debugger;lastDate
    const nowDateTime = (new Date()).getTime();
    stats.forEach((stat) => {
        if ((stat as any).decoderImplementation) {
            const v = (stat as any).decoderImplementation;
            newStat.codec = v.indexOf('h264') !== -1 ? 'H264' : 'H265';
        }

        if (stat.type === 'inbound-rtp' && !stat.isRemote) {
            if ((stat.mediaType === 'video' || stat.kind === 'video' || stat.id.toLowerCase().includes('video'))) {
                lastVideoStatData.rtp = stat;

                newStat.mediaType = 'video';
                newStat.timestamp = stat.timestamp;
                newStat.bytesReceived = stat.bytesReceived;
                newStat.packetsLost = stat.packetsLost;
                newStat.packetsReceived = stat.packetsReceived;
                newStat.decodeTime = Math.round((stat.totalDecodeTime - statStatic.totalDecodeTime) * 1000);
                newStat.totalDecodeTime = stat.totalDecodeTime;
                newStat.frameHeight = stat.frameHeight;
                newStat.frameWidth = stat.frameWidth;

                newStat.avgFrameDecodeTime = parseFloat((stat.totalDecodeTime * 1000 / stat.framesDecoded).toFixed(4));

                statStatic.totalDecodeTime = stat.totalDecodeTime;
                newStat.framesDecoded = stat.framesDecoded;
                newStat.bytesReceivedStart = lastStatData.bytesReceivedStart
                    ? lastStatData.bytesReceivedStart : stat.bytesReceived;
                newStat.framesDecodedStart = lastStatData.framesDecodedStart
                    ? lastStatData.framesDecodedStart : stat.framesDecoded;
                newStat.timestampStart = lastStatData.timestampStart ? lastStatData.timestampStart : stat.timestamp;
                newStat.time = nowDateTime - newStat.timestampStart;
                newStat.keyFramesDecoded = stat.keyFramesDecoded;

                if (lastStatData.timestamp) {
                    if (lastStatData.bytesReceived) {
                        newStat.bitRate = countBitRate(
                            newStat.bytesReceived - lastStatData.bytesReceived,
                            newStat.timestamp - lastStatData.timestamp,
                        );
                        if (newStat.bitRate.toString() === 'NaN') {
                            newStat.bitRate = 0;
                        }
                        if (statStatic.maxBitRate === null) {
                            statStatic.maxBitRate = newStat.bitRate;
                            statStatic.minBitRate = newStat.bitRate;
                        } else if (newStat.bitRate > statStatic.maxBitRate) {
                            statStatic.maxBitRate = newStat.bitRate;
                        } else if (newStat.bitRate < statStatic.minBitRate && newStat.bitRate > 0) {
                            statStatic.minBitRate = newStat.bitRate;
                        }
                        newStat.minBitRate = lastStatData.lowBitrate < newStat.bitRate
                            ? lastStatData.lowBitrate : statStatic.minBitRate;
                        newStat.maxBitRate = lastStatData.highBitrate > newStat.bitRate
                            ? lastStatData.highBitrate : statStatic.maxBitRate;
                    } else {
                        newStat.bitRate = 0;
                        newStat.maxBitRate = 0;
                        newStat.minBitRate = 0;
                    }

                    if (lastStatData.bytesReceivedStart) {
                        newStat.avgBitRate = countBitRate(
                            newStat.bytesReceived - lastStatData.bytesReceivedStart,
                            newStat.timestamp - lastStatData.timestampStart,
                        );
                    } else {
                        newStat.avgBitRate = 0;
                    }

                    if (lastStatData.framesDecoded) {
                        newStat.frameRate = countFrameRate(
                            newStat.framesDecoded - lastStatData.framesDecoded,
                            newStat.timestamp - lastStatData.timestamp,
                        );
                        if (newStat.frameRate.toString() === 'NaN') {
                            newStat.frameRate = 0;
                        }
                        if (statStatic.maxFrameRate === null) {
                            statStatic.maxFrameRate = newStat.frameRate;
                            statStatic.minFrameRate = newStat.frameRate;
                        } else if (newStat.frameRate > statStatic.maxFrameRate) {
                            statStatic.maxFrameRate = newStat.frameRate;
                        } else if (newStat.frameRate < statStatic.minFrameRate && newStat.frameRate > 0) {
                            statStatic.minFrameRate = newStat.frameRate;
                        }
                        newStat.minFrameRate = lastStatData.lowFramerate < newStat.frameRate
                            ? lastStatData.lowFramerate : statStatic.minFrameRate;
                        newStat.maxFrameRate = lastStatData.highFramerate > newStat.frameRate
                            ? lastStatData.highFramerate : statStatic.maxFrameRate;
                    } else {
                        newStat.frameRate = 0;
                        newStat.maxFrameRate = 0;
                        newStat.minFrameRate = 0;
                    }

                    if (lastStatData.framesDecodedStart) {
                        newStat.avgFrameRate = countFrameRate(
                            newStat.framesDecoded - lastStatData.framesDecodedStart,
                            newStat.timestamp - lastStatData.timestampStart,
                        );
                    } else {
                        newStat.avgFrameRate = 0;
                    }
                }
            } else if ((stat.mediaType === 'audio' || stat.id.toLowerCase().includes('audio'))) {
                newStat.audio.timestamp = stat.timestamp;
                newStat.audio.bytesReceived = stat.bytesReceived;
                newStat.audio.packetsLost = stat.packetsLost;
                newStat.audio.packetsReceived = stat.packetsReceived;
                if (lastStatData.audio.bytesReceived) {
                    newStat.bitRate = countBitRate(
                        newStat.audio.bytesReceived - lastStatData.audio.bytesReceived,
                        newStat.audio.timestamp - lastStatData.audio.timestamp,
                    );
                } else {
                    newStat.audio.bitRate = 0;
                }
            }
        }

        if (isVideoStat(stat)) {
            if (!isReceiveVideoData && stat.packetsReceived > 0) {
                isReceiveVideoData = true;
            }
            if (!isKeyFramesDecoded && stat.keyFramesDecoded > 0) {
                isKeyFramesDecoded = true;
            }

            lastVideoStatData.track = stat;
            newStat.framesDropped = stat.framesDropped;
            newStat.framesReceived = stat.framesReceived;
            newStat.framesDroppedPercentage = stat.framesDropped / stat.framesReceived * 100;
            newStat.frameHeight = stat.frameHeight;
            newStat.frameWidth = stat.frameWidth;
            newStat.frameHeightStart = stat.frameHeight;
            newStat.frameWidthStart = stat.frameWidth;
            newStat.freezeCount = stat.freezeCount;
            newStat.totalFreezesDuration = stat.totalFreezesDuration;

            if (!reportedFrameSize && stat.frameHeight) {
                reportedFrameSize = true;
                console.log('stat_frame_size', `width: ${stat.frameWidth}, height: ${stat.frameHeight}`);
            }
        }

        if (stat.type === 'candidate-pair' && Object.prototype.hasOwnProperty.call(stat, 'currentRoundTripTime')) {
            newStat.delay = stat.currentRoundTripTime * 1000;
        }
    });
    return newStat;
};

export function formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}


export function generateContentText(stat: any) {
    const text = `
      
      (V)接收帧:frameRcv/dec/drop: ${stat.framesReceived}/${stat.framesDecoded}/${stat.framesDropped}
      (V)decTimeMs/decFrameRate(帧率)/avgDecTime: ${stat.decodeTime}/${stat.frameRate}fps/${stat.avgFrameDecodeTime}
      (V)bitrate(码率)/time: ${stat.bitRate}kbps/${stat.timestamp ? formatDate(new Date(parseInt((stat.timestamp).toFixed(0), 10))) : '0'}
      (V)pckRcv/pckLost/丢包率: ${stat.packetsReceived}/${stat.packetsLost}/
      ${stat.audio ? `(A)pckRcv/pckLost: ${stat.audio.packetsReceived}/${stat.audio.packetsLost}` : ''}
      (V)frameRes(分辨率): ${stat.frameWidth} x ${stat.frameHeight}
      (V)videoType(编码格式): ${stat.mediaType}
      (V)1stRenderedDelay/totalFreezesDuration: ${stat.firstFrameDelay}ms/${typeof stat.totalFreezesDuration === 'number' ? stat.totalFreezesDuration.toFixed(4) : '--'}
      (V)rtt(延时): ${stat.delay}
      (G)status: ${stat.status}`;
    return text;
}

// 映射为中文显示
export const mapToChinese = {
    frameRcv: '接收帧数',
    frameDec: '解码帧数',
    frameDrop: '丢弃帧数',
    decTimeMs: '解码时间（毫秒）',
    avgDecTime: '平均解码时间',
    time: '时间',
    pckRcv: '接收包数',
    pckLost: '丢包数',
    frameRes: '分辨率',
    videoType: '视频类型',
    firstRenderedDelay: '首帧渲染延迟',
    rtt: '往返时延',
    status: '状态',
    fps: '帧率',
    "mime type": "解码格式",
    "decode type": "解码类型",
    "send bitrate": "发送码率",
    "receive bitrate": "接收码率",
};

export function translate(key: string) {
    return mapToChinese[key as keyof typeof mapToChinese] || key;
};

export function generateContentJson(stat: any) {
    return Object.entries({
        // bitrate: stat.bitRate,
        // avgBitRate: stat.avgBitRate,
        // decFrameRate: stat.frameRate,
        frameRcv: stat.framesReceived,
        frameDec: stat.framesDecoded,
        frameDrop: stat.framesDropped,
        decTimeMs: stat.decodeTime,
        avgDecTime: stat.avgFrameDecodeTime,
        time: stat.timestamp ? formatDate(new Date(parseInt((stat.timestamp).toFixed(0), 10))) : '0',
        pckRcv: stat.packetsReceived,
        pckLost: stat.packetsLost,
        frameRes: `${stat.frameWidth} x ${stat.frameHeight}`,
        videoType: stat.mediaType,
        firstRenderedDelay: stat.firstFrameDelay,
        rtt: stat.delay,
        status: stat.status,
    }).map(([key, value]) => ({ key, value }));
}