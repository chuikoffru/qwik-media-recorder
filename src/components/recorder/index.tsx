import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";

export const Recorder = component$(() => {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    statusRecording,
    clearRecording,
    audioBlob,
    formattedDuration,
    audioUrl,
    transcript,
  } = useMediaRecorder({ transcipt: { enable: true }, enableAnalyser: true });

  useVisibleTask$(({ track }) => {
    const blob = track(() => audioBlob.value);

    console.log("audioBlob :>> ", blob);

    //cleanup(() => clearRecording());
  });

  useVisibleTask$(({ track }) => {
    const text = track(() => transcript.value);

    console.log("text :>> ", text);
  });

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {statusRecording.value === "ready" ? (
        <button onClick$={startRecording}>Start</button>
      ) : statusRecording.value === "paused" ? (
        <button onClick$={resumeRecording}>Resume</button>
      ) : (
        <button onClick$={pauseRecording}>Pause</button>
      )}

      {!audioUrl.value ? (
        <div>{formattedDuration.value}</div>
      ) : (
        <audio src={audioUrl.value} controls />
      )}
      {statusRecording.value === "stopped" ? (
        <button onClick$={clearRecording}>Reset</button>
      ) : (
        <button onClick$={stopRecording} disabled={statusRecording.value !== "recording"}>
          Stop
        </button>
      )}
    </div>
  );
});
