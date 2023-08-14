import {useVisibleTask$, $, QRL, type NoSerialize, noSerialize, useSignal, Signal, useComputed$} from "@builder.io/qwik";

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export type RecordingStatus = "ready" | "recording" | "stopped" | "denied";

type HookReturn = {
  startRecording: QRL<() => Promise<void>>;
  stopRecording: QRL<() => void>;
  statusRecording: Signal<RecordingStatus>;
  clearRecording: QRL<() => void>;
  isPlaying: Signal<boolean>;
  startPlaying: QRL<(url?: string) => void>;
  stopPlaying: QRL<() => void>;
  duration: Signal<number>;
  formattedDuration: Readonly<Signal<string>>;
  analyser: Signal<NoSerialize<AnalyserNode> | null>;
  audioBlob: Signal<NoSerialize<Blob> | null>;
};

type Options = {
  timeLimit?: number;
};

export const useMediaRecorder = (options?: Options): HookReturn => {

  const statusRecording = useSignal<RecordingStatus>("ready");
  const isPlaying = useSignal<boolean>(false);
  const mediaRecorder = useSignal<NoSerialize<MediaRecorder> | null>(null);
  const audioPlayer = useSignal<NoSerialize<HTMLAudioElement> | null>(null);
  const mediaStream = useSignal<NoSerialize<MediaStream> | null>(null);
  const audioContext = useSignal<NoSerialize<AudioContext> | null>(null);
  const analyserNode = useSignal<NoSerialize<AnalyserNode> | null>(null);
  const sourceNode = useSignal<NoSerialize<MediaStreamAudioSourceNode> | null>(null);
  const audioUrl = useSignal<string>("");
  const duration = useSignal<number>(0);
  const audioBlob = useSignal<NoSerialize<Blob> | null>(null);

  const formattedDuration = useComputed$(() => {
    const time = new Date();
    time.setHours(0, 0, 0, 0);
    time.setSeconds(time.getSeconds() + duration.value);
    return `${("0" + time.getMinutes()).slice(-2)}:${("0" + time.getSeconds()).slice(-2)}`;
  });

  /**
   * Возвращаем записанные данные, меняем статус и передаем в плеер
   */
  const finishRecording = $(({ data }: { data: Blob }) => {
      // Создаем уникальный url для записи
      const url = URL.createObjectURL(data);
      // Меняем статус записи
      statusRecording.value = "stopped";
      // Записываем url в хранилище
      audioUrl.value = url;
      // Передаем плеер в хранилище
      audioPlayer.value = noSerialize(new Audio(url));
      // Передаем данные в колбэк
      audioBlob.value = noSerialize(data);
    })

  /**
   * Статуем запись с микрофона
   */
  const startRecording = $(async () => {
    console.log(`startRecording`);
    // Указываем дефолтный статус
    statusRecording.value = "ready";
    // Сбрасываем длительность
    duration.value = 0;
    try {
      // Получаем аудио с микрофона
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Создаем аудио контекст, источник и анализатор
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const source = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.smoothingTimeConstant = 0.5;
      analyser.fftSize = 32;
      source.connect(analyser);
      // Передаем стрим в стор
      mediaStream.value =  noSerialize(stream);
      // Передаем анализатор в стор
      analyserNode.value =  noSerialize(analyser);
      // Передаем источник в стор
      sourceNode.value =  noSerialize(source);
      // Передаем контекст в стор
      audioContext.value =  noSerialize(ac);
      // Передаем поток в рекордер
      const recorder = new MediaRecorder(stream);
      // Стартуем запись
      recorder.start();
      // Навешиваем обработчик доступности данных
      recorder.ondataavailable = finishRecording;
      // Передаем рекордер в стор
      mediaRecorder.value =  noSerialize(recorder);
      // Меняем статус на активный
      statusRecording.value =  "recording";
    } catch (error) {
      // Меняем статус на отказ
      statusRecording.value =  "denied";
    }
  });

  /**
   * Остановить запись
   */
  const stopRecording = $(() => {
    if (!mediaRecorder.value) return;
    console.log(`stopRecording`);
      // Меняем статус
      statusRecording.value =  "stopped";
      // Останавливаем запись
      mediaRecorder.value.stop();
      // Отключаем стрим
      mediaStream.value?.getTracks().forEach((track) => track.stop());
      // Удаляем стрим из хранилища
      mediaStream.value =  null;
      // Удаляем анализатор из стора
      analyserNode.value =  null;
  });

  const clearRecording = $(() => {
    console.log(`clearRecording`);
    // Сбрасываем статус
    statusRecording.value =  "ready";
    // Сбрасываем длительность
    duration.value =  0;
    // Чистим url
    audioUrl.value =  "";
    // Удаляем рекордер из стора
    mediaRecorder.value =  null;
    // Удаляем стрим из хранилища
    mediaStream.value =  null;
    // Удаляем анализатор из стора
    analyserNode.value =  null;
    // Удаляем источник из стора
    sourceNode.value =  null;
    // Удаляем контекст из стора
    audioContext.value =  null;
  })

  const startPlaying = $(() => {
    if (!audioPlayer.value) return; 
    // Меняем статус
    isPlaying.value =  true
    // Запускаем плеер
    audioPlayer.value.play();
    // Меняем статус по достижении конца трека
    audioPlayer.value.onended = () => isPlaying.value =  false;
  });

  /**
   * Остановить воспроизведение
   */
  const stopPlaying = $(() => {
    if (!audioPlayer.value) return; 
    // Меняем статус проигрывателя
    isPlaying.value =  false;
    // Ставим на паузу
    audioPlayer.value.pause();
    // Удаляем обработчик
    audioPlayer.value.onended = () => isPlaying.value =  false;
  });

  useVisibleTask$(({track, cleanup}) => {
    track(() => statusRecording.value)

    let timerId: number | undefined;
    // Если статус установлен на запись, и не запущен счетчик, запускаем
    if (statusRecording.value === "recording" && !timerId) {
      timerId = setInterval(
        () => duration.value++,
        1000
      );
    } else {
      timerId && clearInterval(timerId);
    }

    cleanup(() => {
      timerId && clearInterval(timerId);
    })

  })

  useVisibleTask$(({track}) => {
    track(() => statusRecording.value)
    track(() => duration.value)
 
    // Если установлен лимит времени, прекращаем запись по достижению лимита
    if (options?.timeLimit) {
      if (statusRecording.value === "recording" && duration.value >= options.timeLimit) {
        stopRecording();
      }
    }
  })

  useVisibleTask$(({cleanup}) => {
    cleanup(() => clearRecording())
  })

  return {
    startRecording,
    stopRecording,
    clearRecording,
    statusRecording,
    isPlaying,
    startPlaying,
    stopPlaying,
    duration,
    formattedDuration,
    audioBlob,
    analyser: analyserNode,
  };

}