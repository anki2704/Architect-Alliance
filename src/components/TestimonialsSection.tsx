import React, { useEffect, useState } from 'react';
import { Testimonial } from '../types';
import { testimonialsApi } from '../services/api';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquarePlus, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Client&background=C97B4E&color=fff&size=128';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Feedback form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const loadTestimonials = () => {
    testimonialsApi
      .list()
      .then((data) => {
        if (Array.isArray(data)) setTestimonials(data);
      })
      .catch((err) => console.error('Failed to load testimonials', err));
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    setIsSending(true);
    setError('');

    try {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name.trim()
      )}&background=C97B4E&color=fff&size=128`;

      const created = await testimonialsApi.create({
        name: name.trim(),
        role: role.trim() || 'Client',
        quote: quote.trim(),
        rating,
        avatar: avatarUrl || DEFAULT_AVATAR,
      });

      setTestimonials((prev) => [created, ...prev]);
      setCurrentIndex(0);
      setIsSent(true);
      setName('');
      setRole('');
      setQuote('');
      setRating(5);

      setTimeout(() => {
        setIsSent(false);
      }, 2500);
    } catch (err) {
      console.error('Feedback submit error', err);
      setError('Could not submit feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const item = testimonials.length > 0 ? testimonials[currentIndex] : null;

  return (
    <section
      id="testimonials"
      className="py-28 bg-[#f4f4f1] text-[var(--text-primary)] relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">
            Client Feedback
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)]">
            What Our Clients Say
          </h2>
        </div>

        {/* ===== TWO COLUMN LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT → Testimonials Carousel */}
          <div className="h-full">
            {item ? (
              <div
                data-cursor="QUOTE"
                className="glass-card rounded-3xl p-8 sm:p-10 relative shadow-xl border border-[var(--text-primary)]/10 h-full flex flex-col"
              >
                <Quote className="w-10 h-10 text-[var(--text-primary)]/10 absolute top-5 left-5" />

                <div className="flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="flex items-center justify-center gap-1 text-[var(--accent-amber)] mb-5">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>

                      <p className="font-serif-display text-lg sm:text-xl text-[var(--text-primary)] font-bold italic leading-relaxed mb-7">
                        "{item.quote}"
                      </p>

                      <div className="flex items-center justify-center gap-4">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[var(--accent-warm)]/30 shadow-md"
                        />
                        <div className="text-left">
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">{item.name}</h4>
                          <p className="text-xs text-[var(--text-secondary)]">{item.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {testimonials.length > 1 && (
                  <div className="flex items-center justify-between absolute inset-x-2 sm:-inset-x-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <button
                      onClick={prev}
                      data-cursor="PREV"
                      className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center shadow-lg transition-all pointer-events-auto cursor-pointer"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      data-cursor="NEXT"
                      className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center shadow-lg transition-all pointer-events-auto cursor-pointer"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Dots inside the card */}
                {testimonials.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          currentIndex === idx
                            ? 'w-8 bg-[var(--accent-warm)]'
                            : 'w-2 bg-[var(--text-primary)]/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 text-center text-[var(--text-secondary)] h-full flex items-center justify-center">
                No testimonials yet. Be the first to share!
              </div>
            )}
          </div>

          {/* RIGHT → Feedback Form (always visible) */}
          <div className="h-full">
            <div className="glass-card rounded-3xl p-7 sm:p-8 shadow-xl border border-[var(--text-primary)]/10 text-left h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquarePlus className="w-5 h-5 text-[var(--accent-warm)]" />
                <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                  Share Your Experience
                </h3>
              </div>

              {isSent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[var(--accent-warm)]" />
                  <p className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                    Thank you for your feedback!
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Your review has been added.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Star rating */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                          aria-label={`${star} star`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'fill-[var(--accent-amber)] text-[var(--accent-amber)]'
                                : 'text-[var(--text-primary)]/20'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      Role / Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Homeowner, CEO at Acme Corp"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      Your Feedback *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your experience working with us..."
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSending || !name.trim() || !quote.trim()}
                    data-cursor="SUBMIT"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-warm)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isSending ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
