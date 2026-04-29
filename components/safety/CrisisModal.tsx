'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, MessageSquare, Phone, X } from 'lucide-react';

interface CrisisModalProps {
  open: boolean;
  level?: 'yellow' | 'amber' | 'red';
  message?: string;
  onClose: () => void;
}

const RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text, 24/7, United States',
    action: 'tel:988',
    icon: Phone,
    primary: true,
  },
  {
    name: 'Crisis Text Line',
    detail: 'Text HOME to 741741, 24/7',
    action: 'sms:741741&body=HOME',
    icon: MessageSquare,
  },
  {
    name: 'Samaritans',
    detail: '116 123, UK & Ireland',
    action: 'tel:116123',
    icon: Phone,
  },
  {
    name: 'Lifeline Australia',
    detail: '13 11 14, 24/7',
    action: 'tel:131114',
    icon: Phone,
  },
  {
    name: 'International crisis lines',
    detail: 'Find a crisis line in your country',
    action: 'https://www.iasp.info/resources/Crisis_Centres/',
    icon: ExternalLink,
  },
];

export default function CrisisModal({
  open,
  level = 'red',
  message,
  onClose,
}: CrisisModalProps) {
  const isEmergency = level === 'red';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-luna-ink/85 px-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-luna-night p-6 text-luna-cream shadow-2xl"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-luna-aurora-pink/10 blur-2xl" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-luna-whisper/50 transition-colors hover:bg-white/5 hover:text-luna-cream"
              aria-label="Close crisis resources"
            >
              <X size={18} />
            </button>

            <div className="relative">
              <p className="text-xs uppercase tracking-[0.14em] text-luna-aurora-pink/80">
                {isEmergency ? 'You are not alone' : 'Gentle support'}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-luna-cream">
                Please reach someone who can be with you.
              </h2>

              {message && (
                <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-luna-whisper/75">
                  {message}
                </p>
              )}

              <div className="mt-6 grid gap-3">
                {RESOURCES.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={resource.name}
                      href={resource.action}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                        resource.primary
                          ? 'border-luna-aurora-pink/40 bg-luna-aurora-pink/10 hover:bg-luna-aurora-pink/15'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-luna-cream">
                          {resource.name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-luna-whisper/50">
                          {resource.detail}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>

              <p className="mt-5 text-xs leading-5 text-luna-whisper/45">
                Luna is a companion, not a clinician. For emergencies, call your local
                emergency number.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-full border border-white/15 px-5 py-3 text-sm text-luna-whisper/80 transition-colors hover:border-white/30 hover:text-luna-cream"
              >
                I&apos;m safe for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
