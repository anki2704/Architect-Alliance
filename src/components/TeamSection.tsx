import React, { useEffect, useState } from 'react';
import { TeamMember } from '../types';
import { teamApi } from '../services/api';
import { Instagram, Twitter, MessageCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Founder / Personal Note (light)                                           */
/* -------------------------------------------------------------------------- */
type FounderNoteProps = {
  image: string;
  title?: string;
  paragraphs: [string, string];
  quote: string;
  name: string;
  imageOnRight?: boolean;
};

const FounderNote: React.FC<FounderNoteProps> = ({
  image,
  title = 'PERSONAL NOTE FROM OUR FOUNDER',
  paragraphs,
  quote,
  name,
  imageOnRight = false,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: EASE },
        };

  return (
    <section className="relative bg-[#f5f5f5] text-black py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col ${
            imageOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
          } gap-10 lg:gap-14 xl:gap-20 items-center`}
        >
          {/* Portrait */}
          <motion.div {...fade(0)} className="w-full lg:w-[42%] xl:w-[40%] shrink-0">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-sm">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover object-top grayscale"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Content */}
          <div className="w-full lg:flex-1 flex flex-col justify-center">
            <motion.h2
              {...fade(0.05)}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-semibold tracking-tight leading-[1.1] text-black mb-8 sm:mb-10"
            >
              {title.split(' ').slice(0, 2).join(' ')}
              <br />
              {title.split(' ').slice(2).join(' ')}
            </motion.h2>

            <motion.div
              {...fade(0.1)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12"
            >
              <p className="text-[15px] sm:text-base leading-relaxed text-black/80 font-normal">
                {paragraphs[0]}
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-black/80 font-normal">
                {paragraphs[1]}
              </p>
            </motion.div>

            <motion.blockquote
              {...fade(0.15)}
              className="text-[15px] sm:text-base leading-relaxed text-black/70 italic mb-8 sm:mb-10 max-w-xl"
            >
              “{quote}”
            </motion.blockquote>

            <motion.p
              {...fade(0.2)}
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-black"
            >
              {name}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Core Team (dark interactive)                                              */
/* -------------------------------------------------------------------------- */
export const TeamSection: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    teamApi
      .list()
      .then((data) => {
        setMembers(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .catch((err) => console.error('Failed to load team members', err));
  }, []);

  const activeMember = members.find((m) => m.id === activeId) ?? members[0];

  const fadeUp = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <>
      {/* ========== 1. Personal Note from Founder ========== */}
      <FounderNote
        image="/images/team/somansh-pandey.jpg" // ← replace with your actual image path
        title="PERSONAL NOTE FROM OUR FOUNDER"
        paragraphs={[
          "write somthing about the founder and his vision for the company. This could include his background, experience, and what inspired him to start the company.",
          "and add somthing about the company's mission, values, and what sets it apart from competitors. This could also include any notable achievements or milestones the company has reached under his leadership.",
        ]}
        quote="Architecture is about more than buildings—it's about creating spaces that inspire and enhance lives."
        name="Mr. Somansh Pandey."
      />

      {/* ========== 2. Our Core Team (interactive) ========== */}
      <section
        id="team"
        className="relative bg-black text-white overflow-hidden py-20 sm:py-24 lg:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14 sm:mb-16">
            <div className="flex-1">
              <motion.div {...fadeUp(0)} className="mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium tracking-widest uppercase text-white/90 border border-white/10">
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                  Team Member
                </span>
              </motion.div>

              <motion.h2
                {...fadeUp(0.05)}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.05]"
              >
                Our core team
              </motion.h2>
            </div>

            <motion.div
              {...fadeUp(0.1)}
              className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-6 lg:max-w-md xl:max-w-lg"
            >
              <p className="text-[13px] sm:text-sm leading-relaxed text-white/70 tracking-wide uppercase font-medium">
                BDAA unites architects, interior designers and visualisers with one goal: setting a new standard of excellence in Indian architecture.
              </p>
              <a
                href="#careers"
                className="shrink-0 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#9CAF88] text-black text-sm font-semibold tracking-wide hover:bg-[#8B9E77] transition-colors duration-300"
              >
                JOIN US
              </a>
            </motion.div>
          </div>

          {/* Interactive Grid + Featured */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Thumbnails */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
                {members.map((member, idx) => {
                  const isActive = member.id === activeId;
                  return (
                    <motion.button
                      key={member.id}
                      type="button"
                      {...fadeUp(0.08 + idx * 0.04)}
                      onMouseEnter={() => setActiveId(member.id)}
                      onFocus={() => setActiveId(member.id)}
                      onClick={() => setActiveId(member.id)}
                      className={`
                        relative aspect-[3/4] rounded-2xl overflow-hidden
                        border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                        ${
                          isActive
                            ? 'border-white/40 scale-[1.02] shadow-lg shadow-black/40'
                            : 'border-white/10 hover:border-white/25 opacity-80 hover:opacity-100'
                        }
                      `}
                      aria-label={`View ${member.name}`}
                      aria-pressed={isActive}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.05]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Featured large portrait + info card */}
            <div className="lg:col-span-7 xl:col-span-8 relative min-h-[420px] sm:min-h-[520px] lg:min-h-[560px]">
              <AnimatePresence mode="wait">
                {activeMember && (
                  <motion.div
                    key={activeMember.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full object-cover object-top grayscale contrast-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
                      className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 max-w-[260px] sm:max-w-[280px]"
                    >
                      <div className="bg-white text-black rounded-xl px-5 py-4 shadow-2xl shadow-black/30">
                        <h3 className="text-base sm:text-lg font-semibold leading-tight tracking-tight">
                          {activeMember.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-black/60 mt-1">
                          {activeMember.role}
                        </p>

                        <div className="flex items-center gap-3 mt-3.5">
                          {(activeMember as any).instagram ? (
                            <a
                              href={(activeMember as any).instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black/70 hover:text-black transition-colors"
                              aria-label="Instagram"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          ) : null}
                          <a
                            href={activeMember.twitter || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black/70 hover:text-black transition-colors"
                            aria-label="X / Twitter"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                          {(activeMember as any).whatsapp ? (
                            <a
                              href={(activeMember as any).whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black/70 hover:text-black transition-colors"
                              aria-label="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
