import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import { JournalArticle } from '../types';
import { journalApi } from '../services/api';

/**
 * Full-page article view — opens at /journal/:id
 *
 * Fetches this one article directly via journalApi.get(id) rather than
 * pulling the whole list — stays fast no matter how many articles you add.
 *
 * The body (`content`, or `excerpt` as fallback) is the formatted HTML saved by
 * <RichTextEditor />, shown as-is (headings, bullets, bold, images...).
 * Older plain-text posts still render fine.
 */

// Article look — also used by RichTextEditor so the editor matches the page.
export const ARTICLE_BODY_CLASSES = [
  'text-lg leading-relaxed text-[var(--text-secondary)] [&_p]:my-5',
  '[&_h1]:font-serif-display [&_h1]:text-3xl sm:[&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:text-[var(--text-primary)] [&_h1]:mt-14 [&_h1]:mb-5',
  '[&_h2]:font-serif-display [&_h2]:text-3xl sm:[&_h2]:text-4xl [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:text-[var(--text-primary)] [&_h2]:mt-14 [&_h2]:mb-5',
  '[&_h3]:font-serif-display [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-[var(--text-primary)] [&_h3]:mt-10 [&_h3]:mb-3',
  '[&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-[var(--text-primary)] [&_h4]:mt-8 [&_h4]:mb-2',
  '[&_strong]:font-bold [&_strong]:text-[var(--text-primary)] [&_em]:italic',
  '[&_a]:text-[var(--accent-warm)] [&_a]:underline [&_a]:underline-offset-4',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul]:space-y-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol]:space-y-2',
  '[&_li]:pl-1 [&_li_p]:my-0 [&_li::marker]:text-[var(--accent-warm)]',
  '[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent-warm)] [&_blockquote]:pl-6 [&_blockquote]:italic',
  '[&_hr]:my-12 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[var(--text-primary)]/15',
  '[&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:my-10',
].join(' ');

const looksLikeHtml = (text: string) =>
  /<\/?(p|h[1-6]|ul|ol|li|img|blockquote|div|br|hr|strong|em|a|figure)\b/i.test(text);

export const JournalArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Back → home page, scrolled to the Journal section.
  // Put the id="..." of your home-page journal section first in this list.
  const JOURNAL_SECTION_IDS = ['journal', 'details', 'detail'];

  const goBack = () => {
    navigate('/');
    // home page needs a moment to render — retry until the section exists
    const scrollToSection = (tries = 0) => {
      const el = JOURNAL_SECTION_IDS.map((sid) => document.getElementById(sid)).find(Boolean);
      if (el) {
        const lenis = (window as any).lenis;
        if (lenis) lenis.scrollTo(el, { immediate: true });
        else el.scrollIntoView();
      } else if (tries < 30) {
        setTimeout(() => scrollToSection(tries + 1), 50);
      }
    };
    scrollToSection();
  };

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

  const body = article?.content?.trim() ? article.content : article?.excerpt ?? '';

  // sanitized HTML, or null when the body is old plain text
  const html = useMemo(() => {
    if (!body || !looksLikeHtml(body)) return null;
    return DOMPurify.sanitize(body, { ADD_ATTR: ['target', 'rel'] }).replace(/<(\/?)h1\b/gi, '<$1h2');
  }, [body]);

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
            onClick={goBack}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-12">
        <button
          type="button"
          onClick={goBack}
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

          {html !== null ? (
            <div className={ARTICLE_BODY_CLASSES} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {body}
            </div>
          )}
        </motion.div>
      </div>
    </article>
  );
};
