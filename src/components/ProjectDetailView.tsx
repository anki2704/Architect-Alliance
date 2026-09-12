import React, { useEffect } from 'react';
import { Project } from '../types';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectDetailViewProps {
  project: Project;
  projects: Project[];
  onClose: () => void;
  onSelectProject: (proj: Project) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  projects,
  onClose,
  onSelectProject,
}) => {
  // Escape → close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject =
    projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  // Gallery images
  const gallery: string[] =
    project.imageGallery && project.imageGallery.length > 0
      ? project.imageGallery
      : project.imageUrl
        ? [project.imageUrl]
        : [];

  const total = 1 + gallery.length; // hero + images
  const heroImage = gallery[0] || project.imageUrl || '';

  // Title split for large display (like "TROPICAL / CAFE")
  const titleLines = project.title.trim().split(/\s+/);
  const mid = Math.ceil(titleLines.length / 2);
  const titleFirst = titleLines.slice(0, mid).join(' ');
  const titleSecond = titleLines.slice(mid).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-black text-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Fixed Close */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/50 border border-white/20 text-white text-[11px] tracking-widest uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        Close
      </button>

      {/* ─── 01: HERO (details only) ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: '100vh', marginBottom: 12 }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.22) 65%, rgba(0,0,0,0.05)),
              url(${heroImage})
            `,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            animation: 'heroZoom 1.4s cubic-bezier(0.2, 0.7, 0.2, 1) both',
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 h-full flex flex-col justify-center"
          style={{
            padding: '7vw',
            animation: 'textIn 1s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#bbb',
              marginBottom: 24,
              textTransform: 'uppercase',
            }}
          >
            PROJECT / {(project.category || project.typology || 'ARCHITECTURE').toUpperCase()}
          </div>

          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(48px, 9vw, 140px)',
              lineHeight: 0.82,
              letterSpacing: '-0.075em',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {titleSecond ? (
              <>
                {titleFirst}
                <br />
                {titleSecond}
              </>
            ) : (
              titleFirst
            )}
          </h1>

          {/* Meta */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{
              gap: 25,
              marginTop: 48,
              maxWidth: 900,
            }}
          >
            <div style={{ borderTop: '1px solid #888', paddingTop: 10 }}>
              <b
                style={{
                  display: 'block',
                  color: '#fff',
                  fontSize: 10,
                  letterSpacing: '0.13em',
                  marginBottom: 7,
                  fontWeight: 700,
                }}
              >
                CLIENT
              </b>
              <span style={{ color: '#ddd', fontSize: 12, lineHeight: 1.5 }}>
                {project.client || '—'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid #888', paddingTop: 10 }}>
              <b
                style={{
                  display: 'block',
                  color: '#fff',
                  fontSize: 10,
                  letterSpacing: '0.13em',
                  marginBottom: 7,
                  fontWeight: 700,
                }}
              >
                COMPLETION
              </b>
              <span style={{ color: '#ddd', fontSize: 12, lineHeight: 1.5 }}>
                {project.year || project.status || '—'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid #888', paddingTop: 10 }}>
              <b
                style={{
                  display: 'block',
                  color: '#fff',
                  fontSize: 10,
                  letterSpacing: '0.13em',
                  marginBottom: 7,
                  fontWeight: 700,
                }}
              >
                SERVICES
              </b>
              <span style={{ color: '#ddd', fontSize: 12, lineHeight: 1.5 }}>
                {project.typology || project.category || 'Architecture'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid #888', paddingTop: 10 }}>
              <b
                style={{
                  display: 'block',
                  color: '#fff',
                  fontSize: 10,
                  letterSpacing: '0.13em',
                  marginBottom: 7,
                  fontWeight: 700,
                }}
              >
                LOCATION
              </b>
              <span style={{ color: '#ddd', fontSize: 12, lineHeight: 1.5 }}>
                {project.location || project.country || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: 'absolute',
            zIndex: 3,
            bottom: 30,
            left: '7vw',
            color: '#aaa',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          SCROLL TO EXPLORE ↓
        </div>
      </section>

      {/* ─── 02+: FULLSCREEN IMAGES ─── */}
      {gallery.map((src, i) => {
        const num = i + 2;
        const isLast = i === gallery.length - 1;
        return (
          <section
            key={i}
            className="relative w-full overflow-hidden group"
            style={{
              height: '100vh',
              background: '#111',
              marginBottom: isLast ? 0 : 12,
            }}
          >
            <img
              src={src}
              alt={`${project.title} ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transform: 'scale(1.06)',
                transition: 'transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1)',
              }}
              className="group-hover:!scale-[1.02]"
            />

            <span
              style={{
                position: 'absolute',
                right: 35,
                top: 28,
                zIndex: 2,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: '#fff',
                background: 'rgba(0,0,0,0.45)',
                padding: '9px 12px',
                borderRadius: 20,
              }}
            >
              {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </section>
        );
      })}

      {/* ─── Bottom nav ─── */}
      <section
        className="border-t border-white/10"
        style={{ background: '#000', padding: '48px 7vw' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => onSelectProject(prevProject)}
            className="flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-left transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-white/60 group-hover:-translate-x-1 transition-transform shrink-0" />
            <div>
              <span className="block text-[10px] tracking-widest text-white/40 uppercase mb-1">
                Previous
              </span>
              <span className="text-sm font-medium text-white">
                {prevProject.title}
              </span>
            </div>
          </button>

          <button
            onClick={() => onSelectProject(nextProject)}
            className="flex items-center justify-end gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-right transition-all cursor-pointer group"
          >
            <div>
              <span className="block text-[10px] tracking-widest text-white/40 uppercase mb-1">
                Next
              </span>
              <span className="text-sm font-medium text-white">
                {nextProject.title}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </section>

      {/* Keyframes */}
      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.12); }
          to   { transform: scale(1); }
        }
        @keyframes textIn {
          from { opacity: 0; transform: translateY(45px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </motion.div>
  );
};
