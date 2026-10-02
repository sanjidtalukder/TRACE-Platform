'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  computeFeelMapping,
  isHapticsSupported,
  type FeelMappingResult,
} from './feelMapping';

export type ToneType = 'sine' | 'triangle' | 'square';

export interface UseHapticsReturn {
  isPlaying: boolean;
  hapticsSupported: boolean;
  sensitivity: number;
  setSensitivity: (val: number) => void;
  isAudioMuted: boolean;
  setIsAudioMuted: (val: boolean) => void;
  toneType: ToneType;
  setToneType: (type: ToneType) => void;
  feelDetails: FeelMappingResult | null;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  startFeel: (measurement: number) => void;
  stopFeel: () => void;
}

export function useHaptics(): UseHapticsReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [toneType, setToneTypeState] = useState<ToneType>('sine');
  const [hapticsSupported, setHapticsSupported] = useState<boolean>(false);
  const [feelDetails, setFeelDetails] = useState<FeelMappingResult | null>(null);

  const toneTypeRef = useRef<ToneType>('sine');
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    setHapticsSupported(isHapticsSupported());
  }, []);

  const setToneType = useCallback((type: ToneType) => {
    setToneTypeState(type);
    toneTypeRef.current = type;
    if (oscRef.current) {
      try {
        oscRef.current.type = type;
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  const stopFeel = useCallback(() => {
    // 1. Stop vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }

    // 2. Clear timer
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }

    // 3. Stop audio synthesizer and disconnect analyser
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {
        // Ignored
      }
      oscRef.current = null;
    }

    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch (e) {
        // Ignored
      }
      gainRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (e) {
        // Ignored
      }
      analyserRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // Ignored
      }
      audioCtxRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  const startFeel = useCallback(
    (measurement: number) => {
      stopFeel();

      const details = computeFeelMapping(measurement, sensitivity);
      setFeelDetails(details);
      setIsPlaying(true);

      // A. Trigger Haptic Vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(details.pattern);

        const totalPatternDuration = details.pattern.reduce((acc, curr) => acc + curr, 0);

        loopTimerRef.current = setInterval(() => {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(details.pattern);
          }
        }, totalPatternDuration + 200);
      }

      // B. Trigger Web Audio Synthesizer (if unmuted)
      if (!isAudioMuted && typeof window !== 'undefined') {
        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtxClass) {
            const ctx = new AudioCtxClass();
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
            audioCtxRef.current = ctx;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            osc.type = toneTypeRef.current;
            osc.frequency.setValueAtTime(details.frequencyHz, ctx.currentTime);

            // Pulsing Gain envelope matching haptic rhythm
            gain.gain.setValueAtTime(0.01, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(analyser);
            analyser.connect(ctx.destination);

            osc.start();
            oscRef.current = osc;
            gainRef.current = gain;
          }
        } catch (e) {
          console.warn('Web Audio playback failed or blocked by browser policy', e);
        }
      }
    },
    [sensitivity, isAudioMuted, stopFeel]
  );

  useEffect(() => {
    return () => {
      stopFeel();
    };
  }, [stopFeel]);

  return {
    isPlaying,
    hapticsSupported,
    sensitivity,
    setSensitivity,
    isAudioMuted,
    setIsAudioMuted,
    toneType,
    setToneType,
    feelDetails,
    analyserRef,
    startFeel,
    stopFeel,
  };
}
