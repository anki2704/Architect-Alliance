import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, User, LogOut, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  currentUser: { name: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isEnquiryOpen: boolean;
  onToggleEnquiry: () => void;
  isHomePage: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  isEnquiryOpen,
  onToggleEnquiry,
  isHomePage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY + 6) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY - 6) {
          setIsVisible(true);
        }
      }

      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'team', label: 'TEAM' },
    { id: 'about', label: 'ABOUT' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const handleContactClick = () => {
    onToggleEnquiry();
    setIsMobileMenuOpen(false);
  };

  const shouldShow = isVisible || isMobileMenuOpen;

  // Glass only on center nav links
  const showGlass = !isHomePage || isScrolled;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: shouldShow ? 0 : -100, opacity: shouldShow ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-9 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-auto"
    >
      <div className="w-full mx-auto relative group">
        {/* Outer bar — NO glass background */}
        <div className="relative overflow-hidden rounded-full transition-all duration-300 flex items-center justify-between min-h-[60px] sm:min-h-[72px] px-4 sm:px-6 w-full">
          
          {/* Left — Logo area (empty for now) */}
          <div className="flex items-center shrink-0 min-w-[180px] sm:min-w-[220px]">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('home');
              }}
              data-cursor="HOME"
              className="relative z-10 flex items-center gap-2.5 group cursor-pointer"
            >
              {/* logo image stays commented */}
            </a>
          </div>

          {/* CENTER — Glass effect ONLY here */}
          <nav
            className={`relative z-10 hidden lg:flex items-center gap-5 xl:gap-8 px-6 py-2.5 rounded-full transition-all duration-300 ${
              showGlass
                ? 'bg-white/65 backdrop-blur-xl border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
                : ''
            }`}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  data-cursor="GOTO"
                  className={`text-sm xl:text-base font-sans transition-all relative py-1 px-1 cursor-pointer tracking-wider ${
                    isActive
                      ? 'text-[var(--accent-warm)] font-extrabold'
                      : 'text-[var(--text-primary)] font-bold hover:text-[var(--accent-warm)]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavDot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--accent-warm)] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right — Contact + Login (no glass) */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleContactClick}
              data-cursor="CONTACT"
              className={`hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
                isEnquiryOpen
                  ? 'bg-[var(--accent-warm)] text-[var(--text-on-accent)]'
                  : 'bg-[var(--accent-warm)] hover:bg-[var(--accent-warm-hover)] text-[var(--text-on-accent)]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Us</span>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    data-cursor="ACCOUNT"
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-[var(--text-primary)] text-sm font-sans font-bold hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent-warm)] transition-all cursor-pointer shadow-xs"
                    title="Open dashboard"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-warm)]" />
                    <span className="max-w-[90px] truncate">{currentUser.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    data-cursor="LOGOUT"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-500/10 border border-red-500/40 text-red-500 text-sm font-sans font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer shadow-xs"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  data-cursor="SIGNIN"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-[var(--text-primary)] text-sm font-sans font-bold hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent-warm)] transition-all cursor-pointer shadow-xs"
                  title="Sign In / Register"
                >
                  <User className="w-4.5 h-4.5" />
                  <span>Login</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-10 lg:hidden w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/20 text-[var(--text-primary)] flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 top-[85px] bg-[var(--bg-main)]/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-[var(--text-primary)]/15 z-50 lg:hidden"
          >
            <div className="flex flex-col gap-3 text-center">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`py-3.5 px-4 rounded-2xl text-sm sm:text-base font-sans font-extrabold tracking-[0.15em] uppercase transition-all cursor-pointer ${
                    activeSection === link.id
                      ? 'bg-[var(--text-primary)] text-[var(--text-on-accent)] shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <hr className="my-2 border-[var(--text-primary)]/10" />

              <button
                onClick={handleContactClick}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-sans font-extrabold uppercase tracking-wider shadow-lg cursor-pointer ${
                  isEnquiryOpen
                    ? 'bg-[var(--accent-warm)] text-[var(--text-on-accent)]'
                    : 'bg-[var(--accent-warm)] text-[var(--text-on-accent)] hover:bg-[var(--accent-warm-hover)]'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Us</span>
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-[var(--text-primary)]/20 bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-sans font-bold cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-[var(--accent-warm)]" />
                    Dashboard ({currentUser.role})
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-red-500/30 bg-[var(--bg-card)] text-red-600 text-sm font-sans font-bold cursor-pointer hover:bg-red-500 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-[var(--text-primary)]/20 bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-sans font-bold cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  Login / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};