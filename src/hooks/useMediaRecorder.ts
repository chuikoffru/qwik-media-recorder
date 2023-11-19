import {useVisibleTask$, $, QRL, type NoSerialize, noSerialize, useSignal, Signal, useComputed$} from "@builder.io/qwik";

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;

  onstart: () => void;

  onresult: (event: SpeechRecognitionEvent) => void;

  onend: () => void;

  // Другие свойства и методы, которые вы хотите использовать
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export type RecordingStatus = "ready" | "recording" | "stopped" | "denied";

type HookReturn = {
  startRecording: QRL<() => Promise<void>>;
  stopRecording: QRL<() => void>;
  statusRecording: Signal<RecordingStatus>;
  clearRecording: QRL<() => void>;
  duration: Signal<number>;
  formattedDuration: Readonly<Signal<string>>;
  analyser: Signal<NoSerialize<AnalyserNode> | null>
  audioBlob: Signal<NoSerialize<Blob> | null>;
  transcript: Signal<string>;
  resetTranscript: QRL<() => void>;
};

type TranscriptOptions = {
  enable?: boolean;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

type Options = {
  timeLimit?: number;
  enableAnalyser?: boolean;
  transcipt?: TranscriptOptions
};

type UnchangeStore = {
  mediaRecorder: NoSerialize<MediaRecorder> | null;
  mediaStream: NoSerialize<MediaStream> | null;
  audioContext: NoSerialize<AudioContext> | null;
  sourceNode: NoSerialize<MediaStreamAudioSourceNode> | null;
  recognizer: NoSerialize<SpeechRecognition> | null;
}

export const useMediaRecorder = (options?: Options): HookReturn => {

  const statusRecording = useSignal<RecordingStatus>("ready");
  const store = useSignal<UnchangeStore>({
    mediaRecorder: null,
    mediaStream: null,
    audioContext: null,
    sourceNode: null,
    recognizer: null,
  });
  const audioUrl = useSignal<string>("");
  const duration = useSignal<number>(0);
  const audioBlob = useSignal<NoSerialize<Blob> | null>(null);
  const transcript = useSignal<string>("");
  const analyserNode = useSignal<NoSerialize<AnalyserNode> | null>(null);

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

      // Передаем стрим в стор
      store.value.mediaStream =  noSerialize(stream);

      // Создаем аудио контекст, источник и анализатор
      if (options?.enableAnalyser) {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const source = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 32;
        source.connect(analyser);

        // Передаем анализатор в стор
        analyserNode.value =  noSerialize(analyser);
        // Передаем источник в стор
        store.value.sourceNode =  noSerialize(source);
        // Передаем контекст в стор
        store.value.audioContext =  noSerialize(ac);
      }
      if (options?.transcipt?.enable) {
        store.value.recognizer = noSerialize(new (window.webkitSpeechRecognition ||
          window.SpeechRecognition)());
    
        if (!store.value.recognizer) {
          throw new Error('SpeechRecognition API is not supported in this browser.');
        }
    
        store.value.recognizer.lang = options.transcipt.lang || 'en-US';
        store.value.recognizer.continuous = options.transcipt.continuous ?? true
        store.value.recognizer.interimResults = options.transcipt.interimResults ?? false
    
        store.value.recognizer.onstart = (): void => {
          // setIsListening(true);
        };
    
        store.value.recognizer.onresult = (event: SpeechRecognitionEvent): void => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            transcript.value += text;
          }
        };
    
        store.value.recognizer.onend = (): void => {
          // setIsListening(false);
        };
    
        store.value.recognizer.start();
      }

      // Передаем поток в рекордер
      const recorder = new MediaRecorder(stream);
      // Стартуем запись
      recorder.start();
      // Навешиваем обработчик доступности данных
      recorder.ondataavailable = finishRecording;
      // Передаем рекордер в стор
      store.value.mediaRecorder =  noSerialize(recorder);
      // Меняем статус на активный
      statusRecording.value =  "recording";
    } catch (error) {
      // Меняем статус на отказ
      statusRecording.value =  "denied";
    }
  });

  const resetTranscript = $(() => {
    transcript.value = "";
  });

  /**
   * Остановить запись
   */
  const stopRecording = $(() => {
    if (!store.value.mediaRecorder) return;
    console.log(`stopRecording`);
      // Меняем статус
      statusRecording.value = "stopped";
      // Останавливаем запись
      store.value.mediaRecorder.stop();
      // Отключаем стрим
      store.value.mediaStream?.getTracks().forEach((track) => track.stop());
      // Удаляем стрим из хранилища
      store.value.mediaStream =  null;
      // Удаляем анализатор из стора
      analyserNode.value =  null;
      // Останавливаем распознавание если оно было
      store.value.recognizer?.stop();
  });

  const clearRecording = $(() => {
    console.log(`clearRecording`);
    // Сбрасываем статус
    statusRecording.value = "ready";
    // Сбрасываем длительность
    duration.value = 0;
    // Чистим url
    audioUrl.value = "";
    // Удаляем рекордер из стора
    store.value.mediaRecorder = null;
    // Удаляем стрим из хранилища
    store.value.mediaStream = null;
    // Удаляем анализатор из стора
    analyserNode.value = null;
    // Удаляем источник из стора
    store.value.sourceNode =  null;
    // Удаляем контекст из стора
    store.value.audioContext =  null;
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
    duration,
    formattedDuration,
    audioBlob,
    analyser: analyserNode,
    transcript,
    resetTranscript
  };

}