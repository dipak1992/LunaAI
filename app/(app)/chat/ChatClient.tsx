'use client';

import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UIMessage } from 'ai';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuroraBackground from '@/components/marketing/AuroraBackground';
import Message from '@/components/chat/Message';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import CrisisModal from '@/components/safety/CrisisModal';
import Logo from '@/components/brand/Logo';
import { useCrisisDetection } from '@/lib/hooks/useCrisisDetection';
import { useUpgradeModal } from '@/lib/hooks/useUpgradeModal';

interface Props {
  initialMessages: UIMessage[];
}

export default function ChatClient({ initialMessages }: Props) {
  const [input, setInput] = useState('');
  const initialMessageCount = initialMessages.length;
  const {
    open: upgradeOpen,
    feature: upgradeFeature,
    prompt: promptUpgrade,
    close: closeUpgrade,
  } = useUpgradeModal();

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new TextStreamChatTransport({ api: '/api/chat' }),
    messages: initialMessages,
    onError: (err) => {
      if (err.message.includes('limit_reached') || err.message.includes('402')) {
        promptUpgrade('chat');
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const crisis = useCrisisDetection(messages);

  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!error) return;

    if (error.message.includes('limit_reached') || error.message.includes('402')) {
      promptUpgrade('chat');
      clearError();
    }
  }, [clearError, error, promptUpgrade]);

  // Scroll to bottom on first mount without animation
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, []);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    sendMessage({ role: 'user', parts: [{ type: 'text', text: content }] });
    setInput('');
  };

  const showEmpty = messages.length === 0;

  // Extract text content from a UIMessage
  const getMessageText = (msg: UIMessage): string => {
    return msg.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('');
  };

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-luna-night">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <AuroraBackground />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-luna-whisper/10 bg-luna-night/60 px-4 py-4 backdrop-blur-xl sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-full border border-luna-whisper/10 bg-white/[0.04] px-3 py-2 text-sm text-luna-whisper/76 transition-colors hover:text-luna-cream"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <Logo size={30} animated={false} />
        <div className="w-[82px] sm:w-[116px]" aria-hidden="true" />
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
          {/* Empty state */}
          {showEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-12 text-center"
            >
              {/* Breathing orb */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  {/* Outer breathing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(200,168,233,0.2) 0%, transparent 70%)',
                    }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {/* Inner orb */}
                  <motion.div
                    className="relative flex h-20 w-20 items-center justify-center rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,212,163,0.4) 0%, rgba(200,168,233,0.5) 50%, rgba(143,184,232,0.4) 100%)',
                      boxShadow: '0 0 40px rgba(200,168,233,0.3)',
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Logo size={36} animated={false} iconOnly />
                  </motion.div>
                </div>
              </div>
              <h2 className="mb-3 font-serif text-3xl italic text-luna-cream md:text-4xl">
                Luna is here.
              </h2>
              <p className="mx-auto max-w-md font-serif text-lg text-luna-whisper/70">
                What&apos;s on your mind today?
              </p>

              {/* Prompt suggestion chips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex flex-wrap justify-center gap-2 max-w-lg mx-auto"
              >
                {[
                  "I've been having hot flashes",
                  "I can't sleep well lately",
                  "My mood has been all over the place",
                  "I feel foggy and exhausted",
                  "Tell me about perimenopause",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-4 py-2 rounded-full text-sm text-luna-whisper/70 border border-luna-whisper/15 bg-white/[0.04] hover:bg-white/[0.08] hover:text-luna-cream hover:border-luna-whisper/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Message list */}
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const role = m.role === 'assistant' ? 'assistant' : 'user';
                const content = getMessageText(m);
                if (!content) return null;
                return (
                  <Message
                    key={m.id}
                    role={role}
                    content={content}
                    index={Math.max(0, i - initialMessageCount)}
                    animate={i >= initialMessageCount}
                  />
                );
              })}
            </AnimatePresence>

            {/* Typing indicator — show when streaming and last message is from user */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </div>

          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Input dock */}
      <div className="relative z-10 border-t border-luna-whisper/10 bg-luna-night/80 px-4 pb-24 pt-4 backdrop-blur-xl md:px-6 md:py-5">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={isLoading}
          />
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-luna-whisper/50">
            Luna remembers. Never prescribes. Always with you.
          </p>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} feature={upgradeFeature} />
      <CrisisModal open={crisis.open} onClose={crisis.close} message={crisis.message} />
    </div>
  );
}
