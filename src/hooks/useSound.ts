import {noSerialize, useSignal, useVisibleTask$, $, type NoSerialize} from "@builder.io/qwik";

export const useSound = (sound: string) => {
  const audioRef = useSignal<NoSerialize<HTMLAudioElement>>();

  useVisibleTask$(async () => {
    const audio = new Audio(sound);
    audioRef.value = noSerialize(audio);
  });

  const play = $(() => audioRef.value?.play());

  return [play];
}