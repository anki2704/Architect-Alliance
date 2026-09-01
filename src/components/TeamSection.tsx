import React, { useEffect, useState } from 'react';
import { TeamMember } from '../types';
import { teamApi } from '../services/api';
import { Linkedin, Twitter } from 'lucide-react';
import { motion } from 'motion/react';

export const TeamSection: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    teamApi
      .list()
      .then(setMembers)
      .catch((err) => console.error('Failed to load team members', err));
  }, []);

  return (
    <section id="team" className="py-28 bg-[var(--bg-main)] text-[var(--text-primary)] border-t border-[var(--text-primary)]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-5"
          >
            <img
              src="/images/brand/logo-new.png"
              alt="Architecture Alliance"
              className="h-25 w-auto object-contain bg-transparent"
            />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3"
          >
            Our Principal Architects
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-4"
          >
            Meet the Visionaries
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-[var(--text-secondary)] leading-relaxed font-normal"
          >
            The creative minds, structural engineers, and sustainability specialists behind every iconic design.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              data-cursor="STUDIO"
              className="glass-card rounded-3xl p-6 hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center justify-between group border border-[var(--text-primary)]/10 hover:border-[var(--accent-warm)] shadow-sm hover:shadow-xl"
            >
              <div>
                <div className="w-28 h-28 rounded-full overflow-hidden mb-6 border-2 border-[var(--text-primary)]/20 group-hover:border-[var(--accent-warm)] transition-colors shadow-md mx-auto">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-1">
                  {member.name}
                </h3>

                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--accent-warm)] mb-3 font-mono">
                  {member.role}
                </span>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-normal">
                  {member.bio}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-[var(--text-primary)]/10 w-full">
                <a
                  href={member.linkedin || 'https://linkedin.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[var(--bg-card)]/80 text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all shadow-sm border border-[var(--text-primary)]/10"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={member.twitter || 'https://twitter.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[var(--bg-card)]/80 text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all shadow-sm border border-[var(--text-primary)]/10"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

