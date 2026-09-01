import React, { useRef } from 'react';
import { Compass, Sofa, Landmark, HardHat, ClipboardCheck, Construction, BookAIcon, } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Slow & smooth
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 30,
    restDelta: 0.001,
  });

  /*// ROUND open from bottom center only
  const clipPath = useTransform(
    smoothProgress,
    [0.02, 0.85],
    ['circle(0% at 50% 100%)', 'circle(165% at 50% 100%)']
  );

  // Title / content ONLY after circle is mostly open
  const contentOpacity = useTransform(smoothProgress, [0.5, 0.78], [0, 1]);
  const contentY = useTransform(smoothProgress, [0.5, 0.78], [30, 0]);*/

  const services = [
    {
      icon: Landmark  ,
      title: 'Architectural Design',
      desc: 'Comprehensive architectural solutions for residential luxury, commercial towers, and civic institutions.',
    },
    {
      icon: Sofa,
      title: 'Interior Design',
      desc: 'Thoughtful spatial interiors blending custom millwork, ambient lighting, acoustic comfort, and tactile stone.',
    },
    {
      icon: Construction,
      title: 'Construction',
      desc: 'Strategic master planning for eco-districts, university campuses, and sustainable urban developments.',
    },
    {
      icon: Compass,
      title: 'Vastu',
      desc: 'End-to-end site supervision, vendor management, and strict budget and safety compliance.',
    },
    {
      icon: BookAIcon,
      title: 'Project Management',
      desc: 'Net-zero carbon engineering, solar orientation analysis, passive heating/cooling, and LEED Platinum.',
    },
    {
      icon: ClipboardCheck,
      title: 'Vandor Management',
      desc: 'Zoning analysis, structural feasibility studies, and preliminary CAD blueprints for upcoming projects.',
    },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-28 text-[var(--text-on-accent)] overflow-hidden"
    >
      {/* Content – late, after round open */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">
            What We Deliver
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
            Our Architectural Services
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            From initial sketch and zoning clearance to structural construction and interior
            styling, we offer full-spectrum architecture services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                data-cursor="SERVICE"
                className="glass-card rounded-3xl p-8 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-300 border border-[var(--text-primary)]/10 hover:border-[var(--accent-warm)] shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--text-primary)]/5 text-[var(--accent-warm)] flex items-center justify-center mb-6 group-hover:bg-[var(--text-primary)] group-hover:text-[var(--text-on-accent)] transition-all shadow-md border border-[var(--text-primary)]/10 group-hover:scale-105">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-warm)] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-normal">
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
