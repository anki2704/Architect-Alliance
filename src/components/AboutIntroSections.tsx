import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

// Unsplash (loads for sure). Local: '/images/hero/image2.png'
const HERO_IMAGE =
  '/images/team/about_section.png';
const HERO_FALLBACK = '/images/team/about_section.png';

const APPROACH_POINTS = [
  'Understanding the context and character of each place.',
  'Balancing creative vision with functionality and purpose.',
  'Considering the people who will experience the finished space.',
  'Maintaining quality and workmanship from concept through execution.',
] as const;

const LANGUAGE_CARDS = [
  'CLEAN FORMS',
  'NATURAL LIGHT',
  'HONEST MATERIALS',
  'BALANCED PROPORTIONS',
  'THOUGHTFUL DETAILING',
] as const;

const TIMELINE_STEPS = [
  'CONCEPT',
  'DRAWINGS',
  'MATERIAL SELECTION',
  'COORDINATION',
  'EXECUTION',
] as const;

/**
 * About intro sections — same content as architecture-alliance-about-final-fixed.html.
 * Built with project patterns: Tailwind + motion/react (no raw CSS dump).
 */
export const AboutIntroSections: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Scroll reveal — same as original HTML IntersectionObserver
  useEffect(() => {
    const wrap = imageWrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }

    let done = false;
    const open = () => {
      if (done) return;
      done = true;
      // Double rAF so browser paints "closed" first, then transitions to open
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setRevealed(true));
      });
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) open();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    obs.observe(wrap);

    // Safety: if still closed after 4s (Lenis / edge cases), open anyway
    const safety = window.setTimeout(open, 4000);

    return () => {
      obs.disconnect();
      window.clearTimeout(safety);
    };
  }, [prefersReducedMotion]);

  // Parallax after reveal (exact original values)
  useEffect(() => {
    if (prefersReducedMotion || !revealed) return;
    const image = imageRef.current;
    if (!image) return;

    // Wait for CSS scale transition to finish (~1.8s)
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    let rafId = 0;
    let active = false;
    const startTimer = window.setTimeout(() => {
      active = true;
    }, 1900);

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) * 6;
    };

    const frame = () => {
      if (active && window.innerWidth > 800) {
        cx += (tx - cx) * 0.045;
        cy += (ty - cy) * 0.045;
        if (hovered) {
          image.style.transform = `scale(1.055) translate(${cx}px, calc(${cy}px - 1.5%))`;
        } else {
          image.style.transform = `scale(1.035) translate(${cx}px, ${cy}px)`;
        }
      }
      rafId = requestAnimationFrame(frame);
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(frame);

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion, revealed, hovered]);

  const fade = (delay = 0, y = 28) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const fadeScale = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, scale: 0.96 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true, margin: '-40px' },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <div id="about" className="bg-[#f3f3f0] text-[#080808]">
      {/* ========== HERO ========== */}
      {/* Extra top padding so content clears fixed navbar */}
      <section className="min-h-screen flex flex-col justify-between px-[6vw] pt-28 sm:pt-32 lg:pt-36 pb-[7vw]">
        <motion.div
          {...fade(0, 20)}
          //className="flex justify-between items-center gap-6 border-t border-[#ccc] pt-5"
        >
          <span className="text-[20px] font-bold tracking-[0.2em] uppercase shrink-0 border-b border-[#080808] pb-1">
            ABOUT US
          </span>
          {/*<span className="text-[10px] font-bold tracking-[0.2em] uppercase shrink-0">
            EST. 2020
          </span>*/}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-[7vw] items-end mt-16 lg:mt-8">
          <motion.h1
            {...fade(0.08, 50)}
            className="text-[clamp(58px,8vw,125px)] font-extrabold leading-[0.8] tracking-[-0.075em] m-0"
          >
            WE DESIGN
            <br />
            SPACES
            <br />
            WITH
            <br />
            CHARACTER.
          </motion.h1>

          <motion.div {...fade(0.15, 30)}>
            <p className="text-[20px] leading-[1.35] tracking-[-0.02em] m-0 mb-7">
              Architecture Alliance, established in 2020, is a multidisciplinary practice working
              across architecture, interior design, construction consultancy, planning, detailing,
              and project execution.
            </p>
            <p className="text-sm leading-[1.7] text-[#555] max-w-[520px] m-0">
              Our philosophy is simple: good design should be thoughtful, functional, distinctive,
              and enduring.
            </p>
          </motion.div>
        </div>

        {/* Image: left→right wipe on scroll (CSS transition = reliable) */}
        <div
          ref={imageWrapRef}
          className="mt-[8vh] h-[45vh] min-h-[280px] lg:h-[55vh] lg:min-h-[360px] overflow-hidden bg-[#e5e5e5]"
          style={{
            clipPath: revealed ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
            transition: prefersReducedMotion
              ? 'none'
              : 'clip-path 1.25s cubic-bezier(0.77, 0, 0.18, 1)',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            ref={imageRef}
            src={HERO_IMAGE}
            alt="Architecture Alliance"
            className="w-full h-full object-cover block will-change-transform"
            style={{
              transform: revealed ? 'scale(1)' : 'scale(1.13)',
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 1.8s cubic-bezier(0.2, 0.7, 0.2, 1)',
            }}
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src !== HERO_FALLBACK) el.src = HERO_FALLBACK;
            }}
            loading="eager"
          />
        </div>
      </section>

      {/* ========== 01 PHILOSOPHY ========== */}
      <section className="min-h-[80vh] flex items-center px-[6vw] py-[7vw]">
        <div className="max-w-[1100px]">
          <motion.div
            {...fade(0)}
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
          >
            01 — OUR PHILOSOPHY
          </motion.div>
          <motion.p
            {...fade(0.08, 40)}
            className="text-[clamp(42px,6vw,92px)] font-extrabold leading-[0.9] tracking-[-0.065em] my-6"
          >
            GOOD DESIGN SHOULD BE
            <br />
            THOUGHTFUL, FUNCTIONAL,
            <br />
            DISTINCTIVE, AND ENDURING.
          </motion.p>
          <motion.p
            {...fade(0.15)}
            className="text-sm leading-[1.7] text-[#555] max-w-[520px] m-0"
          >
            Led by a founder with an artistic eye and strong understanding of materials,
            proportions, functionality, and workmanship, we approach every project by understanding
            its context, purpose, and the people who will experience it.
          </motion.p>
        </div>
      </section>

      {/* ========== 02 APPROACH ========== */}
      <section className="bg-[#080808] text-white px-[6vw] py-[7vw] pb-16 lg:pb-[7vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-[8vw]">
          <div>
            <motion.div
              {...fade(0)}
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80"
            >
              02 — OUR APPROACH
            </motion.div>
            <motion.h2
              {...fade(0.08, 40)}
              className="text-[clamp(45px,6vw,80px)] font-extrabold leading-[0.85] tracking-[-0.06em] mt-6 mb-0"
            >
              DESIGN
              <br />
              WITH
              <br />
              INTENT.
            </motion.h2>
          </div>

          <div>
            <motion.p
              {...fade(0.1)}
              className="text-[17px] leading-[1.65] text-[#c9c9c9] max-w-[650px] m-0"
            >
              Our design process begins by understanding the context, purpose, and people behind
              every project.
            </motion.p>

            <div className="mt-14 border-t border-[#333]">
              {APPROACH_POINTS.map((text, i) => (
                <motion.div
                  key={i}
                  {...fade(0.12 + i * 0.06)}
                  className="grid grid-cols-[70px_1fr] border-b border-[#333] py-6 hover:bg-[#111] hover:pl-2.5 transition-all duration-300"
                >
                  <b className="text-[13px] font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </b>
                  <p className="m-0 text-[#bbb] leading-normal">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 03 DESIGN LANGUAGE ========== */}
      <section className="px-[6vw] py-[7vw]">
        <motion.div
          {...fade(0)}
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
        >
          03 — DESIGN LANGUAGE
        </motion.div>
        <motion.h2
          {...fade(0.08, 40)}
          className="text-[clamp(45px,6vw,80px)] font-extrabold leading-[0.85] tracking-[-0.06em] mt-6 mb-12 lg:mb-16"
        >
          QUIET. CLEAR.
          <br />
          TIMELESS.
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-5 border-t border-[#ccc]">
          {LANGUAGE_CARDS.map((title, i) => (
            <motion.div
              key={title}
              {...fade(0.1 + i * 0.06)}
              className="min-h-[150px] p-5 border-r border-b border-[#ccc] last:border-r-0 lg:border-b-0 hover:bg-[#e9e9e5] hover:pl-3 transition-all duration-300"
            >
              <small className="text-[#888] text-xs">
                {String(i + 1).padStart(2, '0')}
              </small>
              <h3 className="text-sm font-bold mt-10 m-0 tracking-tight">{title}</h3>
            </motion.div>
          ))}
        </div>

        <motion.p
          {...fade(0.25)}
          className="text-sm leading-[1.7] text-[#555] max-w-[520px] mt-10 m-0"
        >
          We believe every project should have its own identity rather than simply follow trends.
        </motion.p>
      </section>

      {/* ========== 04 EXECUTION ========== */}
      <section className="px-[6vw] py-[7vw]">
        <motion.div
          {...fade(0)}
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
        >
          04 — FROM CONCEPT TO EXECUTION
        </motion.div>
        <motion.h2
          {...fade(0.08, 40)}
          className="text-[clamp(45px,6vw,80px)] font-extrabold leading-[0.85] tracking-[-0.06em] mt-6 mb-12 lg:mb-16"
        >
          ONE IDEA.
          <br />
          CAREFULLY CARRIED THROUGH.
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-b border-[#ccc]">
          {TIMELINE_STEPS.map((label, i) => (
            <motion.div
              key={label}
              {...fade(0.1 + i * 0.06)}
              className="relative py-[22px] pr-2.5 pb-7 border-b border-[#ccc] last:border-b-0 lg:border-b-0 hover:bg-[#e9e9e5] hover:pl-3 transition-all duration-300"
            >
              <strong className="block text-xs mb-8 font-bold">
                {String(i + 1).padStart(2, '0')}
              </strong>
              <span className="text-sm font-bold">{label}</span>
              {i < TIMELINE_STEPS.length - 1 && (
                <span className="hidden lg:block absolute right-3 top-[22px] text-[#999]">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          {...fade(0.3)}
          className="text-sm leading-[1.7] text-[#555] max-w-[520px] mt-11 m-0"
        >
          From concept and drawings to material selection, coordination, and execution, we maintain
          a strong focus on quality and workmanship, ensuring that design intent is carried through
          to the finished space.
        </motion.p>
      </section>

      {/* ========== FINAL ========== */}
      <section className="min-h-[85vh] bg-[#111] text-white flex items-center justify-center text-center px-[6vw] py-[7vw]">
        <div>
          <motion.div
            {...fade(0)}
            className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70"
          >
            ARCHITECTURE ALLIANCE
          </motion.div>
          <motion.h2
            {...fadeScale(0.1)}
            className="text-[clamp(55px,8vw,120px)] font-extrabold leading-[0.8] tracking-[-0.075em] m-0 mt-4"
          >
            CLARITY.
            <br />
            CHARACTER.
            <br />
            PURPOSE.
          </motion.h2>
          <motion.p
            {...fade(0.25)}
            className="max-w-[520px] text-[#bbb] leading-relaxed mx-auto mt-9"
          >
            Our aim is to create environments that are refined, practical, timeless, and built to
            last.
          </motion.p>
          <motion.div
            {...fade(0.35)}
            className="text-xs tracking-[0.2em] font-bold mt-8 text-white/80"
          >
            DESIGNING SPACES WITH CLARITY, CHARACTER, AND PURPOSE.
          </motion.div>
        </div>
      </section>
    </div>
  );
};
