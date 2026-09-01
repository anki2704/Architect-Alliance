import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, Sliders } from 'lucide-react';

export const InteractiveTextScrubber: React.FC = () => {
  const [scrubValue, setScrubValue] = useState(50); // 0 to 100

  const statements = [
    { threshold: 0, text: "ARCHITECTURE IS THE LEARNED GAME OF FORMS ASSEMBLED IN LIGHT." },
    { threshold: 25, text: "UI/UX & MOTION DESIGN EMPHASIZES DETAILS USERS SHOULD PAY ATTENTION TO." },
    { threshold: 50, text: "SUSTAINABLE MATERIALS & KINETIC STRUCTURES CREATE ENDURING HARMONY." },
    { threshold: 75, text: "PASSIVE ILLUMINATION AND STRUCTURAL BEAUTY DEFINE MODERN LIVING." },
    { threshold: 100, text: "CRAFTING SPACES WHERE VISION MEETS PRECISION FOR GENERATIONS." }
  ];

  // Find active statement
  const currentStatement = [...statements].reverse().find(s => scrubValue >= s.threshold) || statements[0];

  return (
    <section className="py-20 bg-[var(--bg-surface)] border-y border-[var(--text-primary)]/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--text-primary)]/5 text-[var(--accent-warm)] text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Kinetic Motion Scrubber
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Motion Principles & Spatial Flow
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Drag the scrub timeline control below to interactively inspect our design philosophy and kinetic architectural principles.
          </p>
        </div>

        {/* Scrub Control Bar (Inspired by Video 1) */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="relative flex items-center h-12">
            {/* Base Horizontal Track */}
            <div className="w-full h-[2px] bg-[var(--text-primary)]/20 relative">
              <div
                className="h-full bg-[var(--accent-warm)] transition-all duration-75"
                style={{ width: `${scrubValue}%` }}
              />
            </div>

            {/* Interactive Drag Handle */}
            <input
              type="range"
              min="0"
              max="100"
              value={scrubValue}
              onChange={(e) => setScrubValue(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            />

            {/* Visual Scrub Indicator Dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-[var(--text-primary)] shadow-md flex items-center justify-center transition-transform pointer-events-none z-10"
              style={{ left: `calc(${scrubValue}% - 16px)` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-warm)]" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1">
            <span>0% · Concept</span>
            <span>50% · Harmony</span>
            <span>100% · Legacy</span>
          </div>
        </div>

        {/* Dynamic Display Text Box */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-8 sm:p-12 border border-[var(--text-primary)]/10 shadow-lg min-h-[200px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--text-primary)_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />

          <motion.div
            key={currentStatement.text}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-3xl"
          >
            <p className="font-serif-display text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)] font-bold leading-snug">
              "{currentStatement.text}"
            </p>
          </motion.div>

          <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-[var(--accent-warm)] uppercase tracking-widest relative z-10">
            <Sliders className="w-4 h-4" />
            <span>Interactive Timeline Index: {scrubValue}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
