import { NoSerialize, QRL, Signal, component$ } from "@builder.io/qwik";

type PlayerButtonProps = {
  isPlaying: Signal<boolean>;
  audioBlob: Signal<NoSerialize<Blob> | null>;
  onPlay: QRL<() => void>;
  onStop: QRL<() => void>;
};

export const PlayerButton = component$<PlayerButtonProps>(
  ({ isPlaying, audioBlob, onPlay, onStop }) => {
    return (
      <div>
        {audioBlob.value ? (
          isPlaying.value ? (
            <button onClick$={onStop}>Stop</button>
          ) : (
            <button onClick$={onPlay}>Play</button>
          )
        ) : (
          <p>No audio recorded</p>
        )}
      </div>
    );
  }
);
