import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { JournalArticle } from '../types';
import { journalApi } from '../services/api';

/**
 * Full-page article view — opens at /journal/:id
 *
 * Fetches this one article directly via journalApi.get(id) rather than
 * pulling the whole list — stays fast no matter how many articles you add.
 *
 * If an article was written with the full `content` field filled in, that's
 * shown; otherwise it falls back to the `excerpt` so older/shorter posts
 * still render fine.
 */
export const JournalArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    journalApi
      .get(id)
      .then(setArticle)
      .catch((err) => {
        console.error('Failed to load journal post', err);
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const body = article?.content ?? article?.excerpt;

  if (loading) {
    return <div className="min-h-[60vh]" />;
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-[var(--text-secondary)]">Article not found</p>
          <button
            type="button"
            onClick={() => navigate('/journal')}
            className="px-6 py-2.5 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] text-xs font-mono tracking-widest uppercase font-bold hover:bg-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          type="button"
          onClick={() => navigate('/journal')}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-warm)] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Journal
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)] mb-4">
            <span className="inline-flex items-center gap-1.5 text-[var(--accent-warm)] font-bold uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              {article.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-sm font-mono font-semibold text-[var(--text-secondary)] mb-8">
            By {article.author}
          </p>

          <div className="relative w-full h-64 sm:h-[28rem] rounded-3xl overflow-hidden mb-10 border border-[var(--text-primary)]/10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {body}
          </div>
        </motion.div>
      </div>
    </article>
  );
};
