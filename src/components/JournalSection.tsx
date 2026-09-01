import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { JournalArticle } from '../types';
import { journalApi } from '../services/api';

export const JournalSection: React.FC = () => {
  const [articles, setArticles] = useState<JournalArticle[]>([]);

  useEffect(() => {
    journalApi
      .list()
      .then(setArticles)
      .catch((err) => console.error('Failed to load journal posts', err));
  }, []);

  if (articles.length === 0) return null;

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <section id="journal" className="py-28 bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--text-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/10 text-[var(--accent-warm)] text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
              Architectural Journal & Insights
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)]">
              Thought Leadership & Publications
            </h2>
          </div>

          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            Insights on real estate market trends, sustainable construction technology, and biophilic luxury living.
          </p>
        </div>

        {/* Content Layout: Featured Left + Stacked Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured Article Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-cursor="ARTICLE"
            className="lg:col-span-7 glass-card rounded-3xl overflow-hidden border border-[var(--text-primary)]/15 shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
          >
            <div className="relative h-72 sm:h-96 overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-[var(--text-primary)] text-[var(--text-on-accent)] text-[10px] font-mono font-bold uppercase px-3 py-1.5 rounded-full shadow-md">
                Featured Publication
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between flex-1 bg-[var(--bg-card)]">
              <div>
                <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)] mb-3">
                  <span className="text-[var(--accent-warm)] font-bold uppercase">{featuredArticle.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredArticle.readTime}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-warm)] transition-colors mb-3 leading-snug">
                  {featuredArticle.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--text-primary)]/10">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                  By {featuredArticle.author}
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-warm)] group-hover:text-[var(--text-primary)] transition-colors">
                  <span>Read Article</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column Stacked List */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {secondaryArticles.map((art, idx) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                data-cursor="ARTICLE"
                className="glass-card p-6 rounded-3xl border border-[var(--text-primary)]/15 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-start gap-5 cursor-pointer bg-[var(--bg-card)]"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-[var(--text-primary)]/10">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] mb-1">
                      <span className="text-[var(--accent-warm)] font-bold uppercase">{art.category}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h4 className="font-serif-display text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-warm)] transition-colors leading-snug line-clamp-2 mb-2">
                      {art.title}
                    </h4>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[var(--accent-warm)] group-hover:text-[var(--text-primary)] transition-colors mt-1">
                    <span>Read More</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
