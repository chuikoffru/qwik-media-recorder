import { type NoSerialize, component$, useSignal, useVisibleTask$, Signal } from "@builder.io/qwik";

type DynamicIconProps = {
  analyser: Signal<NoSerialize<AnalyserNode> | null>;
};

export const DynamicIcon = component$<DynamicIconProps>(({ analyser }) => {
  const ref = useSignal<SVGSVGElement>();

  useVisibleTask$(({ cleanup }) => {
    if (!ref.value) return;
    if (!analyser.value) return;

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
    const bufferLength = analyser.value.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ref.value) return;
      if (!analyser.value) return;

      raf = requestAnimationFrame(draw);
      analyser.value.getByteFrequencyData(dataArray);

      const values = Object.values(dataArray);
      const bars = ref.value.querySelectorAll(".bar");

      for (let i = 0; i < bufferLength; i++) {
        const value = values[dataMap[i]] / 255;
        const bar = bars[dataMap[i]];
        bar.setAttribute("transform", `scale(1, ${value})`);
        bar.setAttribute("opacity", `${Math.max(0.25, value)}`);
      }
    };

    draw();

    cleanup(() => {
      cancelAnimationFrame(raf);
    });
  });

  const svgStyles = {
    width: "100%",
    height: "100%",
  };

  return (
    <svg ref={ref} style={svgStyles}>
      {[...Array(analyser.value?.frequencyBinCount)].map((_, i) => (
        <rect class="bar" key={i} x={i * 10} width="8" height="100%" fill="#42a5f5" />
      ))}
    </svg>
  );
});
