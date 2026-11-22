import { useCallback, useEffect, useRef, useState } from 'react';

interface PianoAudioState {
  isPlaying: boolean;
  hasStarted: boolean;
  isUsingCustomAudio: boolean;
  audioError: string | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  getFrequencyBars: (barCount: number) => number[];
}

// Original gentle 6/8 acoustic piano composition in Ab major (demo fallback until user uploads their own recording)
interface PianoNoteEvent {
  step: number; // 0..95 (eighth-note steps at ~118 eighth notes/min)
  midi: number;
  velocity: number;
  duration: number; // seconds
}

const DEMO_PIANO_LOOP_STEPS = 96;
const STEP_DURATION_SEC = 0.34;

// Warm, tender 6/8 arpeggiated solo piano waltz progression: Ab -> Fm7 -> Db(add9) -> Eb(sus4)
const DEMO_PIANO_SEQUENCE: PianoNoteEvent[] = [
  // Measure 1-2: Ab major (steps 0..23)
  { step: 0, midi: 44, velocity: 0.42, duration: 2.8 },
  { step: 0, midi: 68, velocity: 0.56, duration: 1.5 },
  { step: 2, midi: 51, velocity: 0.32, duration: 1.6 },
  { step: 4, midi: 56, velocity: 0.34, duration: 1.6 },
  { step: 6, midi: 60, velocity: 0.44, duration: 1.4 },
  { step: 8, midi: 63, velocity: 0.48, duration: 1.3 },
  { step: 10, midi: 68, velocity: 0.52, duration: 1.5 },
  { step: 12, midi: 44, velocity: 0.38, duration: 2.6 },
  { step: 12, midi: 70, velocity: 0.54, duration: 1.4 },
  { step: 14, midi: 51, velocity: 0.3, duration: 1.4 },
  { step: 16, midi: 56, velocity: 0.34, duration: 1.4 },
  { step: 18, midi: 72, velocity: 0.58, duration: 1.8 },
  { step: 20, midi: 68, velocity: 0.44, duration: 1.3 },
  { step: 22, midi: 63, velocity: 0.38, duration: 1.3 },

  // Measure 3-4: Fm7 (steps 24..47)
  { step: 24, midi: 41, velocity: 0.42, duration: 2.8 },
  { step: 24, midi: 68, velocity: 0.56, duration: 1.7 },
  { step: 26, midi: 48, velocity: 0.32, duration: 1.6 },
  { step: 28, midi: 53, velocity: 0.34, duration: 1.6 },
  { step: 30, midi: 60, velocity: 0.44, duration: 1.5 },
  { step: 32, midi: 63, velocity: 0.48, duration: 1.4 },
  { step: 34, midi: 65, velocity: 0.5, duration: 1.5 },
  { step: 36, midi: 41, velocity: 0.36, duration: 2.6 },
  { step: 36, midi: 63, velocity: 0.52, duration: 1.6 },
  { step: 38, midi: 48, velocity: 0.3, duration: 1.4 },
  { step: 40, midi: 56, velocity: 0.35, duration: 1.4 },
  { step: 42, midi: 60, velocity: 0.42, duration: 1.6 },
  { step: 44, midi: 63, velocity: 0.45, duration: 1.4 },
  { step: 46, midi: 68, velocity: 0.48, duration: 1.5 },

  // Measure 5-6: Db major9 (steps 48..71)
  { step: 48, midi: 37, velocity: 0.42, duration: 2.9 },
  { step: 48, midi: 65, velocity: 0.55, duration: 1.7 },
  { step: 50, midi: 49, velocity: 0.32, duration: 1.5 },
  { step: 52, midi: 53, velocity: 0.34, duration: 1.5 },
  { step: 54, midi: 56, velocity: 0.38, duration: 1.5 },
  { step: 56, midi: 61, velocity: 0.46, duration: 1.4 },
  { step: 58, midi: 63, velocity: 0.5, duration: 1.5 },
  { step: 60, midi: 49, velocity: 0.36, duration: 2.5 },
  { step: 60, midi: 68, velocity: 0.56, duration: 1.8 },
  { step: 62, midi: 53, velocity: 0.3, duration: 1.4 },
  { step: 64, midi: 56, velocity: 0.34, duration: 1.4 },
  { step: 66, midi: 65, velocity: 0.48, duration: 1.6 },
  { step: 68, midi: 61, velocity: 0.42, duration: 1.4 },
  { step: 70, midi: 56, velocity: 0.36, duration: 1.4 },

  // Measure 7-8: Eb sus4 -> Eb7 -> resolve (steps 72..95)
  { step: 72, midi: 39, velocity: 0.42, duration: 2.9 },
  { step: 72, midi: 63, velocity: 0.54, duration: 1.7 },
  { step: 74, midi: 46, velocity: 0.3, duration: 1.5 },
  { step: 76, midi: 51, velocity: 0.34, duration: 1.5 },
  { step: 78, midi: 56, velocity: 0.4, duration: 1.4 },
  { step: 80, midi: 58, velocity: 0.44, duration: 1.4 },
  { step: 82, midi: 63, velocity: 0.48, duration: 1.5 },
  { step: 84, midi: 39, velocity: 0.38, duration: 2.6 },
  { step: 84, midi: 67, velocity: 0.52, duration: 1.8 },
  { step: 86, midi: 46, velocity: 0.3, duration: 1.4 },
  { step: 88, midi: 55, velocity: 0.35, duration: 1.4 },
  { step: 90, midi: 63, velocity: 0.46, duration: 1.6 },
  { step: 92, midi: 65, velocity: 0.48, duration: 1.4 },
  { step: 94, midi: 67, velocity: 0.44, duration: 1.4 },
];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Continuous background piano audio engine.
 * - Supports a custom user-recorded piano audio file seamlessly without restarting on scroll.
 * - Provides a gentle acoustic-piano Web Audio synthesizer fallback for the demo so the
 *   music and piano waveform visualizer work immediately after the user interacts.
 */
