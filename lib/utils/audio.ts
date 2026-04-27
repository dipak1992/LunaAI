// Browser-side audio utilities for voice recording

export const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
] as const;

/**
 * Returns the first MIME type supported by MediaRecorder in this browser.
 * Falls back to empty string (browser default) if none match.
 */
export function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) return '';
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * Requests microphone access and returns a MediaStream.
 * Throws a user-friendly error string on failure.
 */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
      },
    });
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Microphone access was denied. Please allow microphone access and try again.');
      }
      if (err.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
    }
    throw new Error('Could not access microphone. Please check your browser settings.');
  }
}

/**
 * Creates an AnalyserNode attached to the given stream for real-time level metering.
 */
export function createAudioAnalyser(
  stream: MediaStream,
): { analyser: AnalyserNode; context: AudioContext; cleanup: () => void } {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  return {
    analyser,
    context,
    cleanup: () => {
      source.disconnect();
      context.close();
    },
  };
}

/**
 * Reads the current RMS audio level from an AnalyserNode.
 * Returns a value between 0 and 1.
 */
export function getAudioLevel(analyser: AnalyserNode): number {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / dataArray.length);
  return Math.min(rms / 128, 1); // normalise to 0–1
}

/**
 * Converts a Blob to a File object suitable for the OpenAI Whisper API.
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || 'audio/webm' });
}

/**
 * Formats seconds into MM:SS display string.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Maximum recording duration in seconds (5 minutes) */
export const MAX_RECORDING_DURATION = 300;

/** Minimum recording duration in seconds (3 seconds) */
export const MIN_RECORDING_DURATION = 3;
