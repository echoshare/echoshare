/** Mix the audio tracks of several streams into a single-track stream. */
export function combineAudioStream(streams: MediaStream[]): MediaStream {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  for (const stream of streams) {
    if (stream.getAudioTracks().length === 0) continue;
    audioContext.createMediaStreamSource(stream).connect(destination);
  }

  return destination.stream;
}