export function usePianoAudio(customAudioUrl: string | null): PianoAudioState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Custom <audio> element refs
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Procedural piano scheduler refs
  const schedulerTimerRef = useRef<number | null>(null);
  const currentStepRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const customUrlRef = useRef<string | null>(customAudioUrl);

  const ensureAudioGraph = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.72;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.84;

      // Subtle warm room reverb using gentle feedback delay for lush solo piano bloom
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.22;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.26;
      const wetFilter = ctx.createBiquadFilter();
      wetFilter.type = 'lowpass';
      wetFilter.frequency.value = 2100;
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.24;

      masterGain.connect(analyser);
      masterGain.connect(delay);
      delay.connect(wetFilter);
      wetFilter.connect(feedback);
      feedback.connect(delay);
      wetFilter.connect(wetGain);
      wetGain.connect(analyser);

      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;
      freqBufferRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    return audioCtxRef.current;
  }, []);

  const triggerPianoVoice = useCallback(
    (midi: number, time: number, velocity: number, duration: number) => {
      const ctx = audioCtxRef.current;
      const destination = masterGainRef.current;
      if (!ctx || !destination) return;

      const freq = midiToFreq(midi);
      const voiceGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(4800, freq * 6.5), time);
      filter.frequency.exponentialRampToValueAtTime(Math.max(420, freq * 1.6), time + duration);

      // Fundamental + warm second harmonic + delicate third overtone for acoustic piano timbre
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, time);
      osc2.detune.setValueAtTime(1.8, time);

      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, time);

      const gain1 = ctx.createGain();
      gain1.gain.value = 0.68;
      const gain2 = ctx.createGain();
      gain2.gain.value = 0.24;
      const gain3 = ctx.createGain();
      gain3.gain.value = 0.08;

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      gain1.connect(filter);
      gain2.connect(filter);
      gain3.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(destination);

      const peak = velocity * 0.24;
      voiceGain.gain.setValueAtTime(0.0001, time);
      voiceGain.gain.linearRampToValueAtTime(peak, time + 0.018);
      voiceGain.gain.exponentialRampToValueAtTime(peak * 0.42, time + 0.35);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc1.start(time);
      osc2.start(time);
      osc3.start(time);
      osc1.stop(time + duration + 0.06);
      osc2.stop(time + duration + 0.06);
      osc3.stop(time + duration + 0.06);
    },
    []
  );

  const stopScheduler = useCallback(() => {
    if (schedulerTimerRef.current !== null) {
      window.clearInterval(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
  }, []);

  const startScheduler = useCallback(() => {
    const ctx = ensureAudioGraph();
    stopScheduler();
    nextNoteTimeRef.current = ctx.currentTime + 0.06;

    const scheduleAheadTime = 0.22;
    schedulerTimerRef.current = window.setInterval(() => {
      if (!isPlayingRef.current || !audioCtxRef.current || customUrlRef.current) {
        return;
      }
      const now = audioCtxRef.current.currentTime;
      while (nextNoteTimeRef.current < now + scheduleAheadTime) {
        const step = currentStepRef.current;
        for (const ev of DEMO_PIANO_SEQUENCE) {
          if (ev.step === step) {
            triggerPianoVoice(ev.midi, nextNoteTimeRef.current, ev.velocity, ev.duration);
          }
        }
        nextNoteTimeRef.current += STEP_DURATION_SEC;
        currentStepRef.current = (step + 1) % DEMO_PIANO_LOOP_STEPS;
      }
    }, 65);
  }, [ensureAudioGraph, stopScheduler, triggerPianoVoice]);

  // Handle switching between custom uploaded piano recording and built-in demo piano
  useEffect(() => {
    const prevUrl = customUrlRef.current;
    customUrlRef.current = customAudioUrl;

    if (prevUrl === customAudioUrl) return;

    // Clean up old custom element playback if any
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    if (customAudioUrl) {
      stopScheduler();
      const ctx = ensureAudioGraph();

      if (!htmlAudioRef.current) {
        const el = new Audio();
        el.loop = true;
        el.crossOrigin = 'anonymous';
        el.preload = 'auto';
        htmlAudioRef.current = el;

        if (!mediaSourceRef.current && masterGainRef.current) {
          mediaSourceRef.current = ctx.createMediaElementSource(el);
          mediaSourceRef.current.connect(masterGainRef.current);
        }
      }

      htmlAudioRef.current.src = customAudioUrl;
      htmlAudioRef.current.load();

      if (isPlayingRef.current) {
        ctx.resume().then(() => {
          htmlAudioRef.current?.play().catch(() => {
            setAudioError('Tap Play to start your piano recording.');
          });
        });
      }
    } else if (isPlayingRef.current) {
      startScheduler();
    }
  }, [customAudioUrl, ensureAudioGraph, startScheduler, stopScheduler]);

  const play = useCallback(async () => {
    try {
      setAudioError(null);
      const ctx = ensureAudioGraph();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      isPlayingRef.current = true;
      setHasStarted(true);
      setIsPlaying(true);

      if (customUrlRef.current) {
        stopScheduler();
        if (!htmlAudioRef.current) {
          const el = new Audio(customUrlRef.current);
          el.loop = true;
          el.crossOrigin = 'anonymous';
          htmlAudioRef.current = el;
          if (masterGainRef.current) {
            mediaSourceRef.current = ctx.createMediaElementSource(el);
            mediaSourceRef.current.connect(masterGainRef.current);
          }
        }
        await htmlAudioRef.current.play();
      } else {
        startScheduler();
      }
    } catch {
      setAudioError('Unable to start audio playback.');
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, [ensureAudioGraph, startScheduler, stopScheduler]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopScheduler();
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
  }, [stopScheduler]);

  const toggle = useCallback(async () => {
    if (isPlayingRef.current) {
      pause();
    } else {
      await play();
    }
  }, [pause, play]);

  const getFrequencyBars = useCallback((barCount: number): number[] => {
    const analyser = analyserRef.current;
    const buffer = freqBufferRef.current;
    if (!analyser || !buffer || !isPlayingRef.current) {
      return Array.from({ length: barCount }, () => 0.14);
    }
    analyser.getByteFrequencyData(buffer);
    const bars: number[] = [];
    const usableBins = Math.min(buffer.length, 20);
    for (let i = 0; i < barCount; i++) {
      const binIndex = Math.floor((i / barCount) * usableBins);
      const raw = buffer[binIndex] / 255;
      bars.push(Math.max(0.16, Math.min(1, raw * 1.25)));
    }
    return bars;
  }, []);

  useEffect(() => {
    return () => {
      stopScheduler();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopScheduler]);

  return {
    isPlaying,
    hasStarted,
    isUsingCustomAudio: Boolean(customAudioUrl),
    audioError,
    play,
    pause,
    toggle,
    getFrequencyBars,
  };
}
