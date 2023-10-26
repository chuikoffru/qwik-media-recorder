import {noSerialize, useSignal, useVisibleTask$, $, type NoSerialize} from "@builder.io/qwik";

export const useSound = (url: string) => {
  const audioRef = useSignal<NoSerialize<HTMLAudioElement>>();
  const isPlaying = useSignal(false);
  const time = useSignal(0);
  const duration = useSignal(0);

  useVisibleTask$(async () => {
    const audio = new Audio(url);
    audio.addEventListener("play", () => isPlaying.value = true);
    audio.addEventListener("ended", () => isPlaying.value = false);
    audio.addEventListener("pause", () => isPlaying.value = false);
    audio.addEventListener("timeupdate", () => {
      time.value = audio.currentTime;
    })
    audio.addEventListener("loadedmetadata", () => {
      duration.value = audio.duration;
    })
    audioRef.value = noSerialize(audio);
  });

  const play = $(() => audioRef.value?.play());
  const stop = $(() => audioRef.value?.pause());

  const undo = $((offset: number = 10) => {
    if (audioRef.value) {
      audioRef.value.currentTime -= offset
    }
  });

  const redo = $((offset: number = 10) => {
    if (audioRef.value) {
      audioRef.value.currentTime += offset
    }
  });

  const seek = $((newTime: number) => {
    if (audioRef.value) {
      audioRef.value.currentTime = newTime;
    }
  });

  return {play, stop, isPlaying, time, undo, redo, seek, duration};
}