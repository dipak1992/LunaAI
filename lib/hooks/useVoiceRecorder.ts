'use client';

import { useCallback, useRef, useState } from 'react';

interface Options {
  onTranscribed: (text: string) => void;
  onError?: (err: string) => void;
}

export function useVoiceRecorder({ onTranscribed, onError }: Options) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (blob.size < 1000) {
          onError?.('Too quiet — try again.');
          return;
        }

        setIsTranscribing(true);
        try {
          const fd = new FormData();
          const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
          fd.append('audio', blob, `recording.${ext}`);

          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Transcription failed');

          const { text } = (await res.json()) as { text?: string };
          if (text?.trim()) onTranscribed(text.trim());
          else onError?.("Didn't catch that.");
        } catch (err) {
          console.error(err);
          onError?.("Couldn't hear you clearly.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      onError?.('Microphone access denied.');
    }
  }, [onTranscribed, onError]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, isTranscribing, start, stop };
}
