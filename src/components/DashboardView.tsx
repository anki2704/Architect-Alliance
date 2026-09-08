import React, { useState, useEffect } from 'react';
import {
  User,
  Booking,
  ContactMessage,
  Project,
  TeamMember,
  Testimonial,
  JournalArticle
} from '../types';
import {
  bookingsApi,
  messagesApi,
  usersApi,
  projectsApi,
  teamApi,
  testimonialsApi,
  journalApi,
  ApiError
} from '../services/api';
import { ProjectDetailView } from './ProjectDetailView';
import { AddJournalModal } from './AddJournalModal';
import {
  Calendar,
  Mail,
  LogOut,
  Loader2,
  Users,
  Trash2,
  Plus,
  LayoutDashboard,
  FolderKanban,
  Bell,
  Settings,
  BookOpen,
  MessageSquareQuote,
  Image,
  UserCircle2,
  ChevronDown,
  Eye,
  Star,
  MapPin
} from 'lucide-react';

interface DashboardViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLogout: () => void;
}

type NavId =
  | 'overview'
  | 'projects'
  | 'appointments'
  | 'enquiries'
  | 'designers'
  | 'team'
  | 'journal'
  | 'testimonials'
  | 'media'
  | 'settings';

const NAV_ITEMS: { id: NavId; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
  { id: 'enquiries', label: 'Enquiries', icon: <Mail className="w-4 h-4" />, adminOnly: true },
  { id: 'designers', label: 'Designers', icon: <Users className="w-4 h-4" />, adminOnly: true },
  { id: 'team', label: 'Team', icon: <UserCircle2 className="w-4 h-4" />, adminOnly: true },
  { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" />, adminOnly: true },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className="w-4 h-4" />, adminOnly: true },
  { id: 'media', label: 'Media', icon: <Image className="w-4 h-4" />, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout
}) => {
  const [activeNav, setActiveNav] = useState<NavId>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [designers, setDesigners] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [journal, setJournal] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  /** Red dot hides after panel is opened; returns only when new items arrive. */
  const [notifSeenCount, setNotifSeenCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);

  const [isAddingDesigner, setIsAddingDesigner] = useState(false);
  const [newDesignerName, setNewDesignerName] = useState('');
  const [newDesignerEmail, setNewDesignerEmail] = useState('');
  const [newDesignerPassword, setNewDesignerPassword] = useState('');
  const [designerFormError, setDesignerFormError] = useState('');
  const [isSavingDesigner, setIsSavingDesigner] = useState(false);

  const role = currentUser.role;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const base: Promise<unknown>[] = [
        bookingsApi.list(),
        projectsApi.list(),
        teamApi.list(),
        testimonialsApi.list(),
        journalApi.list()
      ];
      if (role === 'admin') {
        base.push(messagesApi.list());
        base.push(usersApi.list('designer'));
      }
      const results = await Promise.all(base);
      setBookings(results[0] as Booking[]);
      setProjects(results[1] as Project[]);
      setTeam(results[2] as TeamMember[]);
      setTestimonials(results[3] as Testimonial[]);
      setJournal(results[4] as JournalArticle[]);
      if (role === 'admin') {
        setMessages(results[5] as ContactMessage[]);
        setDesigners(results[6] as User[]);
      }
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isOpen]);

  useEffect(() => {
    if (isOpen && (window as any).lenis) (window as any).lenis.stop();
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bookingsApi.update(id, { status: status as Booking['status'] });
      fetchDashboardData();
    } catch (e) {
      console.error('Error updating booking status', e);
    }
  };

  const handleAssignDesigner = async (id: string, assignedDesignerId: string) => {
    try {
      await bookingsApi.update(id, { assignedDesignerId: assignedDesignerId || null });
      fetchDashboardData();
    } catch (e) {
      console.error('Error assigning designer', e);
    }
  };

  const handleAddDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    setDesignerFormError('');
    if (!newDesignerName.trim() || !newDesignerEmail.trim() || !newDesignerPassword) {
      setDesignerFormError('Name, email, and password are required.');
      return;
    }
    if (newDesignerPassword.length < 6) {
      setDesignerFormError('Password must be at least 6 characters.');
      return;
    }
    setIsSavingDesigner(true);
    try {
      await usersApi.createDesigner(
        newDesignerName.trim(),
        newDesignerEmail.trim(),
        newDesignerPassword
      );
      setNewDesignerName('');
      setNewDesignerEmail('');
      setNewDesignerPassword('');
      setIsAddingDesigner(false);
      fetchDashboardData();
    } catch (e) {
      setDesignerFormError(e instanceof ApiError ? e.message : 'Could not create designer account.');
    } finally {
      setIsSavingDesigner(false);
    }
  };

  const handleRemoveDesigner = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}'s designer account? This can't be undone.`)) return;
    try {
      await usersApi.removeDesigner(id);
      fetchDashboardData();
    } catch (e) {
      console.error('Error removing designer', e);
    }
  };

  const handleDeleteProject = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete project "${title}"?`)) return;
    try {
      await projectsApi.remove(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (err) {
      alert('Could not delete project.');
    }
  };

  const handleDeleteJournalArticle = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete article "${title}"?`)) return;
    try {
      await journalApi.remove(id);
      setJournal((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Could not delete article.');
    }
  };

  const visibleNav = NAV_ITEMS.filter((n) => !n.adminOnly || role === 'admin');

  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const notifCount =
    pendingBookings + (role === 'admin' ? messages.length : 0);
  const showNotifDot = notifCount > notifSeenCount;

  const statCards = [
    {
      label: 'Projects',
      value: projects.length,
      accent: 'from-[var(--accent-warm)]/20 to-[var(--accent-warm)]/10 border-[var(--accent-warm)]/30'
    },
    {
      label: 'Appointments',
      value: bookings.length,
      accent: 'from-sky-500/20 to-blue-600/10 border-sky-500/30'
    },
    {
      label: 'Enquiries',
      value: role === 'admin' ? messages.length : '—',
      accent: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30'
    }
  ];

  // Collect media from projects
  const mediaItems = projects.flatMap((p) => {
    const urls = [p.imageUrl, ...(p.imageGallery || [])].filter(Boolean);
    return [...new Set(urls)].map((url, i) => ({
      id: `${p.id}-${i}`,
      url,
      title: p.title,
      projectId: p.id
    }));
  });

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Top bar */}
      <header className="h-14 sm:h-16 shrink-0 border-b border-[var(--text-primary)]/10 bg-[var(--bg-surface)] flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/images/brand/logo-new.png"
            alt="Architecture Alliance"
            className="h-9 w-auto object-contain rounded"
          />
          <span className="font-serif-display font-bold text-sm sm:text-base tracking-wide truncate">
            Architecture Alliance
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((v) => {
                  const next = !v;
                  if (next) setNotifSeenCount(notifCount);
                  return next;
                });
                setRoleMenuOpen(false);
              }}
              className="relative w-9 h-9 rounded-full bg-[var(--bg-card)]/5 border border-[var(--text-primary)]/10 flex items-center justify-center hover:bg-[var(--bg-card)]/10 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              {showNotifDot && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/15 shadow-2xl z-30">
                <div className="px-4 py-3 border-b border-[var(--text-primary)]/10 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="py-1">
                  {bookings.filter((b) => b.status === 'Pending').length === 0 &&
                    !(role === 'admin' && messages.length > 0) && (
                      <p className="px-4 py-6 text-center text-xs text-slate-500">
                        No new notifications
                      </p>
                    )}

                  {bookings
                    .filter((b) => b.status === 'Pending')
                    .slice(0, 8)
                    .map((b) => (
                      <button
                        key={`booking-${b.id}`}
                        type="button"
                        onClick={() => {
                          setActiveNav('appointments');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-card)]/5 border-b border-[var(--text-primary)]/5 cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-warm)] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-100 truncate">
                              New booking — {b.customerName}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                              {b.projectType} · {b.date} {b.time}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}

                  {role === 'admin' &&
                    messages.slice(0, 8).map((m) => (
                      <button
                        key={`msg-${m.id}`}
                        type="button"
                        onClick={() => {
                          setActiveNav('enquiries');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-card)]/5 border-b border-[var(--text-primary)]/5 cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-100 truncate">
                              Enquiry — {m.name}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                              {m.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)]/5 border border-[var(--text-primary)]/15 text-xs font-semibold hover:bg-[var(--bg-card)]/10 cursor-pointer"
            >
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-on-accent)] text-[10px] font-bold uppercase">
                {role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/15 shadow-xl py-1 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/10 cursor-pointer"
                >
                  Back to website
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/100/10 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/100/20 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[200px] sm:w-[220px] shrink-0 border-r border-[var(--text-primary)]/10 bg-[var(--bg-surface)] overflow-y-auto hidden md:flex flex-col py-4">
          <nav className="flex flex-col gap-0.5 px-3">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                  activeNav === item.id
                    ? 'bg-[var(--accent-warm)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/10 hover:text-[var(--text-primary)]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 border-t border-[var(--text-primary)]/10 bg-[var(--bg-surface)] px-2 py-2 overflow-x-auto flex gap-1">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                activeNav === item.id
                  ? 'bg-[var(--accent-warm)] text-white'
                  : 'text-[var(--text-muted)] bg-[var(--bg-card)]/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm py-16 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading dashboard…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="text-center text-red-300 text-sm py-10">{loadError}</div>
          )}

          {!isLoading && !loadError && (
            <>
              {/* ════ OVERVIEW ════ */}
              {activeNav === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-serif-display text-2xl sm:text-3xl font-bold">
                      Dashboard Overview
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Welcome back, <strong className="text-[var(--text-primary)]">{currentUser.name}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {statCards.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          if (s.label === 'Projects') setActiveNav('projects');
                          if (s.label === 'Appointments') setActiveNav('appointments');
                          if (s.label === 'Enquiries') setActiveNav('enquiries');
                        }}
                        className={`rounded-2xl border bg-gradient-to-br p-5 text-left cursor-pointer hover:scale-[1.02] transition-transform ${s.accent}`}
                      >
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mt-1">
                          {s.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 p-5">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                        Recent Appointments
                      </h2>
                      {bookings.length === 0 ? (
                        <p className="text-sm text-slate-500">No appointments yet.</p>
                      ) : (
                        <ul className="space-y-3">
                          {bookings.slice(0, 5).map((b) => (
                            <li
                              key={b.id}
                              className="flex items-center justify-between text-xs border-b border-[var(--text-primary)]/5 pb-2"
                            >
                              <span>
                                <strong className="text-[var(--text-primary)]">{b.customerName}</strong>
                                <span className="text-[var(--text-muted)]"> · {b.projectType}</span>
                              </span>
                              <span className="text-slate-500">
                                {b.date} · {b.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 p-5">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                        Quick stats
                      </h2>
                      <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                        <li className="flex justify-between">
                          <span>Team members</span>
                          <strong className="text-[var(--text-primary)]">{team.length}</strong>
                        </li>
                        <li className="flex justify-between">
                          <span>Journal posts</span>
                          <strong className="text-[var(--text-primary)]">{journal.length}</strong>
                        </li>
                        <li className="flex justify-between">
                          <span>Testimonials</span>
                          <strong className="text-[var(--text-primary)]">{testimonials.length}</strong>
                        </li>
                        <li className="flex justify-between">
                          <span>Media assets</span>
                          <strong className="text-[var(--text-primary)]">{mediaItems.length}</strong>
                        </li>
                        {role === 'admin' && (
                          <li className="flex justify-between">
                            <span>Designer accounts</span>
                            <strong className="text-[var(--text-primary)]">{designers.length}</strong>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PROJECTS ════ */}
              {activeNav === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="font-serif-display text-2xl font-bold">Projects</h1>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Tap a project to open full details
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{projects.length} total</span>
                  </div>

                  {/* Card grid — clickable */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.length === 0 ? (
                      <p className="text-sm text-slate-500 col-span-full py-8 text-center">
                        No projects yet. Add projects from the website gallery when logged in.
                      </p>
                    ) : (
                      projects.map((p) => (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedProject(p)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedProject(p);
                          }}
                          className="group rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 overflow-hidden cursor-pointer hover:border-[var(--accent-warm)]/60 hover:bg-[var(--bg-card)]/[0.07] transition-all text-left"
                        >
                          <div className="relative aspect-[16/10] bg-[var(--bg-card)]">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold uppercase tracking-wider">
                              {p.category}
                            </span>
                            {(role === 'admin' || role === 'designer') && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteProject(p.id, p.title, e)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/100/80 text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] text-[var(--text-on-accent)] text-[11px] font-bold flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Open project
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-warm)] transition-colors">
                              {p.title}
                            </h3>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.location} · {p.year}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ════ APPOINTMENTS ════ */}
              {activeNav === 'appointments' && (
                <div className="space-y-4">
                  <h1 className="font-serif-display text-2xl font-bold">Appointments</h1>
                  <div className="rounded-2xl border border-[var(--text-primary)]/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[var(--bg-card)]/10 text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                            <th className="p-3">Client</th>
                            <th className="p-3">Project</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            {role === 'admin' && <th className="p-3">Architect</th>}
                            {role !== 'customer' && <th className="p-3">Action</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">
                                No consultations scheduled yet.
                              </td>
                            </tr>
                          ) : (
                            bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-[var(--bg-card)]/5">
                                <td className="p-3 font-semibold">
                                  {b.customerName}
                                  <div className="text-[11px] font-normal text-[var(--text-muted)]">{b.email}</div>
                                </td>
                                <td className="p-3">{b.projectType}</td>
                                <td className="p-3">
                                  <span className="font-semibold">{b.date}</span>
                                  <div className="text-[11px] text-[var(--text-muted)]">{b.time}</div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      b.status === 'Confirmed'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : b.status === 'Pending'
                                          ? 'bg-[var(--accent-warm)]/20 text-[var(--accent-amber)] border border-[var(--accent-warm)]/40'
                                          : 'bg-[var(--bg-surface)]0/20 text-[var(--text-secondary)] border border-[var(--text-primary)]/20'
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </td>
                                {role === 'admin' && (
                                  <td className="p-3">
                                    <select
                                      value={b.assignedDesignerId || ''}
                                      onChange={(e) => handleAssignDesigner(b.id, e.target.value)}
                                      className="px-2 py-1 rounded-xl text-xs text-[var(--text-primary)] bg-[var(--bg-main)] border border-[var(--text-primary)]/20"
                                    >
                                      <option value="">Unassigned</option>
                                      {designers.map((d) => (
                                        <option key={d.id} value={d.id}>
                                          {d.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                )}
                                {role !== 'customer' && (
                                  <td className="p-3">
                                    <select
                                      value={b.status}
                                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                                      className="px-2 py-1 rounded-xl text-xs text-[var(--text-primary)] bg-[var(--bg-main)] border border-[var(--text-primary)]/20"
                                    >
                                      {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(
                                        (s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ ENQUIRIES ════ */}
              {activeNav === 'enquiries' && role === 'admin' && (
                <div className="space-y-4">
                  <h1 className="font-serif-display text-2xl font-bold">Contact Enquiries</h1>
                  <div className="rounded-2xl border border-[var(--text-primary)]/10 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[var(--bg-card)]/10 text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                          <th className="p-3">Sender</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {messages.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                              No contact inquiries recorded.
                            </td>
                          </tr>
                        ) : (
                          messages.map((m) => (
                            <tr key={m.id} className="hover:bg-[var(--bg-card)]/5">
                              <td className="p-3 font-semibold">{m.name}</td>
                              <td className="p-3 text-[var(--text-muted)]">{m.email}</td>
                              <td className="p-3">{m.subject || '—'}</td>
                              <td className="p-3 max-w-xs text-[var(--text-secondary)]">
                                <p className="line-clamp-3">{m.message}</p>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════ DESIGNERS ════ */}
              {activeNav === 'designers' && role === 'admin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h1 className="font-serif-display text-2xl font-bold">Designers</h1>
                    <button
                      onClick={() => {
                        setIsAddingDesigner((v) => !v);
                        setDesignerFormError('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-on-accent)] text-xs font-bold cursor-pointer hover:bg-[var(--bg-card)]/90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Designer
                    </button>
                  </div>

                  {isAddingDesigner && (
                    <form
                      onSubmit={handleAddDesigner}
                      className="p-4 rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 space-y-3"
                    >
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Full name"
                          value={newDesignerName}
                          onChange={(e) => setNewDesignerName(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] placeholder-slate-500 text-xs border border-[var(--text-primary)]/20"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newDesignerEmail}
                          onChange={(e) => setNewDesignerEmail(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] placeholder-slate-500 text-xs border border-[var(--text-primary)]/20"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={newDesignerPassword}
                          onChange={(e) => setNewDesignerPassword(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] placeholder-slate-500 text-xs border border-[var(--text-primary)]/20"
                        />
                      </div>
                      {designerFormError && (
                        <p className="text-xs text-red-300 bg-red-500/100/10 border border-red-500/30 rounded-lg px-3 py-2">
                          {designerFormError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingDesigner}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/90 text-[var(--text-primary)] text-xs font-bold cursor-pointer disabled:opacity-60"
                      >
                        {isSavingDesigner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Create Account
                      </button>
                    </form>
                  )}

                  <div className="rounded-2xl border border-[var(--text-primary)]/10 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[var(--bg-card)]/10 text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                          <th className="p-3">Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {designers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-500">
                              No designer accounts yet.
                            </td>
                          </tr>
                        ) : (
                          designers.map((d) => (
                            <tr key={d.id} className="hover:bg-[var(--bg-card)]/5">
                              <td className="p-3 font-semibold">{d.name}</td>
                              <td className="p-3 text-[var(--text-muted)]">{d.email}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleRemoveDesigner(d.id, d.name)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/100/10 text-red-300 border border-red-500/30 hover:bg-red-500/100/20 cursor-pointer text-[11px] font-semibold"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════ TEAM ════ */}
              {activeNav === 'team' && (
                <div className="space-y-4">
                  <h1 className="font-serif-display text-2xl font-bold">Team</h1>
                  <p className="text-xs text-[var(--text-muted)]">Public team members shown on the website</p>
                  {team.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No team members found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 overflow-hidden flex gap-4 p-4"
                        >
                          <img
                            src={m.image}
                            alt={m.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[var(--bg-card)]"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">{m.name}</h3>
                            <p className="text-[11px] text-[var(--accent-warm)] font-medium">{m.role}</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-3">{m.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════ JOURNAL ════ */}
              {activeNav === 'journal' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h1 className="font-serif-display text-2xl font-bold">Journal</h1>
                      <p className="text-xs text-[var(--text-muted)]">Articles from the site journal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArticle(null);
                        setIsJournalModalOpen(true);
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--accent-warm)] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Article
                    </button>
                  </div>
                  {journal.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No journal posts yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {journal.map((a) => (
                        <article
                          key={a.id}
                          onClick={() => {
                            setEditingArticle(a);
                            setIsJournalModalOpen(true);
                          }}
                          className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:border-[var(--accent-warm)]/40 transition-colors group"
                        >
                          {a.image && (
                            <img
                              src={a.image}
                              alt={a.title}
                              className="sm:w-36 h-28 sm:h-auto object-cover shrink-0 bg-[var(--bg-card)]"
                            />
                          )}
                          <div className="p-4 min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-warm)]">
                                {a.category} · {a.readTime}
                              </span>
                              <h3 className="font-semibold text-sm text-[var(--text-primary)] mt-1">{a.title}</h3>
                              <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">{a.excerpt}</p>
                              <p className="text-[10px] text-slate-500 mt-2">
                                {a.author} · {a.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-warm)]">
                                Click to edit
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteJournalArticle(a.id, a.title, e)}
                                className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════ TESTIMONIALS ════ */}
              {activeNav === 'testimonials' && (
                <div className="space-y-4">
                  <h1 className="font-serif-display text-2xl font-bold">Testimonials</h1>
                  {testimonials.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No testimonials yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonials.map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 p-5 space-y-3"
                        >
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (t.rating || 0)
                                    ? 'fill-[var(--accent-warm)] text-[var(--accent-warm)]'
                                    : 'text-[var(--text-secondary)]'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed">“{t.quote}”</p>
                          <div className="flex items-center gap-3 pt-1">
                            {t.avatar && (
                              <img
                                src={t.avatar}
                                alt={t.name}
                                className="w-9 h-9 rounded-full object-cover bg-[var(--bg-card)]"
                              />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════ MEDIA ════ */}
              {activeNav === 'media' && (
                <div className="space-y-4">
                  <div>
                    <h1 className="font-serif-display text-2xl font-bold">Media Library</h1>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Images used across projects ({mediaItems.length} files)
                    </p>
                  </div>
                  {mediaItems.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No media assets yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {mediaItems.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            const proj = projects.find((p) => p.id === m.projectId);
                            if (proj) {
                              setSelectedProject(proj);
                            }
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--text-primary)]/10 bg-[var(--bg-card)] cursor-pointer hover:border-[var(--accent-warm)]/50"
                        >
                          <img
                            src={m.url}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-[10px] font-semibold text-[var(--text-primary)] truncate">{m.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════ SETTINGS ════ */}
              {activeNav === 'settings' && (
                <div className="space-y-4 max-w-lg">
                  <h1 className="font-serif-display text-2xl font-bold">Settings</h1>
                  <div className="rounded-2xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/5 p-5 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Account
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4 border-b border-[var(--text-primary)]/5 pb-2">
                        <span className="text-[var(--text-muted)]">Name</span>
                        <span className="font-semibold text-[var(--text-primary)] text-right">{currentUser.name}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--text-primary)]/5 pb-2">
                        <span className="text-[var(--text-muted)]">Email</span>
                        <span className="font-semibold text-[var(--text-primary)] text-right break-all">
                          {currentUser.email}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-[var(--text-primary)]/5 pb-2">
                        <span className="text-[var(--text-muted)]">Role</span>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-on-accent)] text-[10px] font-bold uppercase">
                          {currentUser.role}
                        </span>
                      </div>
                      {currentUser.phone && (
                        <div className="flex justify-between gap-4 border-b border-[var(--text-primary)]/5 pb-2">
                          <span className="text-[var(--text-muted)]">Phone</span>
                          <span className="font-semibold text-[var(--text-primary)]">{currentUser.phone}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 pt-2">
                      To change password, use <strong className="text-[var(--text-secondary)]">Forgot password</strong> on
                      the login screen.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/100/15 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/100/25 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log out of account
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Project detail overlay — opens when a project card is tapped */}
      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          projects={projects}
          onClose={() => setSelectedProject(null)}
          onSelectProject={(p) => setSelectedProject(p)}
        />
      )}

      {/* Add / edit journal article overlay */}
      <AddJournalModal
        isOpen={isJournalModalOpen}
        article={editingArticle}
        onClose={() => {
          setIsJournalModalOpen(false);
          setEditingArticle(null);
        }}
        onCreated={(article) => setJournal((prev) => [article, ...prev])}
        onUpdated={(article) =>
          setJournal((prev) => prev.map((a) => (a.id === article.id ? article : a)))
        }
      />
    </div>
  );
};
