import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, Plus, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { JournalArticle } from '../types';
import { journalApi, uploadApi, ApiError } from '../services/api';

interface AddJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful create. */
  onCreated: (article: JournalArticle) => void;
  /** Called after a successful update. */
  onUpdated: (article: JournalArticle) => void;
  /** Pass an existing article to edit it; omit/null to create a new one. */
  article?: JournalArticle | null;
}

const EMPTY_FORM = {
  title: '',
  category: '',
  readTime: '',
  date: '',
  author: '',
  excerpt: '',
  content: ''
};

const todayDisplay = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const AddJournalModal: React.FC<AddJournalModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  article
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!article;

  // Reset / prefill the form whenever the modal opens (for add) or
  // whenever a different article is passed in (for edit).
  useEffect(() => {
    if (!isOpen) return;
    if (article) {
      setForm({
        title: article.title,
        category: article.category,
        readTime: article.readTime,
        date: article.date,
        author: article.author,
        excerpt: article.excerpt,
        content: article.content ?? ''
      });
      setImagePreview(article.image);
      setImageFileName('');
    } else {
      setForm({ ...EMPTY_FORM, date: todayDisplay() });
      setImagePreview(null);
      setImageFileName('');
    }
    setErrorMsg('');
  }, [isOpen, article]);

  useEffect(() => {
    if (isOpen && (window as any).lenis) (window as any).lenis.stop();
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const setField = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image is too large. Maximum size is 8 MB.');
      return;
    }

    setErrorMsg('');
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.readTime.trim() ||
      !form.date.trim() ||
      !form.author.trim() ||
      !form.excerpt.trim()
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!imagePreview) {
      setErrorMsg('Please select a cover image from your device.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only re-upload if a new file was actually picked (a data: URL means
      // it's a freshly-chosen file; an http(s) URL means it's the existing
      // image and doesn't need re-uploading on edit).
      const imageUrl = imagePreview.startsWith('data:')
        ? (await uploadApi.image(imagePreview, form.title.trim() || imageFileName)).url
        : imagePreview;

      const payload: Partial<JournalArticle> = {
        title: form.title.trim(),
        category: form.category.trim(),
        readTime: form.readTime.trim(),
        date: form.date.trim(),
        author: form.author.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim() || undefined,
        image: imageUrl
      };

      if (isEditing && article) {
        const updated = await journalApi.update(article.id, payload);
        onUpdated(updated);
      } else {
        const created = await journalApi.create(payload);
        onCreated(created);
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : `Could not ${isEditing ? 'update' : 'create'} article. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[var(--overlay)] backdrop-blur-md"
    >
      <div className="w-full max-w-2xl max-h-[94vh] relative flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close journal article modal"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center cursor-pointer shadow-lg border border-[var(--text-primary)]/15 transition-all"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="overflow-y-auto max-h-[94vh] rounded-3xl pr-0.5">
          <div className="text-center max-w-xl mx-auto mb-6 px-1 pt-1">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
              Admin · Journal
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
              {isEditing ? 'Edit Article' : 'Add a New Article'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isEditing
                ? 'Update the article details below.'
                : 'Fill in the article details and pick a cover image directly from your device.'}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-[var(--text-primary)]/15 bg-[var(--bg-card)]/90">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Designing for Passive Solar Gain"
                  value={form.title}
                  onChange={setField('title')}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                />
              </div>

              {/* Cover Image — file picker (no URL required) */}
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Cover Image *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-[var(--text-primary)]/20 bg-[var(--bg-main)] hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm)]/5 transition-all cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-[var(--accent-warm)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Click to choose image from device
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      JPG, PNG, WebP · Max 8 MB · Phone / PC / Tablet
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--text-primary)]/15 bg-[var(--bg-elevated)]">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-3 py-2 rounded-lg bg-red-500/100 text-[var(--text-primary)] text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    {imageFileName && (
                      <p className="absolute bottom-2 left-2 right-2 text-[10px] text-[var(--text-primary)] bg-[var(--text-primary)]/50 rounded px-2 py-1 truncate">
                        {imageFileName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sustainability"
                    value={form.category}
                    onChange={setField('category')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Read Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6 min read"
                    value={form.readTime}
                    onChange={setField('readTime')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Author name"
                    value={form.author}
                    onChange={setField('author')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. September 8, 2026"
                    value={form.date}
                    onChange={setField('date')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Excerpt * <span className="normal-case font-normal text-[var(--text-muted)]">(short summary shown in the listing)</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="A one or two sentence summary of the article..."
                  value={form.excerpt}
                  onChange={setField('excerpt')}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Full Article <span className="normal-case font-normal text-[var(--text-muted)]">(optional — shown on the article's own page; leave blank to just show the excerpt there)</span>
                </label>
                <textarea
                  rows={10}
                  placeholder="Write the full article here. Leave a blank line between paragraphs."
                  value={form.content}
                  onChange={setField('content')}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15 resize-y font-sans"
                />
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/100/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] font-mono font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-warm)] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Saving Changes...' : 'Saving Article...'}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Article
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
