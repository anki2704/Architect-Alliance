import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PreloaderProps {
  onComplete: () => void;
}

const LOGO_SRC = '/images/brand/preloader.png';
const GRID = 4;
const SHUTTER_SLATS = 12; // more slats = smoother, premium feel

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'reveal' | 'hold' | 'shutter' | 'finished'>('reveal');

  const pieceOffsets = useMemo(() => {
    return Array.from({ length: GRID * GRID }, () => ({
      x: (Math.random() - 0.5) * 520,
      y: (Math.random() - 0.5) * 520,
      rotate: (Math.random() - 0.5) * 220,
      scale: 0.35 + Math.random() * 0.4,
    }));
  }, []);

  useEffect(() => {
    // 1. Logo assemble finishes
    const holdTimer = setTimeout(() => setPhase('hold'), 2000);

    // 2. Short elegant hold on the assembled logo
    const shutterTimer = setTimeout(() => setPhase('shutter'), 2600);

    // 3. Shutter finishes → unmount + call onComplete
    const finishTimer = setTimeout(() => {
      setPhase('finished');
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(shutterTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'finished' && (
        <motion.div
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: phase === 'shutter' ? 'transparent' : '#FAF8F5',
          }}
        >
          {/* ─── Logo Assemble Phase ─── */}
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'hold') && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center overflow-hidden bg-white"
                initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                animate={{ clipPath: 'circle(150% at 50% 50%)' }}
                exit={{
                  opacity: 0,
                  scale: 1.04,
                  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                }}
                transition={{ duration: 1.5, ease: [0.5, 0, 0.15, 1] }}
              >
                <div
                  className="relative"
                  style={{
                    width: 'clamp(180px, 32vw, 280px)',
                    height: 'clamp(180px, 32vw, 280px)',
                  }}
                >
                  {Array.from({ length: GRID * GRID }).map((_, i) => {
                    const row = Math.floor(i / GRID);
                    const col = i % GRID;
                    const offset = pieceOffsets[i];
                    const posX = (col / (GRID - 1)) * 100;
                    const posY = (row / (GRID - 1)) * 100;

                    return (
                      <motion.div
                        key={i}
                        className="absolute overflow-hidden"
                        style={{
                          width: `${100 / GRID}%`,
                          height: `${100 / GRID}%`,
                          top: `${(row * 100) / GRID}%`,
                          left: `${(col * 100) / GRID}%`,
                          backgroundImage: `url(${LOGO_SRC})`,
                          backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
                          backgroundPosition: `${posX}% ${posY}%`,
                          backgroundRepeat: 'no-repeat',
                        }}
                        initial={{
                          x: offset.x,
                          y: offset.y,
                          rotate: offset.rotate,
                          scale: offset.scale,
                          opacity: 0,
                        }}
                        animate={{
                          x: 0,
                          y: 0,
                          rotate: 0,
                          scale: 1,
                          opacity: 1,
                        }}
                        transition={{
                          delay: 0.15 + i * 0.035,
                          duration: 0.85,
                          type: 'spring',
                          stiffness: 90,
                          damping: 14,
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Premium Center-Out Shutter ─── */}
          {phase === 'shutter' && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              {Array.from({ length: SHUTTER_SLATS }).map((_, i) => {
                const mid = (SHUTTER_SLATS - 1) / 2;
                const distanceFromCenter = Math.abs(i - mid);
                const direction = i < mid ? -1 : 1; // top half goes up, bottom half goes down

                // Center opens first → cascade outward (cinematic)
                const delay = distanceFromCenter * 0.055;

                return (
                  <motion.div
                    key={i}
                    className="absolute left-0 w-full origin-center"
                    style={{
                      height: `calc(100% / ${SHUTTER_SLATS} + 3px)`,
                      top: `calc(${i} * 100% / ${SHUTTER_SLATS})`,
                      backgroundColor: '#FAF8F5',
                      boxShadow:
                        '0 1px 0 rgba(0,0,0,0.06), inset 0 -1px 0 rgba(255,255,255,0.4)',
                    }}
                    initial={{
                      y: 0,
                      scaleY: 1,
                      opacity: 1,
                    }}
                    animate={{
                      y: `${direction * 105}vh`,
                      scaleY: 0.55,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.95,
                      delay,
                      ease: [0.76, 0, 0.24, 1], // strong cinematic ease
                    }}
                  />
                );
              })}

              {/* Subtle vignette that fades out while opening (adds depth) */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0.22 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{
                  background:
                    'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.2) 100%)',
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
