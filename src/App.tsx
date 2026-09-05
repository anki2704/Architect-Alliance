'use client';

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Lenis from 'lenis';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectGallery } from './components/ProjectGallery';
import { IsometricFloorPlanViewer } from './components/IsometricFloorPlanViewer';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { DashboardView } from './components/DashboardView';
import { EnquirySection } from './components/EnquirySection';
import { Footer } from './components/Footer';
import { ProjectDetailView } from './components/ProjectDetailView';
import { AdminLogin } from './components/AdminLogin';

import { Project, User } from './types';
import { projectsApi } from './services/api';
import { authApi, getStoredToken, getStoredUser, clearStoredAuth } from './services/api';

/** Full-page project detail — opens at /project/:id */
function ProjectDetailPage({ projects }: { projects: Project[] }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === id) || null;

  // Scroll to top when opening a project page
  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-[var(--text-secondary)]">Project not found</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] text-xs font-mono tracking-widest uppercase font-bold hover:bg-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetailView
      project={project}
      projects={projects}
      onClose={() => navigate('/')}
      onSelectProject={(proj) => navigate(`/project/${proj.id}`)}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPreloader, setShowPreloader] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [projects, setProjects] = useState<Project[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  // Force light theme only — no dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('architech_theme', 'light');
  }, []);

  useEffect(() => {
    // Initialize Lenis Smooth Scroll with modal prevent support
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.2,
      prevent: (node) => {
        return (
          node.classList.contains('overflow-y-auto') ||
          node.hasAttribute('data-lenis-prevent') ||
          !!node.closest('[data-lenis-prevent]')
        );
      }
    });

    (window as any).lenis = lenis;
    setLenisInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Keep activeSection in sync with current route
  useEffect(() => {
    if (location.pathname === '/team') {
      setActiveSection('team');
      window.scrollTo(0, 0);
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
      }
    } else if (location.pathname.startsWith('/project/')) {
      setActiveSection('projects');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Only run scroll observer on home page
    if (location.pathname !== '/') return;

    const sectionIds = ['projects', 'services', 'home', 'footer'];

    const handleScrollObserver = () => {
      const scrollPosition = window.scrollY + 220;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollObserver, { passive: true });
    handleScrollObserver();

    return () => window.removeEventListener('scroll', handleScrollObserver);
  }, [location.pathname]);

  // Real project data straight from MongoDB via the API.
  useEffect(() => {
    projectsApi
      .list()
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => console.error('Failed to load projects', err));
  }, []);

  // Restore a logged-in session from a previously stored JWT
  useEffect(() => {
    const token = getStoredToken();
    const cachedUser = getStoredUser();
    if (!token) return;

    if (cachedUser) setCurrentUser(cachedUser);

    authApi
      .me()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => {
        clearStoredAuth();
        setCurrentUser(null);
      });
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'dashboard') {
      if (currentUser) setIsDashboardOpen(true);
      return;
    }
    if (sectionId === 'about') {
      sectionId = 'footer';
    }
    // Contact / enquiry is handled via toggle, not scroll
    if (sectionId === 'enquiry' || sectionId === 'contact') {
      setIsEnquiryOpen(true);
      return;
    }

    // TEAM → open as a separate page
    if (sectionId === 'team') {
      navigate('/team');
      setActiveSection('team');
      return;
    }

    // All other sections → go to home and scroll
    if (location.pathname !== '/') {
      navigate('/');
    }

    setActiveSection(sectionId);

    setTimeout(() => {
      if (lenisInstance) {
        const element = document.getElementById(sectionId);
        if (element) {
          lenisInstance.scrollTo(element, { offset: -30, duration: 1.2 });
        } else if (sectionId === 'home') {
          lenisInstance.scrollTo(0, { duration: 1.2 });
        }
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, location.pathname !== '/' ? 120 : 0);
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearStoredAuth();
    setCurrentUser(null);
    setIsDashboardOpen(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'designer') {
      setIsDashboardOpen(true);
    }
  };

  // Dedicated admin login page — completely hidden from public UI
  if (location.pathname === '/admin-login') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-[var(--accent-warm)] selection:text-[var(--text-on-accent)] relative">
      {/* Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Film Grain Texture Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Responsive Header Navigation */}
      {!showPreloader && (
        <Navbar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          isEnquiryOpen={isEnquiryOpen}
          onToggleEnquiry={() => setIsEnquiryOpen((v) => !v)}
          isHomePage={location.pathname === '/'}
        />
      )}

      {/* Main Page Content */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="relative">
                  <HeroSection onNavigate={handleNavigate} />
                  <ProjectGallery
                    projects={projects}
                    currentUser={currentUser}
                    onProjectCreated={(newProject) => setProjects((prev) => [newProject, ...prev])}
                    onProjectDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
                  />
                </div>
                <IsometricFloorPlanViewer isAdmin={currentUser?.role === 'admin'} onEnquire={() => setIsEnquiryOpen(true)}/>
                <ServicesSection />
                <TestimonialsSection />
              </>
            }
          />

          <Route
            path="/team"
            element={
              <div className="pt-24 min-h-screen">
                <TeamSection />
              </div>
            }
          />

          {/* Project detail as a full page: /project/:id */}
          <Route
            path="/project/:id"
            element={
              <div className="pt-24 min-h-screen">
                <ProjectDetailPage projects={projects} />
              </div>
            }
          />
        </Routes>
      </main>
    
      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Dashboard Popup */}
      {currentUser && (
        <DashboardView
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Contact / Enquiry overlay — toggled by "Contact Us" in navbar */}
      <EnquirySection
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
