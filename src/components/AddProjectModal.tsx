import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, Plus, Upload, Trash2, Star, Save } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { projectsApi, uploadApi, ApiError } from '../services/api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful create. */
  onCreated: (project: Project) => void;
  /** Called after a successful update. Optional for back-compat with callers that only create. */
  onUpdated?: (project: Project) => void;
  /** Pass an existing project to edit it; omit/null to create a new one. */
  project?: Project | null;
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
  country: '',
  typology: '',
  areaSqFt: '',
  status: '',
  features: ''
};

/** One image in the gallery being edited — either an already-uploaded URL
 *  (when editing an existing project) or a freshly-picked local file
 *  represented as a data: URL (needs uploading on submit). */
interface GalleryImage {
  id: string;
  src: string;
  isNew: boolean;
  fileName?: string;
}

let imgCounter = 0;
const nextImgId = () => `img-${Date.now()}-${imgCounter++}`;

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  project
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!project;

  // Reset / prefill the form whenever the modal opens (for add) or whenever
  // a different project is passed in (for edit).
  useEffect(() => {
    if (!isOpen) return;
    if (project) {
      setForm({
        title: project.title,
        category: (project.category as Exclude<ProjectCategory, 'all'>) || 'residential',
        description: project.description,
        client: project.client,
        year: project.year,
        location: project.location,
        country: project.country ?? '',
        typology: project.typology ?? '',
        areaSqFt: project.areaSqFt,
        status: project.status ?? '',
        features: (project.features || []).join(', ')
      });
      const gallery =
        project.imageGallery && project.imageGallery.length > 0
          ? project.imageGallery
          : project.imageUrl
            ? [project.imageUrl]
            : [];
      setImages(gallery.map((src) => ({ id: nextImgId(), src, isNew: false })));
    } else {
      setForm(EMPTY_FORM);
      setImages([]);
    }
    setErrorMsg('');
  }, [isOpen, project]);

  useEffect(() => {
    if (isOpen && (window as any).lenis) (window as any).lenis.stop();
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const setField = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const picked = Array.from(files);

    picked.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select image files only (JPG, PNG, WebP, etc.).');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" is too large. Maximum size is 8 MB per image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          { id: nextImgId(), src: reader.result as string, isNew: true, fileName: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Allow re-selecting the same file again later
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const makeCover = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (!target) return prev;
      return [target, ...prev.filter((img) => img.id !== id)];
    });
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

    if (images.length === 0) {
      setErrorMsg('Please add at least one image.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only re-upload images that were freshly picked (data: URLs). Images
      // that already have a real URL (editing an existing project) are kept
      // as-is so we don't re-upload unchanged files.
      const uploadedGallery: string[] = [];
      for (const img of images) {
        if (img.isNew) {
          const { url } = await uploadApi.image(img.src, form.title.trim() || img.fileName);
          uploadedGallery.push(url);
        } else {
          uploadedGallery.push(img.src);
        }
      }

      const payload: Partial<Project> = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        imageUrl: uploadedGallery[0],
        imageGallery: uploadedGallery,
        client: form.client.trim(),
        year: form.year.trim(),
        location: form.location.trim(),
        country: form.country.trim() || undefined,
        typology: form.typology.trim() || undefined,
        areaSqFt: form.areaSqFt.trim(),
        status: form.status.trim() || undefined,
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
      };

      if (isEditing && project) {
        const updated = await projectsApi.update(project.id, payload);
        onUpdated?.(updated);
      } else {
        const created = await projectsApi.create(payload);
        onCreated(created);
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : `Could not ${isEditing ? 'update' : 'create'} project. Please try again.`
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
          aria-label="Close project modal"
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
              {isEditing ? 'Edit Project' : 'Add a New Project'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isEditing
                ? 'Update the project details and images below.'
                : 'Fill in the project details and add images directly from your device.'}
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

              {/* Images — multi-file picker, first image is the cover */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Project Images * <span className="normal-case font-normal text-[var(--text-muted)]">(first = cover)</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">{images.length} added</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-3">
                    {images.map((img, i) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[var(--text-primary)]/15 bg-[var(--bg-elevated)] group"
                      >
                        <img src={img.src} alt={`Project image ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] text-[9px] font-bold uppercase tracking-wider">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          {i !== 0 && (
                            <button
                              type="button"
                              onClick={() => makeCover(img.id)}
                              className="px-2 py-1 rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] text-[9px] font-bold cursor-pointer"
                            >
                              Set as cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="px-2 py-1 rounded-md bg-red-500 text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-[var(--text-primary)]/20 bg-[var(--bg-main)] hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm)]/5 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-[var(--accent-warm)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {images.length > 0 ? 'Add more images' : 'Click to choose images from device'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    JPG, PNG, WebP · Max 8 MB each · Select multiple at once
                  </span>
                </button>
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
                    placeholder="City, State"
                    value={form.location}
                    onChange={setField('location')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Country <span className="normal-case font-normal text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={form.country}
                    onChange={setField('country')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Typology <span className="normal-case font-normal text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Private Residence"
                    value={form.typology}
                    onChange={setField('typology')}
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
                    <Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Saving Changes...' : 'Saving Project...'}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
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
