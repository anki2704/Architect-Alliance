import React, { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { messagesApi } from '../services/api';

interface EnquirySectionProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EnquirySection: React.FC<EnquirySectionProps> = ({ isOpen = true, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Lock body scroll when open as overlay
  useEffect(() => {
    if (isOpen && onClose) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSending(true);

    try {
      await messagesApi.create({
        name: name.trim(),
        email: email.trim(),
        contact: contact.trim() || undefined,
        subject: subject.trim(),
        message: message.trim()
      });

      setIsSent(true);
      setName('');
      setEmail('');
      setContact('');
      setSubject('');
      setMessage('');

      setTimeout(() => setIsSent(false), 5000);
    } catch (e) {
      console.error('Enquiry form error', e);
    } finally {
      setIsSending(false);
    }
  };

  const content = (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header + close */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="text-left max-w-2xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
            Get In Touch
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2">
            Let&apos;s Build Something Iconic
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Have an ambitious commercial, civic, or luxury residential project in mind? Reach out to start a conversation with our principal architects.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact form"
            className="shrink-0 w-10 h-10 rounded-full border border-[var(--text-primary)]/20 bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center justify-center hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent-warm)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--text-primary)]/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                Your Email *
              </label>
              <input
                type="email"
                required
                placeholder="eleanor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                Contact *
              </label>
              <input
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 XXXXX XXXXX"
                value={contact}
                onChange={(e) => {
                  // sirf digits, +, space, dash allow
                  const value = e.target.value.replace(/[^0-9+\-\s]/g, '');
                  setContact(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Project Inquiry / Feasibility Request"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                Message *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe project location, timeline, and aesthetic goals..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
              />
            </div>

            {isSent && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                Your message has been sent successfully! Our team will respond within 24 hours.
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              data-cursor="SEND"
              className="w-full py-4 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] font-bold text-xs font-mono uppercase tracking-widest hover:bg-[var(--accent-warm)] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending Inquiry...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Enquiry Details */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-[var(--text-primary)]/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 text-[var(--accent-warm)] flex items-center justify-center shrink-0 shadow-md border border-[var(--text-primary)]/10">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Design Studio</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                  FIRST FLOOR, KAVERY ROYAL MARKET, Swarna Jayanti Nagar|
                  <br />
                  Aligarh, Uttar Pradesh 202001|
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 text-[var(--accent-warm)] flex items-center justify-center shrink-0 shadow-md border border-[var(--text-primary)]/10">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Direct Email</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">architecturealliance.career@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 text-[var(--accent-warm)] flex items-center justify-center shrink-0 shadow-md border border-[var(--text-primary)]/10">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Phone Lines</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">+91 8130535793</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 text-[var(--accent-warm)] flex items-center justify-center shrink-0 shadow-md border border-[var(--text-primary)]/10">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Studio Hours</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Mon – Sat: 10:00 AM – 7:30 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // When used as overlay (onClose provided), render as modal
  if (onClose) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 top-[72px] sm:top-[80px] bottom-0 z-[70] overflow-y-auto"
              data-lenis-prevent
            >
              <div className="min-h-full flex items-start justify-center pb-10">
                <div
                  className="w-full max-w-5xl mx-3 sm:mx-6 mt-2 mb-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--text-primary)]/10 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {content}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Fallback: inline section (if ever used without onClose)
  return (
    <section id="enquiry" className="py-24 bg-[var(--bg-main)] text-[var(--text-primary)] border-t border-[var(--text-primary)]/10 relative">
      {content}
    </section>
  );
};