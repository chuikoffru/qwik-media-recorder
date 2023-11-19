import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { MediaButton } from "../button";

export const Recorder = component$(() => {
  const {
    startRecording,
    stopRecording,
    statusRecording,
    clearRecording,
    audioBlob,
    formattedDuration,
    analyser,
    transcript,
  } = useMediaRecorder({ transcipt: { enable: true }, enableAnalyser: true });

  useVisibleTask$(({ track, cleanup }) => {
    const blob = track(() => audioBlob.value);

    console.log("audioBlob :>> ", blob);

    cleanup(() => clearRecording());
  });

  useVisibleTask$(({ track }) => {
    const text = track(() => transcript.value);

    console.log("text :>> ", text);
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
