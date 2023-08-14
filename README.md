# Qwik Media Recorder

This is a simple media recorder hook for Qwik application. 
It allows users to record audio from their device's microphone.

Also, it displays a recording indicator and provides a simple UI to stop/pause recording.

[![Publish to NPM](https://github.com/chuikoffru/qwik-media-recorder/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/chuikoffru/qwik-media-recorder/actions/workflows/npm-publish.yml)

## How to use it?

```
export default component$(() => {
  const {
    startRecording,
    stopRecording,
    statusRecording,
    startPlaying,
    stopPlaying,
    isPlaying,
    clearRecording,
    audioBlob,
    formattedDuration,
    analyser,
  } = useMediaRecorder();

  useVisibleTask$(({ track, cleanup }) => {
    track(() => audioBlob.value);

    console.log("audioBlob :>> ", audioBlob.value);

    cleanup(() => clearRecording()); // Optinally
  });

  return (
    <div>
      <MediaButton
        status={statusRecording}
        analyser={analyser}
        onStart={startRecording}
        onStop={stopRecording}
        formattedDuration={formattedDuration}
      />
      <PlayerButton
        onPlay={startPlaying}
        onStop={stopPlaying}
        audioBlob={audioBlob}
        isPlaying={isPlaying}
      />
    </div>
  );
});
```
