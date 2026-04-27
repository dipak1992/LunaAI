'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RecordingState, UseVoiceRecorderReturn } from '@/types/voice';
import {
  getSupportedMimeType,
  requestMicrophoneAccess,
  createAudioAnalyser,
  getAudioLevel,
  MAX_RECORDING_DURATION,
  MIN_RECORDING_DURATION,
} from '@/lib/utils/audio';

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextCleanupRef = useRef<(() => void) | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Cleanup helpers ────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (levelRafRef.current !== null) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    audioContextCleanupRef.current?.();
    audioContextCleanupRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const stopTimers = useCallback(() => {
    if (durationIntervalRef.current !== null) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (maxDurationTimerRef.current !== null) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  // ── Level meter loop ───────────────────────────────────────────────────
  const startLevelMeter = useCallback((stream: MediaStream) => {
    const { analyser, cleanup } = createAudioAnalyser(stream);
    analyserRef.current = analyser;
    audioContextCleanupRef.current = cleanup;

    const tick = () => {
      if (analyserRef.current) {
        setAudioLevel(getAudioLevel(analyserRef.current));
        levelRafRef.current = requestAnimationFrame(tick);
      }
    };
    levelRafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Start recording ────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);
    setState('requesting');

    let stream: MediaStream;
    try {
      stream = await requestMicrophoneAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access failed');
      setState('error');
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: mimeType || 'audio/webm',
      });
      setAudioBlob(blob);
      stopStream();
      stopLevelMeter();
      stopTimers();
    };

    recorder.onerror = () => {
      setError('Recording failed. Please try again.');
      setState('error');
      stopStream();
      stopLevelMeter();
      stopTimers();
    };

    recorder.start(250); // collect chunks every 250 ms
    startTimeRef.current = Date.now();
    setState('recording');

    // Duration counter
    durationIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Auto-stop at max duration
    maxDurationTimerRef.current = setTimeout(() => {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
        setState('processing');
      }
    }, MAX_RECORDING_DURATION * 1000);

    startLevelMeter(stream);
  }, [startLevelMeter, stopLevelMeter, stopStream, stopTimers]);

  // ── Stop recording ─────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (elapsed < MIN_RECORDING_DURATION) {
      setError(`Please record for at least ${MIN_RECORDING_DURATION} seconds.`);
      setState('error');
      recorderRef.current?.stop();
      return;
    }

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setState('processing');
    }
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    stopStream();
    stopLevelMeter();
    stopTimers();
    chunksRef.current = [];
    recorderRef.current = null;
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    setState('idle');
  }, [stopLevelMeter, stopStream, stopTimers]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopStream();
      stopLevelMeter();
      stopTimers();
    };
  }, [stopLevelMeter, stopStream, stopTimers]);

  return {
    state,
    audioLevel,
    duration,
    error,
    startRecording,
    stopRecording,
    reset,
    audioBlob,
  };
}
