import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { MediaButton } from "../button";
import { PlayerButton } from "../player";

export const Recorder = component$(() => {
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

    cleanup(() => clearRecording());
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
