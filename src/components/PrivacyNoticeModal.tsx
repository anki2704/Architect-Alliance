import React from 'react';
import { X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPolicy?: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenFullPolicy,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-notice-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 top-[12%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[90] max-h-[75vh] overflow-y-auto rounded-3xl bg-[var(--bg-main)] border border-[var(--text-primary)]/10 shadow-2xl"
            data-lenis-prevent
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-warm)]/15 text-[var(--accent-warm)] flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3
                    id="privacy-notice-title"
                    className="font-serif-display text-xl font-medium text-[var(--text-primary)]"
                  >
                    Why we collect your information
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full border border-[var(--text-primary)]/15 flex items-center justify-center hover:bg-[var(--text-primary)]/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  When you submit this enquiry form, <strong className="text-[var(--text-primary)]">Architecture Alliance</strong> collects
                  the details you provide so we can respond to your project request.
                </p>

                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-[var(--text-primary)]">Name, email, phone</strong> — to contact you about your enquiry.
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">Subject & message</strong> — to understand your project needs and reply accurately.
                  </li>
                  <li>
                    Information is used <strong className="text-[var(--text-primary)]">only for communication and project follow-up</strong>, not sold to third parties.
                  </li>
                  <li>
                    Data is stored securely (database / email systems) and accessed only by authorised team members.
                  </li>
                  <li>
                    You may request access, correction, or deletion of your data by emailing{' '}
                    <span className="text-[var(--text-primary)]">architecturealliance.career@gmail.com</span>.
                  </li>
                </ul>

                <p className="text-xs text-[var(--text-muted)] border-t border-[var(--text-primary)]/10 pt-4">
                  By ticking the consent box on the form, you agree to this use of your information.
                  For full details, see our Privacy Policy.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {onOpenFullPolicy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullPolicy();
                    }}
                    className="flex-1 py-3 rounded-xl border border-[var(--text-primary)]/20 text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 cursor-pointer"
                  >
                    View full policy
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-warm)] cursor-pointer"
                >
                  I understand
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};