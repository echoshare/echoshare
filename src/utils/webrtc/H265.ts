import { isIOS } from "../device";

// 获取协商后 SDP 的 codecId，如果不支持返回 null
function replaceCodecID(cmds: string[], mimetype = 'H264'): string | null {
    const idx = cmds.findIndex(cmd => cmd.indexOf('m=video') === 0);
    if (idx === -1) return null;

    const vcmds = cmds.slice(idx);
    const rtpmaps = vcmds.filter(vcmd => vcmd.indexOf('a=rtpmap:') === 0);
    const cid = rtpmaps.find(rm => rm.indexOf(mimetype) > -1);
    if (!cid) return null;

    const matched = cid.match(/a=rtpmap:(\d+)/);
    return matched?.[1] ?? null;
}

export function sdpEdit(sdp: string, mimetype = 'H264'): string {
    if (!sdp) return sdp;
    const cmds = sdp.split('\r\n');
    const codecId = replaceCodecID(cmds, mimetype);
    if (!codecId) return sdp;

    const idx = cmds.findIndex(cmd => cmd.indexOf('m=video') === 0);
    const videoCmd = cmds[idx];
    const videoCmdParts = videoCmd.split(' ');
    const codecIndex = videoCmdParts.findIndex(part => part === codecId);
    if (codecIndex === -1 || codecIndex === 3) return sdp;

    videoCmdParts.splice(codecIndex, 1);
    videoCmdParts.splice(3, 0, codecId);

    const newVideoCmd = videoCmdParts.join(' ');
    let newSdp = sdp;
    if (isIOS()) {
        const startH265Index = cmds.findIndex((line, index) => index > codecIndex && line.startsWith(`a=rtpmap:${codecId}`));
        const nextRtpmapIndex = cmds.findIndex((line, index) => index > startH265Index && line.startsWith('a=rtpmap'));
        const existingFmtpIndex = cmds.findIndex((line, index) => index > startH265Index && line.startsWith(`a=fmtp:${codecId} .*level-asymmetry-allowed`));
        if (existingFmtpIndex === -1 && nextRtpmapIndex !== -1) {
            cmds.splice(nextRtpmapIndex, 0, `a=fmtp:${codecId} level-asymmetry-allowed=1;packetization-mode=1`);
            newSdp = cmds.join('\r\n');
        }
    }
    return newSdp.replace(/m=video.*/, newVideoCmd);
}