'use client';

import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UIMessage } from 'ai';
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
  const initialCount = useRef(initialMessages.length);
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
      <header className="relative z-10 flex items-center justify-center border-b border-luna-whisper/10 bg-luna-night/60 px-6 py-4 backdrop-blur-xl">
        <Logo size={30} animated={false} />
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
              className="mt-20 text-center"
            >
              <div className="mb-8 flex justify-center">
                <Logo size={64} animated={false} iconOnly />
              </div>
              <h2 className="mb-4 font-serif text-3xl italic text-luna-cream md:text-4xl">
                I&apos;m here.
              </h2>
              <p className="mx-auto max-w-md font-serif text-lg text-luna-whisper/70">
                How is the weather in your body today?
              </p>
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
                    index={Math.max(0, i - initialCount.current)}
                    animate={i >= initialCount.current}
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
      <div className="relative z-10 border-t border-luna-whisper/10 bg-luna-night/80 px-4 py-4 backdrop-blur-xl md:px-6 md:py-5">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={isLoading}
          />
          <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-luna-whisper/30">
            Luna remembers. Never prescribes. Always with you.
          </p>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} feature={upgradeFeature} />
      <CrisisModal open={crisis.open} onClose={crisis.close} message={crisis.message} />
    </div>
  );
}
