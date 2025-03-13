export function combineAudioStream(streams: MediaStream[]): MediaStream {
    const audioContext = new AudioContext();

    const dest = audioContext.createMediaStreamDestination();
    const streamList = streams
        .filter((stream) => stream.getAudioTracks().length > 0)
        .map((stream) => audioContext.createMediaStreamSource(stream));
    streamList.forEach((source) => source.connect(dest));

    return dest.stream;
}
