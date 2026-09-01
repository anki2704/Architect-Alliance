import React, { useState, useRef } from 'react';
import { X, Loader2, AlertCircle, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { projectsApi, uploadApi, ApiError } from '../services/api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

const CATEGORY_OPTIONS: { value: Exclude<ProjectCategory, 'all'>; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'interior', label: 'Interior' },
  { value: 'sustainable', label: 'Sustainable' }
];

const EMPTY_FORM = {
  title: '',
  category: 'residential' as Exclude<ProjectCategory, 'all'>,
  description: '',
  client: '',
  year: new Date().getFullYear().toString(),
  location: '',
  areaSqFt: '',
  status: '',
  features: ''
};

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && (window as any).lenis) (window as any).lenis.stop();
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const setField = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
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
      !form.description.trim() ||
      !form.client.trim() ||
      !form.year.trim() ||
      !form.location.trim() ||
      !form.areaSqFt.trim()
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
      const { url: imageUrl } = await uploadApi.image(
        imagePreview,
        form.title.trim() || imageFileName
      );

      const payload: Partial<Project> = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        imageUrl,
        client: form.client.trim(),
        year: form.year.trim(),
        location: form.location.trim(),
        areaSqFt: form.areaSqFt.trim(),
        status: form.status.trim() || undefined,
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        imageGallery: [imageUrl]
      };

      const created = await projectsApi.create(payload);
      onCreated(created);
      setForm(EMPTY_FORM);
      clearImage();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Could not create project. Please try again.');
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
          aria-label="Close add project modal"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center cursor-pointer shadow-lg border border-[var(--text-primary)]/15 transition-all"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="overflow-y-auto max-h-[94vh] rounded-3xl pr-0.5">
          <div className="text-center max-w-xl mx-auto mb-6 px-1 pt-1">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
              Admin · Project Gallery
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
              Add a New Project
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Fill in the project details and pick a cover image directly from your device.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-[var(--text-primary)]/15 bg-[var(--bg-card)]/90">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meridian Residence"
                    value={form.title}
                    onChange={setField('title')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={setField('category')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15 focus:outline-none focus:border-[var(--accent-warm)] cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Short description of the project..."
                  value={form.description}
                  onChange={setField('description')}
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
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
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
                    Client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Client name"
                    value={form.client}
                    onChange={setField('client')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026"
                    value={form.year}
                    onChange={setField('year')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City, Country"
                    value={form.location}
                    onChange={setField('location')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Area (sq ft) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4,200 sq ft"
                    value={form.areaSqFt}
                    onChange={setField('areaSqFt')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Completed"
                    value={form.status}
                    onChange={setField('status')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Solar panels, Rainwater harvesting"
                    value={form.features}
                    onChange={setField('features')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Project...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Project
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
