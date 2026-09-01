import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectCategory, User } from '../types';
import { 
  Eye, ArrowLeft, ArrowRight, Grid, MoveHorizontal, Heart, 
  ArrowUpRight, Sparkles, Plus, Trash2
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

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projects,
  currentUser,
  onProjectCreated,
  onProjectDeleted
}) => {
  const navigate = useNavigate();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('all');
  const [viewMode, setViewMode] = useState<'scroller' | 'grid'>('scroller');
  const [likesCount, setLikesCount] = useState<Record<string, number>>({
    'proj-1': 28,
    'proj-2': 42,
    'proj-3': 19,
    'proj-4': 35,
    'proj-5': 51,
    'proj-6': 23
  });
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const categories: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'interior', label: 'Interior' },
    { id: 'commercial', label: 'Commerial' },
    /*{ id: 'sustainable', label: 'Sustainable' }*/
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  // Mouse drag handlers for side scroller

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2.0;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

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

  return (
    <section id="projects" className="py-20 lg:py-28 bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--text-primary)]/10">
      
      {/* Container - Video 1 Header & Layout */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Top Header Bar matching Video 1 */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-xs font-mono tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
            <span>Interactive Project Showcase</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Add Project — visible for admin (and designer) after login */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'designer') && (
              <button
                type="button"
                onClick={() => setIsAddProjectOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] hover:bg-[var(--text-primary)] text-xs font-mono tracking-widest uppercase transition-all cursor-pointer shadow-lg font-bold z-20 relative"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Section Title & Tagline matching Video 1 */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="font-serif-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
            Bespoke Architecture Gallery
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-sans">
            The building you deserve has never been built before.
          </p>
        </div>

        {/* Admin toolbar — Add Project always visible here when logged in as admin */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'designer') && (
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={() => setIsAddProjectOpen(true)}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] hover:bg-[var(--text-primary)] text-sm font-mono tracking-widest uppercase transition-all cursor-pointer shadow-lg font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Project</span>
            </button>
          </div>
        )}

        {/* View Mode & Category Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 border-b border-[var(--text-primary)]/10 pb-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--text-primary)] text-[var(--text-on-accent)] font-bold shadow-md scale-105'
                    : 'glass-pill text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10 hover:text-[var(--text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scroller / Grid Switcher & Nav Buttons */}
          <div className="flex items-center gap-3">
            <div className="glass-pill p-1 rounded-full border border-[var(--text-primary)]/10 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('scroller')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  viewMode === 'scroller'
                    ? 'bg-[var(--text-primary)] text-[var(--text-on-accent)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
                <span>Side Scroller</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--text-primary)] text-[var(--text-on-accent)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>

            {viewMode === 'scroller' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => scrollHorizontal('left')}
                  className="w-9 h-9 rounded-full glass-pill border border-[var(--text-primary)]/15 hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Scroll Left"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollHorizontal('right')}
                  className="w-9 h-9 rounded-full glass-pill border border-[var(--text-primary)]/15 hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Scroll Right"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODE 1: CYLINDRICAL PARABOLIC SIDE-SCROLLER (Video 1 Exact Match) */}
        {viewMode === 'scroller' ? (
          <div className="relative group/scroller">
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex items-center space-x-6 overflow-x-auto py-8 px-4 scrollbar-none cursor-grab active:cursor-grabbing select-none"
              style={{ perspective: '1000px' }}
            >
              {filteredProjects.map((proj, idx) => {
                const liked = userLiked[proj.id];
                const count = likesCount[proj.id] || 24;

                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    onClick={() => openProject(proj)}
                    data-cursor="EXPLORE"
                    className="flex-shrink-0 w-[260px] sm:w-[310px] md:w-[350px] group/card relative glass-card rounded-3xl overflow-hidden border border-[var(--text-primary)]/15 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-[var(--accent-warm)] cursor-pointer"
                  >
                    {/* Top Card Badge & Like / Delete Buttons */}
                    <div className="p-4 flex items-center justify-between border-b border-[var(--text-primary)]/10 bg-[var(--bg-card)]/40">
                      <span className="text-[10px] font-mono tracking-widest text-[var(--text-primary)] uppercase font-bold">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isAdminOrDesigner && (
                          <button
                            onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer bg-red-500/100/10 text-red-600 font-bold border border-red-500/30 hover:bg-red-500/100 hover:text-[var(--text-primary)]"
                            title="Delete project"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => toggleLike(proj.id, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                            liked
                              ? 'bg-rose-500/10 text-rose-600 font-bold border border-rose-500/30'
                              : 'bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{count}</span>
                        </button>
                      </div>
                    </div>

                    {/* Arched Vertical Image Card Frame (Video 1 style) */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-elevated)]">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        draggable={false}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />

                      {/* Title & Location Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-[var(--text-primary)]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)]/80 block mb-0.5">
                          {proj.location}
                        </span>
                        <h3 className="font-serif-display font-bold text-lg sm:text-xl text-[var(--text-primary)] leading-tight group-hover/card:text-[var(--accent-warm)] transition-colors">
                          {proj.title}
                        </h3>
                      </div>

                      {/* Hover Open "View Project" Button with smooth expanding hover animation */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <span className="px-5 py-2.5 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] text-xs font-mono uppercase tracking-widest font-bold shadow-xl flex items-center gap-2 transform translate-y-3 group-hover/card:translate-y-0 transition-all duration-300 ease-out cursor-pointer group/btn">
                          <Eye className="w-3.5 h-3.5 text-[var(--accent-warm)] group-hover/btn:scale-110 transition-transform" />
                          <span className="whitespace-nowrap">View Project</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover/card:opacity-100 group-hover/card:ml-0 transition-all duration-300 text-[var(--accent-warm)]" />
                        </span>
                      </div>
                    </div>

                    {/* Bottom Card Footer */}
                    <div className="p-4 bg-[var(--bg-card)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                      <span>{proj.areaSqFt}</span>
                      <span className="text-[var(--accent-warm)] font-semibold flex items-center gap-1 group-hover/card:translate-x-1.5 transition-transform duration-300">
                        View Project <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:translate-x-1 group-hover/card:-translate-y-0.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MODE 2: GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj) => (
              <motion.div
                key={proj.id}
                layout
                onClick={() => openProject(proj)}
                className="group/grid relative bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--text-primary)]/10 hover:border-[var(--accent-warm)] transition-all cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-elevated)]">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/grid:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  <span className="absolute top-3 left-3 bg-[var(--text-primary)]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono uppercase text-[var(--text-on-accent)]">
                    {proj.category}
                  </span>
                  {isAdminOrDesigner && (
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                      className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500/100/90 text-[var(--text-primary)] text-[10px] font-mono font-bold hover:bg-red-600 transition-all cursor-pointer shadow-md"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                    <span>{proj.location}</span>
                    <span>{proj.year}</span>
                  </div>
                  <h3 className="font-serif-display font-bold text-xl text-[var(--text-primary)] group-hover/grid:text-[var(--accent-warm)] transition-colors mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
                    {proj.description}
                  </p>
                  <div className="pt-4 border-t border-[var(--text-primary)]/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)] font-medium">{proj.areaSqFt}</span>
                    <span className="px-4 py-1.5 rounded-full bg-[var(--text-primary)]/5 group-hover/grid:bg-[var(--accent-warm)] text-[var(--accent-warm)] group-hover/grid:text-[var(--text-primary)] font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-sm">
                      <span>View Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/grid:translate-x-0.5 group-hover/grid:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Video 1 Bottom Subtext & Action CTA */}
        <div className="mt-16 text-center max-w-2xl mx-auto space-y-6 pt-10 border-t border-[var(--text-primary)]/10">
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
            We design private residences and commercial spaces from a blank page. No templates, no repeated floorplans, no shortcuts.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
          </div>
        </div>

      </div>

      {/* Admin: Add Project Modal */}
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
