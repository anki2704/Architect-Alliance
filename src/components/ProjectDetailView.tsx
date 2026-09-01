import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { 
  X, ArrowLeft, ArrowRight, Share2, Mail, Linkedin, Twitter, 
  MapPin, Maximize2, ExternalLink
} from 'lucide-react';
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
  onSelectProject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset gallery when project changes
  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab('architecture');
  }, [project.id]);

  // Escape key → go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const currentIndex = projects.findIndex(p => p.id === project.id);
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const handleShare = (platform: string) => {
    const url = window.location.href;
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(project.title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'mail') {
      window.location.href = `mailto:?subject=${encodeURIComponent(project.title)}&body=${encodeURIComponent(url)}`;
    }
  };

  const navTabs = [
    { id: 'architecture', label: 'ARCHITECTURE' },
    { id: 'interiors', label: 'INTERIORS' },
    { id: 'landscape', label: 'LANDSCAPE' },
    { id: 'planning', label: 'PLANNING' },
    { id: 'products', label: 'PRODUCTS' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    let targetEl: HTMLElement | null = null;

    if (tabId === 'architecture') {
      targetEl = document.getElementById('section-hero-gallery');
    } else if (tabId === 'interiors') {
      targetEl = document.getElementById('section-interiors');
    } else if (tabId === 'landscape') {
      targetEl = document.getElementById('section-geography');
    } else if (tabId === 'planning') {
      targetEl = document.getElementById('section-schematics');
    } else if (tabId === 'products') {
      targetEl = document.getElementById('section-credits');
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans min-h-screen"
    >
      {/* Top Architectural Category Header — sticky under main Navbar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[var(--text-primary)]/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Navigation Category Bar */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-widest uppercase text-[var(--text-secondary)]">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`hover:text-[var(--text-primary)] transition-colors relative py-1 cursor-pointer ${
                activeTab === tab.id ? 'text-[var(--text-primary)] font-bold' : ''
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--text-primary)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Back / Close button */}
        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--text-primary)]/20 hover:bg-[var(--text-primary)] hover:text-[var(--text-on-accent)] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Main Architectural Showcase Container */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT STICKY SIDEBAR: Project Specs & Metadata */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] flex flex-col justify-between overflow-y-auto pr-0 lg:pr-4">
            <div>
              {/* Title & Location */}
              <div className="mb-8 border-b border-[var(--text-primary)]/10 pb-6">
                <span className="text-xs font-mono tracking-widest uppercase text-[var(--accent-warm)] block mb-2">
                  {project.category} · {project.country || 'INTERNATIONAL'}
                </span>
                <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-2">
                  {project.title}
                </h1>
                <p className="text-sm font-mono text-[var(--text-secondary)] tracking-wider uppercase">
                  {project.location}
                </p>
              </div>

              {/* Metadata Table */}
              <div className="space-y-4 text-xs font-mono mb-8 text-[var(--text-primary)]">
                <div className="grid grid-cols-2 py-2 border-b border-[var(--text-primary)]/10">
                  <span className="text-[var(--text-muted)] uppercase">YEAR</span>
                  <span className="font-semibold text-right">{project.year}</span>
                </div>

                <div className="grid grid-cols-2 py-2 border-b border-[var(--text-primary)]/10">
                  <span className="text-[var(--text-muted)] uppercase">CLIENT</span>
                  <span className="font-semibold text-right">{project.client}</span>
                </div>

                <div className="grid grid-cols-2 py-2 border-b border-[var(--text-primary)]/10">
                  <span className="text-[var(--text-muted)] uppercase">TYPOLOGY</span>
                  <span className="font-semibold text-right">{project.typology || project.category.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-2 py-2 border-b border-[var(--text-primary)]/10">
                  <span className="text-[var(--text-muted)] uppercase">SIZE</span>
                  <span className="font-semibold text-right">
                    {project.areaM2 ? `${project.areaM2} / ` : ''}{project.areaSqFt}
                  </span>
                </div>

                <div className="grid grid-cols-2 py-2 border-b border-[var(--text-primary)]/10">
                  <span className="text-[var(--text-muted)] uppercase">STATUS</span>
                  <span className="font-semibold text-right text-[var(--accent-warm)]">{project.status || 'COMPLETED'}</span>
                </div>
              </div>

              {/* Architectural Key Features */}
              <div className="mb-8">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-primary)] mb-3">
                  Key Specifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-[11px] font-medium text-[var(--text-secondary)]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Share Bar */}
              <div className="pt-4 border-t border-[var(--text-primary)]/10 flex items-center space-x-4">
                <span className="text-xs font-mono uppercase text-[var(--text-muted)]">SHARE:</span>
                <button
                  onClick={() => handleShare('mail')}
                  className="p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Share via Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Share on X"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
                  title="Copy link"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--text-on-accent)] text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT EDITORIAL SHOWCASE */}
          <div className="lg:col-span-8 space-y-12 lg:space-y-16">
            
            {/* Main Hero Gallery Showcase with Thumbnails */}
            <div id="section-hero-gallery" className="space-y-4">
              <div className="relative aspect-[16/9] bg-[var(--bg-elevated)] rounded-2xl overflow-hidden shadow-lg border border-[var(--text-primary)]/10">
                <img
                  src={project.imageGallery[activeImageIndex] || project.imageUrl}
                  alt={`${project.title} view ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                
                {/* Image counter overlay */}
                <div className="absolute bottom-4 right-4 bg-[var(--text-primary)]/80 backdrop-blur-md text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest">
                  {activeImageIndex + 1} / {project.imageGallery.length || 1}
                </div>
              </div>

              {/* Gallery Thumbnails Strip */}
              {project.imageGallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {project.imageGallery.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === i
                          ? 'border-[var(--accent-warm)] scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Design Narrative Story Paragraphs */}
            <div className="prose max-w-none space-y-6 text-[var(--text-secondary)] leading-relaxed text-base sm:text-lg font-sans">
              {project.narrativeParagraphs ? (
                project.narrativeParagraphs.map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-4xl first-letter:font-serif-display first-letter:font-bold first-letter:text-[var(--text-primary)] first-letter:mr-2 first-letter:float-left">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>{project.description}</p>
              )}
            </div>

            {/* Architect Highlight Quote Card */}
            {project.quote && (
              <div className="bg-[var(--bg-surface)] p-8 sm:p-10 rounded-2xl border-l-4 border-[var(--accent-warm)] relative overflow-hidden shadow-sm">
                <span className="text-6xl font-serif-display text-[var(--accent-warm)]/20 absolute top-2 left-4 select-none">“</span>
                <blockquote className="font-serif-display text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed relative z-10 mb-6 italic">
                  "{project.quote.text}"
                </blockquote>
                <div className="font-mono text-xs tracking-widest uppercase text-[var(--text-secondary)] relative z-10">
                  <span className="font-bold text-[var(--text-primary)]">{project.quote.author}</span> — {project.quote.role}
                </div>
              </div>
            )}

            {/* Architectural Diagrams & Schematics */}
            {project.diagrams && project.diagrams.length > 0 && (
              <div id="section-schematics" className="space-y-6 pt-6 border-t border-[var(--text-primary)]/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-primary)]">
                    Conceptual Diagrams & Schematics
                  </h3>
                  <span className="text-xs font-mono text-[var(--text-muted)]">ARCHITECTURAL EVOLUTION</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.diagrams.map((diag, i) => (
                    <div key={i} className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--text-primary)]/10 shadow-sm flex flex-col justify-between">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--bg-main)] mb-4">
                        <img src={diag.imageUrl} alt={diag.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 bg-[var(--text-primary)] text-[var(--text-on-accent)] text-[10px] font-mono px-2 py-0.5 rounded">
                          {diag.index}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif-display font-bold text-[var(--text-primary)] text-base mb-1">
                          {diag.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-normal">
                          {diag.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Mosaic Gallery */}
            <div id="section-interiors" className="space-y-6 pt-6 border-t border-[var(--text-primary)]/10">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-primary)]">
                Materiality & Spatial Views
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.imageGallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--text-primary)]/10 cursor-pointer"
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${project.title} detail ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-[var(--bg-card)]/90 text-[var(--text-primary)] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" /> Expand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Location Map Block */}
            <div id="section-geography" className="space-y-4 pt-6 border-t border-[var(--text-primary)]/10">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-primary)]">
                Project Geography
              </h3>
              <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 relative overflow-hidden border border-[var(--text-primary)]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--text-primary)] text-[var(--text-on-accent)] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[var(--accent-warm)]" />
                  </div>
                  <div>
                    <h4 className="font-serif-display font-bold text-lg text-[var(--text-primary)]">
                      {project.location}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-secondary)]">
                      GPS Coordinates: {project.coordinates ? `${project.coordinates.lat}° N, ${project.coordinates.lng}° E` : '34.0522° N, 118.2437° W'}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(project.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider border border-[var(--text-primary)]/10 hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Project Credits & Collaborators */}
            {project.credits && (
              <div id="section-credits" className="pt-8 border-t border-[var(--text-primary)]/10 space-y-6">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-primary)]">
                  Project Team & Credits
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs font-mono">
                  {project.credits.partnerInCharge && (
                    <div>
                      <span className="text-[var(--text-muted)] uppercase block mb-1">PARTNER IN CHARGE</span>
                      <ul className="space-y-1 font-semibold text-[var(--text-primary)]">
                        {project.credits.partnerInCharge.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {project.credits.projectManager && (
                    <div>
                      <span className="text-[var(--text-muted)] uppercase block mb-1">PROJECT MANAGER</span>
                      <ul className="space-y-1 font-semibold text-[var(--text-primary)]">
                        {project.credits.projectManager.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {project.credits.projectLeader && (
                    <div>
                      <span className="text-[var(--text-muted)] uppercase block mb-1">PROJECT LEADER</span>
                      <ul className="space-y-1 font-semibold text-[var(--text-primary)]">
                        {project.credits.projectLeader.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {project.credits.teamMembers && (
                    <div className="sm:col-span-2">
                      <span className="text-[var(--text-muted)] uppercase block mb-1">PROJECT TEAM</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-[var(--text-secondary)]">
                        {project.credits.teamMembers.map((m, i) => (
                          <span key={i}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.credits.collaborators && (
                    <div>
                      <span className="text-[var(--text-muted)] uppercase block mb-1">COLLABORATORS</span>
                      <ul className="space-y-1 font-medium text-[var(--text-secondary)]">
                        {project.credits.collaborators.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Next / Previous Project */}
            <div className="pt-12 border-t border-[var(--text-primary)]/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onSelectProject(prevProject)}
                className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 hover:border-[var(--text-primary)]/30 hover:bg-[var(--bg-card)] text-left transition-all cursor-pointer group flex items-center gap-4"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--accent-warm)] group-hover:-translate-x-1 transition-transform" />
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block">PREVIOUS PROJECT</span>
                  <span className="font-serif-display font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-warm)] transition-colors">
                    {prevProject.title}
                  </span>
                </div>
              </button>

              <button
                onClick={() => onSelectProject(nextProject)}
                className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 hover:border-[var(--text-primary)]/30 hover:bg-[var(--bg-card)] text-right transition-all cursor-pointer group flex items-center justify-end gap-4"
              >
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block">NEXT PROJECT</span>
                  <span className="font-serif-display font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-warm)] transition-colors">
                    {nextProject.title}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--accent-warm)] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
};
