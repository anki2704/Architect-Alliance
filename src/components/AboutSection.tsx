import React from 'react';
import { Award, X } from 'lucide-react';

interface AboutSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      num: '01',
      title: 'Expert Local Guidance & Zoning',
      desc: 'Deep regulatory knowledge, site feasibility analysis, and urban planning expertise ensures smooth approval cycles.'
    },
    {
      num: '02',
      title: 'Wide Property & Spatial Portfolio',
      desc: 'From custom residential villas and high-density towers to biophilic interior transformations and civic landmarks.'
    },
    {
      num: '03',
      title: 'Transparent Construction Process',
      desc: 'Real-time BIM 5D cost tracking, 3D floorplan updates, and fixed milestone guarantees eliminate surprises.'
    },
    {
      num: '04',
      title: 'Dedicated Client Support',
      desc: 'Direct access to lead partners and 3D architectural visualizers at every step from conception to handover.'
    }
  ];

  React.useEffect(() => {
    if (isOpen && (window as any).lenis) {
      (window as any).lenis.stop();
    }
    return () => {
      if (isOpen && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[var(--bg-main)]/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-4xl max-h-[90vh] relative flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--text-primary)]/15 shadow-2xl overflow-hidden text-[var(--text-on-accent)]">
        <button
          onClick={onClose}
          aria-label="Close about"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[var(--bg-card)]/10 text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center cursor-pointer shadow-md border border-[var(--text-primary)]/20 transition-all"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] p-6 sm:p-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
              Why Partner With Us
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl font-extrabold text-[var(--text-on-accent)] mb-3">
              Why choose us for all your real estate & architectural needs.
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              We merge luxury aesthetic mastery with zero-carbon engineering and seamless client communication to craft living works of art.
            </p>
          </div>

          {/* Excellence Stat */}
          <div className="flex items-center gap-4 max-w-md mx-auto mb-8 bg-[var(--bg-card)]/5 backdrop-blur-sm border border-[var(--text-primary)]/10 rounded-2xl p-4">
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-warm)] text-[var(--text-on-accent)] flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <Award className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-on-accent)]">15+ Years Excellence</h4>
              <p className="text-xs text-[var(--text-muted)]">Over 120+ Award-Winning Projects</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((item) => (
              <div
                key={item.num}
                className="p-5 rounded-2xl border border-[var(--text-primary)]/10 hover:border-[var(--accent-warm)] transition-all duration-300 flex items-start gap-4 shadow-sm hover:shadow-lg bg-[var(--bg-card)]/5 backdrop-blur-sm"
              >
                <div className="text-lg font-mono font-bold text-[var(--accent-warm)] shrink-0 bg-[var(--accent-warm)]/15 px-2.5 py-1 rounded-xl border border-[var(--accent-warm)]/20">
                  {item.num}
                </div>
                <div>
                  <h3 className="font-serif-display text-base font-bold text-[var(--text-on-accent)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
