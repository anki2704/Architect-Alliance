import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, Plus, Upload, Image as ImageIcon, Save, ZoomIn } from 'lucide-react';
import { TeamMember } from '../types';
import { teamApi, uploadApi, ApiError } from '../services/api';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful create. */
  onCreated: (member: TeamMember) => void;
  /** Called after a successful update. */
  onUpdated: (member: TeamMember) => void;
  /** Pass an existing member to edit them; omit/null to create a new one. */
  member?: TeamMember | null;
}

const EMPTY_FORM = {
  name: '',
  role: '',
  bio: '',
  linkedin: '',
  twitter: '',
  order: '0'
};

/* -------------------------------------------------------------------------- */
/*  Photo cropper — drag to reposition, slider to zoom. Kept local to this    */
/*  file since it's only used by the team-photo upload step for now.         */
/* -------------------------------------------------------------------------- */
interface CropperProps {
  imageSrc: string;
  aspectRatio: number; // width / height, e.g. 4/3
  title?: string;
  onCancel: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

const CROPPER_OUTPUT_WIDTH = 800;

const PhotoCropper: React.FC<CropperProps> = ({
  imageSrc,
  aspectRatio,
  title = 'Adjust your photo',
  onCancel,
  onCropComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(
    null
  );

  // Measure the crop viewport once it's in the DOM (its size only depends on
  // CSS, not on the image, so this doesn't need to wait for image load).
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    }
  }, []);

  const baseScale =
    naturalSize && containerSize
      ? Math.max(containerSize.w / naturalSize.w, containerSize.h / naturalSize.h)
      : 1;
  const totalScale = baseScale * zoom;

  const clampOffset = useCallback(
    (next: { x: number; y: number }) => {
      if (!naturalSize || !containerSize) return next;
      const displayW = naturalSize.w * totalScale;
      const displayH = naturalSize.h * totalScale;
      const minX = Math.min(0, containerSize.w - displayW);
      const minY = Math.min(0, containerSize.h - displayH);
      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y))
      };
    },
    [naturalSize, containerSize, totalScale]
  );

  // Center the image the moment we know both its natural size and the
  // viewport size, and reset zoom for a fresh photo.
  useEffect(() => {
    if (!naturalSize || !containerSize) return;
    const displayW = naturalSize.w * baseScale;
    const displayH = naturalSize.h * baseScale;
    setOffset({ x: (containerSize.w - displayW) / 2, y: (containerSize.h - displayH) / 2 });
    setZoom(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize, containerSize]);

  // Re-clamp whenever zoom changes so the photo never leaves a gap.
  useEffect(() => {
    setOffset((prev) => clampOffset(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, startOffsetX: offset.x, startOffsetY: offset.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clampOffset({ x: dragState.current.startOffsetX + dx, y: dragState.current.startOffsetY + dy }));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleConfirm = () => {
    if (!naturalSize || !containerSize || !imgRef.current) return;

    // Map the visible crop viewport back to natural-pixel coordinates.
    const sx = -offset.x / totalScale;
    const sy = -offset.y / totalScale;
    const sw = containerSize.w / totalScale;
    const sh = containerSize.h / totalScale;

    const outputHeight = Math.round(CROPPER_OUTPUT_WIDTH / aspectRatio);
    const canvas = document.createElement('canvas');
    canvas.width = CROPPER_OUTPUT_WIDTH;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, CROPPER_OUTPUT_WIDTH, outputHeight);
    onCropComplete(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[var(--text-primary)]/15">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel crop"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--text-primary)]/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[var(--text-primary)]" />
          </button>
        </div>

        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ aspectRatio: String(aspectRatio), touchAction: 'none' }}
          className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-2xl bg-black/40 border border-[var(--text-primary)]/15 cursor-move select-none"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            style={
              naturalSize && containerSize
                ? {
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                    width: naturalSize.w * totalScale,
                    height: naturalSize.h * totalScale,
                    maxWidth: 'none'
                  }
                : { position: 'absolute', opacity: 0 }
            }
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <ZoomIn className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--accent-warm)] cursor-pointer"
          />
        </div>
        <p className="text-[11px] text-[var(--text-muted)] text-center mt-2">
          Drag the photo to reposition &middot; use the slider to zoom
        </p>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!naturalSize}
            className="flex-1 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--accent-warm)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddTeamModal: React.FC<AddTeamModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  member
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const [cropSource, setCropSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!member;

  // Reset / prefill the form whenever the modal opens (for add) or
  // whenever a different member is passed in (for edit).
  useEffect(() => {
    if (!isOpen) return;
    if (member) {
      setForm({
        name: member.name,
        role: member.role,
        bio: member.bio,
        linkedin: member.linkedin ?? '',
        twitter: member.twitter ?? '',
        order: String(member.order ?? 0)
      });
      setImagePreview(member.image);
      setImageFileName('');
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
      setImageFileName('');
    }
    setErrorMsg('');
  }, [isOpen, member]);

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
    reader.onload = () => setCropSource(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setImagePreview(croppedDataUrl);
    setCropSource(null);
  };

  const handleCropCancel = () => {
    setCropSource(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim() || !form.role.trim() || !form.bio.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!imagePreview) {
      setErrorMsg('Please select a photo from your device.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only re-upload if a new file was actually picked (a data: URL means
      // it's a freshly-chosen file; an http(s) or /uploads path means it's
      // the existing image and doesn't need re-uploading on edit).
      const image = imagePreview.startsWith('data:')
        ? (await uploadApi.image(imagePreview, form.name.trim() || imageFileName)).url
        : imagePreview;

      const payload: Partial<TeamMember> = {
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
        image,
        linkedin: form.linkedin.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        order: Number(form.order) || 0
      };

      if (isEditing && member) {
        const updated = await teamApi.update(member.id, payload);
        onUpdated(updated);
      } else {
        const created = await teamApi.create(payload);
        onCreated(created);
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : `Could not ${isEditing ? 'update' : 'create'} team member. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
          aria-label="Close team member modal"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center cursor-pointer shadow-lg border border-[var(--text-primary)]/15 transition-all"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="overflow-y-auto max-h-[94vh] rounded-3xl pr-0.5">
          <div className="text-center max-w-xl mx-auto mb-6 px-1 pt-1">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
              Admin · Team
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
              {isEditing ? 'Edit Team Member' : 'Add a Team Member'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isEditing
                ? 'Update this team member\u2019s details below.'
                : 'Fill in the details and pick a photo directly from your device.'}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-[var(--text-primary)]/15 bg-[var(--bg-card)]/90">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aanya Sharma"
                    value={form.name}
                    onChange={setField('name')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal Architect"
                    value={form.role}
                    onChange={setField('role')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              {/* Photo — file picker (no URL required) */}
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Photo *
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
                      Click to choose photo from device
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

              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Bio *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="A short bio shown on the team section..."
                  value={form.bio}
                  onChange={setField('bio')}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    LinkedIn <span className="normal-case font-normal text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={form.linkedin}
                    onChange={setField('linkedin')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    Twitter / X <span className="normal-case font-normal text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://x.com/..."
                    value={form.twitter}
                    onChange={setField('twitter')}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Display Order <span className="normal-case font-normal text-[var(--text-muted)]">(lower shows first)</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={setField('order')}
                  className="w-full sm:w-40 px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-warm)] bg-[var(--bg-card)] border border-[var(--text-primary)]/15"
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
                    <Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Saving Changes...' : 'Saving Member...'}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Team Member
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    {cropSource && (
      <PhotoCropper
        imageSrc={cropSource}
        aspectRatio={4 / 3}
        title="Adjust the photo"
        onCancel={handleCropCancel}
        onCropComplete={handleCropComplete}
      />
    )}
    </>
  );
};
