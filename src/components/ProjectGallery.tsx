import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectCategory, User } from '../types';
import {
  Eye, Grid, Layers, Heart, ArrowUpRight, Sparkles, Plus, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { AddProjectModal } from './AddProjectModal';
import { projectsApi } from '../services/api';

interface ProjectGalleryProps {
  projects: Project[];
  currentUser?: User | null;
  onProjectCreated?: (project: Project) => void;
  onProjectDeleted?: (projectId: string) => void;
}

const smoothStep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Each project transition uses ~100vh of scroll (like the HTML reference)
const VH_PER_SLIDE = 100;

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projects,
  currentUser,
  onProjectCreated,
  onProjectDeleted
}) => {
  const navigate = useNavigate();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('all');
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [likesCount, setLikesCount] = useState<Record<string, number>>({
    'proj-1': 28,
    'proj-2': 42,
    'proj-3': 19,
    'proj-4': 35,
    'proj-5': 51,
    'proj-6': 23
  });
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const categories: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'interior', label: 'Interior' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const stackCount = filteredProjects.length;
  // Total scroll height: first slide visible + (n-1) transitions
  const stageHeightVh = stackCount > 1 ? stackCount * VH_PER_SLIDE : 100;

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserLiked(prev => {
      const isLiked = !prev[id];
      setLikesCount(curr => ({
        ...curr,
        [id]: (curr[id] || 20) + (isLiked ? 1 : -1)
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  const handleDeleteProject = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete project "${title}"? This cannot be undone.`)) return;
    try {
      await projectsApi.remove(id);
      onProjectDeleted?.(id);
    } catch (err) {
      console.error('Failed to delete project', err);
      alert('Could not delete project. Please try again.');
    }
  };

  const openProject = (proj: Project) => {
    navigate(`/project/${proj.id}`);
  };

  const isAdminOrDesigner = currentUser?.role === 'admin' || currentUser?.role === 'designer';

  // Clean one-by-one slide transition (matches HTML reference)
  const renderSlides = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || stackCount <= 1) return;

    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    const distance = stage.offsetHeight - vh;
    const progress = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0;

    const exact = progress * (stackCount - 1);
    const index = Math.min(Math.floor(exact), stackCount - 1);
    const t = index === stackCount - 1 ? 0 : smoothStep(exact - index);

    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;

      if (i === index) {
        // Active: sliding up and out
        slide.style.visibility = 'visible';
        slide.style.transform = `translateY(${-t * 100}%)`;
        slide.style.zIndex = '2';
        slide.style.pointerEvents = t < 0.5 ? 'auto' : 'none';
      } else if (i === index + 1) {
        // Incoming: sliding up from below
        slide.style.visibility = 'visible';
        slide.style.transform = `translateY(${(1 - t) * 100}%)`;
        slide.style.zIndex = '3';
        slide.style.pointerEvents = t >= 0.5 ? 'auto' : 'none';
      } else if (i < index) {
        // Already passed
        slide.style.visibility = 'hidden';
        slide.style.transform = 'translateY(-100%)';
        slide.style.zIndex = '1';
        slide.style.pointerEvents = 'none';
      } else {
        // Not yet reached
        slide.style.visibility = 'hidden';
        slide.style.transform = 'translateY(100%)';
        slide.style.zIndex = '1';
        slide.style.pointerEvents = 'none';
      }
    });
  }, [stackCount]);

  useEffect(() => {
    if (viewMode !== 'stack' || stackCount <= 1) return;

    let frameId = requestAnimationFrame(function loop() {
      renderSlides();
      frameId = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(frameId);
  }, [viewMode, stackCount, renderSlides]);

  // Reset refs when filtered list changes
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, stackCount);
  }, [stackCount]);

  return (
    <section
      id="projects"
      className="relative border-0 outline-none"
      style={{ background: '#f4f4f1', color: '#fff', borderTop: 'none', boxShadow: 'none' }}
    >
      {/* ── Header area ── */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 lg:pt-28 pb-10 relative z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          {/*<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 text-white/80 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Project Showcase</span>
          </div>*/}

          {(currentUser?.role === 'admin' || currentUser?.role === 'designer') && (
            <button
              type="button"
              onClick={() => setIsAddProjectOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-black hover:bg-white text-xs font-mono tracking-widest uppercase transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2
            className="font-extrabold tracking-tight text-black mb-3 translate-y-[-80px]"
            style={{
              fontSize: 'clamp(90px, 20vw, 120px)',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
            }}
          >
            PROJECTS
          </h2>
          {/*<p className="text-sm sm:text-base text-white/50 tracking-wide">
            The building you deserve has never been built before.
          </p>*/}
        </div>

        {/* Category + View controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold'
                    : 'text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('stack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                viewMode === 'stack'
                  ? 'bg-white text-black font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scroll Through</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {viewMode === 'stack' && stackCount > 1 && (
          <p className="text-center text-[11px] tracking-[0.18em] uppercase text-white/40 mb-6">
            {/*Scroll slowly — each project replaces the previous one*/}
          </p>
        )}
      </div>

      {/* ── MODE 1: CLEAN ONE-BY-ONE STACK ── */}
      {viewMode === 'stack' ? (
        stackCount === 0 ? (
          <div className="py-24 text-center text-white/40">
            No projects to show in this category yet.
          </div>
        ) : stackCount === 1 ? (
          /* Single project — no transition needed */
          <div className="px-4 sm:px-6 lg:px-12 pb-20">
            <div className="mx-auto" style={{ maxWidth: 1400 }}>
              <SingleProjectCard
                proj={filteredProjects[0]}
                index={0}
                total={1}
                liked={!!userLiked[filteredProjects[0].id]}
                likeCount={likesCount[filteredProjects[0].id] || 24}
                isAdmin={isAdminOrDesigner}
                onOpen={openProject}
                onLike={toggleLike}
                onDelete={handleDeleteProject}
              />
            </div>
          </div>
        ) : (
          /* Multi-project scroll transition */
          <div
            ref={stageRef}
            className="relative"
            style={{ height: `${stageHeightVh}vh` }}
          >
            <div
              ref={stickyRef}
              className="sticky top-0 h-screen overflow-hidden"
              style={{ background: '#f4f4f1' }}
            >
              {filteredProjects.map((proj, idx) => {
                const liked = !!userLiked[proj.id];
                const count = likesCount[proj.id] || 24;

                return (
                  <article
                    key={proj.id}
                    ref={(el) => { slideRefs.current[idx] = el; }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      padding: 'clamp(12px, 3vw, 50px)',
                      visibility: idx === 0 ? 'visible' : 'hidden',
                      transform: idx === 0 ? 'translateY(0)' : 'translateY(100%)',
                      willChange: 'transform',
                    }}
                    onClick={() => openProject(proj)}
                  >
                    <div
                      className="w-full grid grid-cols-1 md:grid-cols-[60%_40%] overflow-hidden cursor-pointer"
                      style={{
                        maxWidth: 1400,
                        height: 'min(680px, calc(100vh - 100px))',
                        background: '#000',
                        border: '1px solid #292929',
                        borderRadius: 22,
                      }}
                    >
                      {/* Text side */}
                      <div
                        className="flex flex-col order-2 md:order-2"
                        style={{ padding: 'clamp(22px, 3vw, 45px)' }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <span
                            style={{
                              fontSize: 11,
                              color: '#777',
                              letterSpacing: '0.12em',
                            }}
                          >
                            {String(idx + 1).padStart(2, '0')} / {String(stackCount).padStart(2, '0')}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isAdminOrDesigner && (
                              <button
                                onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white"
                                title="Delete project"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => toggleLike(proj.id, e)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                                liked
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${liked ? 'fill-rose-400 text-rose-400' : ''}`} />
                              <span>{count}</span>
                            </button>
                          </div>
                        </div>

                        <h3
                          className="font-bold text-white"
                          style={{
                            fontSize: 'clamp(36px, 5vw, 72px)',
                            lineHeight: 0.88,
                            letterSpacing: '-0.06em',
                            margin: 0,
                          }}
                        >
                          {proj.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-6">
                          <span
                            className="text-[10px] px-2.5 py-2 rounded-md"
                            style={{ background: '#242424', color: '#ccc' }}
                          >
                            {(proj.category || '').toUpperCase()}
                          </span>
                          {proj.location && (
                            <span
                              className="text-[10px] px-2.5 py-2 rounded-md"
                              style={{ background: '#242424', color: '#ccc' }}
                            >
                              {proj.location.toUpperCase()}
                            </span>
                          )}
                          {proj.year && (
                            <span
                              className="text-[10px] px-2.5 py-2 rounded-md"
                              style={{ background: '#242424', color: '#ccc' }}
                            >
                              {String(proj.year).toUpperCase()}
                            </span>
                          )}
                          {proj.areaSqFt && (
                            <span
                              className="text-[10px] px-2.5 py-2 rounded-md"
                              style={{ background: '#242424', color: '#ccc' }}
                            >
                              {proj.areaSqFt}
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-auto text-[14px] leading-relaxed max-w-[420px]"
                          style={{ color: '#aaa', marginTop: 'auto', paddingTop: 24 }}
                        >
                          {proj.description}
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProject(proj);
                          }}
                          className="mt-5 w-max inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#444] text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View project
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Photo side */}
                      <div
                        className="relative order-1 md:order-1 overflow-hidden"
                        style={{ padding: 15 }}
                      >
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover block"
                          style={{ borderRadius: 15 }}
                          draggable={false}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* ── MODE 2: GRID VIEW ── */
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <motion.div
                key={proj.id}
                layout
                onClick={() => openProject(proj)}
                className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col"
                style={{ background: '#0a0a0a' }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono uppercase text-white/90">
                    {proj.category}
                  </span>
                  {isAdminOrDesigner && (
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                      className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500/90 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-all cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-2">
                    <span>{proj.location}</span>
                    <span>{proj.year}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {proj.description}
                  </p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">{proj.areaSqFt}</span>
                    <span className="inline-flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors">
                      View Project
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom text */}
      <div className="max-w-2xl mx-auto text-center px-4 pb-20 pt-10 border-t border-white/10">
        <p className="text-sm text-white/40 leading-relaxed">
          We design private residences and commercial spaces from a blank page. No templates, no repeated floorplans, no shortcuts.
        </p>
      </div>

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onCreated={(proj) => {
          if (onProjectCreated) onProjectCreated(proj);
        }}
      />
    </section>
  );
};

/* ── Single project card (when only 1 project) ── */
function SingleProjectCard({
  proj,
  index,
  total,
  liked,
  likeCount,
  isAdmin,
  onOpen,
  onLike,
  onDelete,
}: {
  proj: Project;
  index: number;
  total: number;
  liked: boolean;
  likeCount: number;
  isAdmin: boolean;
  onOpen: (p: Project) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, title: string, e: React.MouseEvent) => void;
}) {
  return (
    <article
      onClick={() => onOpen(proj)}
      className="grid grid-cols-1 md:grid-cols-[60%_40%] overflow-hidden cursor-pointer"
      style={{
        height: 'min(680px, calc(100vh - 200px))',
        background: '#000',
        border: '1px solid #292929',
        borderRadius: 22,
      }}
    >
      <div className="flex flex-col order-2 md:order-2" style={{ padding: 'clamp(22px, 3vw, 45px)' }}>
        <div className="flex items-center justify-between mb-6">
          <span style={{ fontSize: 11, color: '#777', letterSpacing: '0.12em' }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={(e) => onDelete(proj.id, proj.title, e)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => onLike(proj.id, e)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer ${
                liked
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-white/5 text-white/50 border border-white/10'
              }`}
            >
              <Heart className={`w-3 h-3 ${liked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>

        <h3
          className="font-bold text-white"
          style={{
            fontSize: 'clamp(36px, 5vw, 72px)',
            lineHeight: 0.88,
            letterSpacing: '-0.06em',
            margin: 0,
          }}
        >
          {proj.title}
        </h3>

        <div className="flex flex-wrap gap-2 mt-6">
          <span className="text-[10px] px-2.5 py-2 rounded-md" style={{ background: '#242424', color: '#ccc' }}>
            {(proj.category || '').toUpperCase()}
          </span>
          {proj.location && (
            <span className="text-[10px] px-2.5 py-2 rounded-md" style={{ background: '#242424', color: '#ccc' }}>
              {proj.location.toUpperCase()}
            </span>
          )}
          {proj.year && (
            <span className="text-[10px] px-2.5 py-2 rounded-md" style={{ background: '#242424', color: '#ccc' }}>
              {String(proj.year).toUpperCase()}
            </span>
          )}
        </div>

        <p className="mt-auto text-[14px] leading-relaxed max-w-[420px]" style={{ color: '#aaa', paddingTop: 24 }}>
          {proj.description}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(proj);
          }}
          className="mt-5 w-max inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#444] text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          View project
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative order-1 md:order-1 overflow-hidden" style={{ padding: 15 }}>
        <img
          src={proj.imageUrl}
          alt={proj.title}
          className="w-full h-full object-cover block"
          style={{ borderRadius: 15 }}
          draggable={false}
        />
      </div>
    </article>
  );
}
