import { component$, useVisibleTask$, $ } from "@builder.io/qwik";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { useSound } from "../../hooks/useSound";

export const Recorder = component$(() => {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getPreview,
    statusRecording,
    clearRecording,
    audioBlob,
    formattedDuration,
    audioUrl,
    transcript,
  } = useMediaRecorder({ transcipt: { enable: true }, enableAnalyser: true });

  const { play, isPlaying, stop, load } = useSound(audioUrl.value);

  useVisibleTask$(({ track }) => {
    const blob = track(() => audioBlob.value);

    console.log("audioBlob :>> ", blob);
  });

  useVisibleTask$(({ track }) => {
    const text = track(() => transcript.value);

    console.log("text :>> ", text);
  });

  const preview = $(async () => {
    if (isPlaying.value) {
      stop();
      return;
    }
    const blob = await getPreview();
    const url = URL.createObjectURL(blob);
    load(url);
    play();
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

      <div>
        {formattedDuration.value}{" "}
        <button disabled={statusRecording.value !== "paused"} onClick$={preview}>
          {isPlaying.value ? "Pause" : "Play"}
        </button>
      </div>

      {statusRecording.value === "ready" && audioUrl.value ? (
        <button onClick$={clearRecording}>Reset</button>
      ) : (
        <button onClick$={stopRecording} disabled={statusRecording.value === "ready"}>
          Stop
        </button>
      )}
    </div>
  );
});
