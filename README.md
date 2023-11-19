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
    clearRecording,
    audioBlob,
    formattedDuration,
    analyser,
  } = useMediaRecorder({enableAnalyser: true});

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
    </div>
  );
});
```

# useSound() hook for Qwik

This hook just play a sound from audiofile.

```
import { component$ } from "@builder.io/qwik";
import { useSound } from "qwik-media-recorder";
import sound from "../assets/sound.mp3";

export const App = component$(() => {
  const { play, stop, isPlaying, time, undo, redo, seek, duration } = useSound(sound);

  return (
    <button onClick$={play}>Play</button>
  );
});

```

# Transcript voice to text (SpeechRecognition)
```
export default component$(() => {
  const {
    startRecording,
    stopRecording,
    statusRecording,
    transcript,
    formattedDuration,
  } = useMediaRecorder({ transcipt: { enable: true }});

  useVisibleTask$(({ track }) => {
    const text = track(() => transcript.value);
    console.log("text :>> ", text);
  });

  return (
    <div>
      {transcript.value}
      <MediaButton
        status={statusRecording}
        analyser={analyser}
        onStart={startRecording}
        onStop={stopRecording}
        formattedDuration={formattedDuration}
      />
    </div>
  );
});
```