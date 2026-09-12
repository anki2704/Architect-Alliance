import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  /**
   * Home page ka "second page" — jo bhi section yahan pass karoge (Projects,
   * ya future me koi aur section), wo neeche diye gaye reveal wrapper me
   * daala jayega aur scroll par sticky Hero ke upar "curtain" ki tarah
   * slide-up hoga.
   */
  children?: React.ReactNode;
}

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=92',
    title: 'Quiet Luxury',
    location: 'Architecture Alliance',
    tag: 'Architecture / Residential',
  },
  {
    url: 'https://images.unsplash.com/photo-1775112862850-02b1f72edcb1?auto=format&fit=crop&fm=jpg&q=92&w=2400',
    title: 'Form & Texture',
    location: 'Architecture Alliance',
    tag: 'Interior / Contemporary',
  },
  {
    url: 'https://images.unsplash.com/photo-1774516534068-77422d9226e6?auto=format&fit=crop&fm=jpg&q=92&w=2400',
    title: 'Designed to Feel',
    location: 'Architecture Alliance',
    tag: 'Hospitality / Design',
  },
  {
    url: 'https://images.unsplash.com/photo-1774267916884-afae166d49b3?auto=format&fit=crop&fm=jpg&q=92&w=2400',
    title: 'Living in Form',
    location: 'Architecture Alliance',
    tag: 'Residential / Modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=92',
    title: 'Less but Better',
    location: 'Architecture Alliance',
    tag: 'Material / Detail',
  },
  {
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=92&sat=-15',
    title: 'Light in Space',
    location: 'Architecture Alliance',
    tag: 'Architecture / Space',
  },
  {
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=92',
    title: 'Details Matter',
    location: 'Architecture Alliance',
    tag: 'Interiors / Craft',
  },
  {
    url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2400&q=92',
    title: 'Built with Intent',
    location: 'Architecture Alliance',
    tag: 'Studio / Portfolio',
  },
];

const INTERVAL_MS = 5500;

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, children }) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-advance background images
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback((i: number) => {
    setActiveImgIdx(i);
  }, []);

  const currentHero = HERO_IMAGES[activeImgIdx];

  return (
    <>
      <section
        ref={sectionRef}
        id="home"
        className="sticky top-0 z-0 h-dvh min-h-[480px] lg:min-h-[720px] w-full overflow-hidden bg-[#111] text-white"
      >
        {/* Layer 1: Background Photography — auto slider */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: i === activeImgIdx ? 1 : 0,
                transform: i === activeImgIdx ? 'scale(1)' : 'scale(1.045)',
                transition:
                  i === activeImgIdx
                    ? 'opacity 1.15s ease, transform 6s cubic-bezier(0.2, 0.7, 0.2, 1)'
                    : 'opacity 1.15s ease, transform 1.15s ease',
                zIndex: i === activeImgIdx ? 1 : 0,
                pointerEvents: 'none',
              }}
            >
              <img
                src={img.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[72%_center] lg:object-[75%_center]"
                style={{ imageRendering: 'auto' }}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}

          {/* Light overlay */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background: `
                linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.18) 58%, rgba(0,0,0,0.06)),
                linear-gradient(0deg, rgba(0,0,0,0.35), transparent 55%)
              `,
            }}
          />
        </div>

        {/* Layer 2: Foreground Content */}
        <div className="relative z-10 h-full w-full">
          {/* Brand Logo — original position */}
          <div className="absolute top-10 left-4 sm:top-5 sm:left-3 lg:left-6 z-20 flex items-center gap-3 sm:gap-4">
            <img
              src="/images/brand/logo-new.png"
              alt="Architecture Alliance"
              className="h-16 sm:h-20 md:h-[6.5rem] w-auto object-contain bg-transparent"
              draggable={false}
            />
          </div>

          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-28 pb-20 relative z-10">
            <div className="max-w-2xl">
              {/* Main Hero Headline — original text kept */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="mt-7"
              >
                {/*<h1 className="font-serif-display text-5xl sm:text-6xl xl:text-8xl font-extrabold tracking-tight leading-[1.02] text-white">
                  We Design
                  <br />
                  <span className="italic text-[var(--accent-amber)]">That Inspire &amp; Elevate</span>
                </h1>*/}
              </motion.div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-lg font-normal"
              >
                {/* Optional subtext — kept empty like original */}
              </motion.p>
            </div>
          </div>

          {/* Slide dots — subtle, bottom area */}
          <div
            className="absolute z-20 flex items-center gap-2"
            style={{ right: '1.5rem', bottom: '1.5rem' }}
          >
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className="rounded-full border border-white/80 transition-colors cursor-pointer"
                style={{
                  width: 7,
                  height: 7,
                  padding: 0,
                  background: i === activeImgIdx ? '#fff' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reveal wrapper: second page slides up over sticky hero */}
      {children && (
        <div className="relative z-10 bg-[var(--bg-main)]">
          {children}
        </div>
      )}
    </>
  );
};
