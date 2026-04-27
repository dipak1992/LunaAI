'use client';

import { motion } from 'framer-motion';
import { Mic, Send, Square } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useRef } from 'react';
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder';

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: (text?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ input, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isRecording, isTranscribing, start, stop } = useVoiceRecorder({
    onTranscribed: (text) => {
      onSubmit(text);
    },
    onError: (msg) => {
      console.warn('[voice]', msg);
    },
  });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleMic = () => {
    if (isRecording) stop();
    else start();
  };

  const placeholder = isTranscribing
    ? 'listening to your whisper…'
    : isRecording
      ? 'recording…'
      : 'whisper to Luna…';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-luna-whisper/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled || isRecording || isTranscribing}
        rows={1}
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-luna-cream placeholder:text-luna-whisper/40 outline-none md:text-base"
        style={{ minHeight: '44px' }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = Math.min(el.scrollHeight, 160) + 'px';
        }}
      />

      {/* Mic button */}
      <motion.button
        type="button"
        onClick={toggleMic}
        disabled={disabled || isTranscribing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
          isRecording
            ? 'bg-luna-aurora-pink/90 text-luna-ink'
            : 'bg-white/[0.06] text-luna-whisper/70 hover:text-luna-cream'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? (
          <Square className="h-4 w-4 fill-current" strokeWidth={0} />
        ) : (
          <Mic className="h-4 w-4" strokeWidth={1.8} />
        )}
      </motion.button>

      {/* Send button */}
      <motion.button
        type="submit"
        disabled={disabled || !input.trim()}
        whileHover={{ scale: input.trim() ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-luna-aurora-lilac to-luna-aurora-pink text-white disabled:opacity-40 transition-opacity"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
      </motion.button>
    </form>
  );
}
