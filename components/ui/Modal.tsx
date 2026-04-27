'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class, e.g. 'max-w-lg'. Defaults to 'max-w-lg' */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal. Defaults to true */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal. Defaults to true */
  closeOnEscape?: boolean;
  /** Accessible label for the dialog */
  ariaLabel?: string;
}

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  closeOnBackdrop = true,
  closeOnEscape = true,
  ariaLabel = 'Dialog',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
        return;
      }

      // Basic focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus the dialog on open
    setTimeout(() => dialogRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, closeOnEscape, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-luna-deep/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              tabIndex={-1}
              className={`
                relative w-full ${maxWidth}
                glass rounded-2xl shadow-2xl
                focus:outline-none
              `}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
