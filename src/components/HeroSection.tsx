import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, MapPin, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

const HERO_IMAGES = [
  {
    url: '/images/hero/image3.png',
    title: 'Signature Residence',
    location: 'Architecture Alliance',
    tag: 'Bespoke Residential'
  },
]

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  /*
  // Auto-advance the background photography
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);
  */

  // Responsive object-position:
  // Desktop → 75% center (exactly as you have now - perfect)
  // Mobile  → adjusted so architecture stays nicely in frame
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const setObjectPosition = () => {
      if (window.innerWidth < 768) {
        // Mobile portrait
        img.style.objectPosition = '58% 42%';
      } else if (window.innerWidth < 1024) {
        // Tablet
        img.style.objectPosition = '68% center';
      } else {
        // Desktop — keep your current perfect framing
        img.style.objectPosition = '75% center';
      }
    };

    setObjectPosition();
    window.addEventListener('resize', setObjectPosition);
    return () => window.removeEventListener('resize', setObjectPosition);
  }, []);

  // GSAP mouse-parallax — only desktop
  useEffect(() => {
    const section = sectionRef.current;
    const imageLayer = imageLayerRef.current;
    const contentLayer = contentLayerRef.current;
    const glow = glowRef.current;
    if (!section || !imageLayer || !contentLayer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth < 1024;

    if (prefersReducedMotion || isTouchDevice || isMobile) {
      gsap.set(imageLayer, { x: 0, y: 0, scale: 1 });
      gsap.set(contentLayer, { x: 0, y: 0 });
      return;
    }

    const xImage = gsap.quickTo(imageLayer, 'x', { duration: 1.4, ease: 'power3.out' });
    const yImage = gsap.quickTo(imageLayer, 'y', { duration: 1.4, ease: 'power3.out' });
    const scaleImage = gsap.quickTo(imageLayer, 'scale', { duration: 1.4, ease: 'power3.out' });

    const xContent = gsap.quickTo(contentLayer, 'x', { duration: 1, ease: 'power3.out' });
    const yContent = gsap.quickTo(contentLayer, 'y', { duration: 1, ease: 'power3.out' });

    const xGlow = glow ? gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power2.out' }) : null;
    const yGlow = glow ? gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power2.out' }) : null;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      xImage(px * -10);
      yImage(py * -6);
      scaleImage(1.02);

      xContent(px * 10);
      yContent(py * 6);

      if (xGlow && yGlow) {
        xGlow(e.clientX - rect.left);
        yGlow(e.clientY - rect.top);
      }
    };

    const handlePointerLeave = () => {
      xImage(0);
      yImage(0);
      scaleImage(1.00);
      xContent(0);
      yContent(0);
    };

    section.addEventListener('pointermove', handlePointerMove);
    section.addEventListener('pointerleave', handlePointerLeave);
    gsap.set(imageLayer, { scale: 1.00, x: 0, y: 0 });

    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const currentHero = HERO_IMAGES[activeImgIdx];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="sticky top-0 z-0 h-screen min-h-[720px] w-full overflow-hidden bg-[#F7F6F4] text-[var(--text-primary)]"
    >
      {/* Layer 1: Background Photography */}
      <div ref={imageLayerRef} className="absolute inset-0 will-change-transform">
        <img
          ref={imgRef}
          src={currentHero.url}
          alt={currentHero.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
          loading="eager"
          fetchPriority="high"
        />
        {/* Light overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Layer 2: Soft cursor glow (desktop only) */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06] blur-3xl bg-[var(--accent-amber)] hidden lg:block"
      />

      {/* Decorative fine grid */}
      <div className="absolute inset-0 pointer-events-none opacity-0" />

      {/* Layer 3: Foreground Content */}
      <div ref={contentLayerRef} className="relative z-10 h-full w-full will-change-transform">
        {/* Brand Logo */}
        <div className="absolute top-10 left-4 sm:top-5 sm:left-3 lg:left-6 z-20 flex items-right gap-3 sm:gap-4">
          <img
            src="/images/brand/logo-new.png"
            alt="Architecture Alliance"
            className="h-16 sm:h-20 md:h-[6.5rem] w-auto object-contain bg-transparent"
          />
        </div>

        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-28 pb-20 relative z-10">
          <div className="max-w-2xl">
            {/* Main Hero Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-7"
            >
              <h1 className="font-serif-display text-5xl sm:text-6xl xl:text-8xl font-extrabold tracking-tight leading-[1.02]">
                We Design 
                <br />
                <span className="italic text-[var(--accent-amber)]">That Inspire &amp; Elevate</span>
              </h1>
            </motion.div>

            {/* Subheading Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-[var(--text-primary)]/70 leading-relaxed max-w-lg font-normal"
            >
              {/* Architecture Alliance is a global architecture practice focused on design
              excellence, innovation, and creating meaningful spaces. */}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
