import { type NoSerialize, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import styles from "./DynamicIcon.module.css";

type DynamicIconProps = {
  analyser: NoSerialize<AnalyserNode>;
};

export const DynamicIcon = component$<DynamicIconProps>(({ analyser }) => {
  const ref = useSignal<HTMLDivElement>();

  useVisibleTask$(({ cleanup }) => {
    if (!ref.value) return;
    if (!analyser) return;

    const dataMap: { [key: number]: number } = {
      0: 15,
      1: 10,
      2: 8,
      3: 9,
      4: 6,
      5: 5,
      6: 2,
      7: 1,
      8: 0,
      9: 4,
      10: 3,
      11: 7,
      12: 11,
      13: 12,
      14: 13,
      15: 14,
    };
    let raf: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    for (let i = 0; i < bufferLength; ++i) {
      const elm = document.createElement("div");
      ref.value.appendChild(elm);
    }

    const visualElements = ref.value.querySelectorAll("div");

    const draw = () => {
      if (!ref.value) return;
      if (!analyser) return;
      const values = Object.values(dataArray);

      raf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      for (let i = 0; i < bufferLength; i++) {
        const value = values[dataMap[i]] / 255;
        const elmStyles = visualElements[i].style;
        elmStyles.transform = `scaleY( ${value} )`;
        elmStyles.opacity = `${Math.max(0.25, value)}`;
      }
    };

    draw();

    cleanup(() => {
      cancelAnimationFrame(raf);
    });
  });

  return <div class={styles.dynamic} ref={ref}></div>;
});
