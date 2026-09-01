import React, { useState } from 'react';
import { Calendar, MessageSquare, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Booking } from '../types';
import { bookingsApi, ApiError } from '../services/api';

interface BookingSectionProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProject?: string;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  isOpen,
  onClose,
  preselectedProject,
  onBookingSuccess
}) => {
  const [mode, setMode] = useState<'slot' | 'request'>('slot');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customTiming, setCustomTiming] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState(preselectedProject ? `Consultation: ${preselectedProject}` : 'Architectural Design');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const ALL_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  React.useEffect(() => {
    if (isOpen) {
      setProjectType(preselectedProject ? `Consultation: ${preselectedProject}` : 'Architectural Design');
      if ((window as any).lenis) (window as any).lenis.stop();
    }
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen, preselectedProject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    if (mode === 'slot' && !selectedSlot) {
      setErrorMsg('Please select a preferred time slot or switch to custom timing request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        projectType,
        date: mode === 'slot' ? selectedDate : (customTiming || 'Flexible'),
        time: mode === 'slot' ? (selectedSlot || '') : 'To be confirmed',
        notes: notes.trim(),
        paymentAmount: 0
      };

      const newBooking = await bookingsApi.create(payload);
      setCreatedBooking(newBooking);
      setIsConfirmed(true);
      onBookingSuccess(newBooking);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-[var(--overlay)] backdrop-blur-md"
    >
      <div className="w-full max-w-5xl relative flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center cursor-pointer shadow-lg border border-[var(--text-primary)]/15 transition-all"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {!isConfirmed ? (
          <div className="rounded-2xl bg-[var(--bg-card)]/95 border border-[var(--text-primary)]/15 shadow-2xl p-4 sm:p-5">
            {/* Compact Header */}
            <div className="text-center mb-3">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent-warm)] mb-0.5">
                Appointment Scheduling
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                Book a Design Consultation
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Name, Email, Phone, Project */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Project Typology
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15 focus:outline-none focus:border-[var(--accent-warm)] cursor-pointer"
                  >
                    <option value="Architectural Design">Architectural Design</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Urban Master Planning">Urban Master Planning</option>
                    <option value="Sustainable Design">Sustainable Design</option>
                    <option value="General Feasibility Consultation">General Feasibility Consultation</option>
                  </select>
                </div>
              </div>

              {/* Scheduling Mode */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  How to proceed?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('slot')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      mode === 'slot'
                        ? 'border-[var(--accent-warm)] bg-[var(--accent-warm)]/10 shadow-sm'
                        : 'border-[var(--text-primary)]/15 bg-[var(--bg-card)] hover:border-[var(--text-primary)]/30'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[var(--accent-warm)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold text-[var(--text-primary)]">Date & time slot</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Pick from calendar</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('request')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      mode === 'request'
                        ? 'border-[var(--accent-warm)] bg-[var(--accent-warm)]/10 shadow-sm'
                        : 'border-[var(--text-primary)]/15 bg-[var(--bg-card)] hover:border-[var(--text-primary)]/30'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-[var(--accent-warm)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold text-[var(--text-primary)]">Custom timing</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Request availability</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Row 3: Slots or custom timing */}
              {mode === 'slot' ? (
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="shrink-0">
                    <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] mb-1">Preferred Date</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] mb-1">Available Time Slots</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {ALL_SLOTS.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 px-1 rounded-md text-[10px] font-mono font-semibold text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--text-primary)] text-[var(--text-on-accent)] font-bold shadow-md'
                                : 'bg-[var(--bg-card)] border border-[var(--text-primary)]/15 text-[var(--text-secondary)] hover:border-[var(--accent-warm)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/10">
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] mb-1">
                    Preferred Date / Timing Window
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sometime next week, weekday mornings or Friday afternoon"
                    value={customTiming}
                    onChange={(e) => setCustomTiming(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                </div>
              )}

              {/* Notes - single line height */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  Project vision / notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Budget, location, aesthetic preferences, site constraints..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--text-primary)]/15 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-500/100/10 border border-red-500/30 text-red-700 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] font-mono font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--accent-warm)] transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Processing Booking...' : 'Submit Consultation Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl p-8 border border-[var(--text-primary)]/15 shadow-2xl text-center max-w-xl mx-auto bg-[var(--bg-card)]">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-warm)]/10 text-[var(--accent-warm)] border border-[var(--accent-warm)]/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Consultation Confirmed
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              Thank you, <strong className="text-[var(--text-primary)]">{name}</strong>. Your consultation request for{' '}
              <strong className="text-[var(--accent-warm)]">{projectType}</strong> has been logged successfully!
            </p>
            <div className="bg-[var(--bg-main)] p-4 rounded-xl text-xs text-left space-y-1.5 mb-6 border border-[var(--text-primary)]/10 font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Booking ID:</span>
                <span className="font-bold text-[var(--text-primary)]">{createdBooking?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Scheduled Time:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {createdBooking?.date} {createdBooking?.time}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setIsConfirmed(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-warm)] transition-all cursor-pointer shadow-md"
              >
                Book Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-[var(--text-primary)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--text-primary)]/5 transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
