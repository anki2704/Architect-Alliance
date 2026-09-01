import React from 'react';
import { ArrowRight, Instagram, Linkedin, Facebook, Twitter, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="footer" className="bg-[var(--bg-main)] text-[var(--text-primary)] pt-16 pb-12 border-t border-[var(--text-primary)]/10 relative overflow-hidden">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Footer Hero CTA matching Video Timestamp 0:15 - 0:16 */}
        <div className="mb-20 rounded-3xl overflow-hidden border border-[var(--text-primary)]/15 bg-[var(--bg-card)] text-[var(--text-primary)] relative shadow-2xl">
          {/* Subtle Background Architectural Render */}
          <div className="absolute inset-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&auto=format&fit=crop&q=85"
              alt="Luxury Architecture Exterior"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 p-8 sm:p-14 text-center max-w-3xl mx-auto space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-mono font-bold uppercase tracking-[0.3em] text-[var(--accent-warm)]"
            >
              Start Your Journey
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight"
            >
              Your dream home awaits.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-[var(--text-secondary)] font-light max-w-xl mx-auto leading-relaxed"
            >
              Connect with our principal architects and real estate specialists today and start your spatial journey with absolute confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-2"
            >
              <button
                onClick={() => onNavigate('enquiry')}
                data-cursor="TALK"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--accent-warm)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all shadow-xl hover:shadow-2xl cursor-pointer group transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-[var(--text-primary)] group-hover:text-[var(--text-on-accent)] transition-colors" />
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-[var(--text-primary)]/10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/brand/logo-new.png" alt="Architecture Alliance" className="h-16 w-auto object-contain bg-transparent shrink-0" />
              {/*<div className="flex flex-col justify-between text-left leading-none h-16 py-0.5">
                <span className="text-[15px] text-[var(--text-primary)] font-Roboto Condensed tracking-[0.18em] uppercase font-extrabold">
                  ARCHITECTURE
                </span>
                <div className="w-full h-[1px] min-h-[1px] shrink-0 bg-[var(--text-primary)] mt-[4px] mb-[5px]" />
                <span className="font-Montserrat Bold font-bold text-2xl tracking-tight text-[var(--accent-warm-hover)] leading-none">
                  A L L I A N C E
                </span>
              </div>*/}
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Designing Spaces, Building Dreams — Award-winning sustainable architectural studio crafting modern, biophilic structures.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif-display text-base font-bold text-[var(--text-primary)] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              {['home', 'about', 'services', 'projects', 'team', 'testimonials'].map((sec) => (
                <li key={sec}>
                  <button
                    onClick={() => onNavigate(sec)}
                    data-cursor="GOTO"
                    className="hover:text-[var(--accent-warm)] transition-colors capitalize cursor-pointer font-mono"
                  >
                    {sec}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif-display text-base font-bold text-[var(--text-primary)] mb-4">Typologies</h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>Residential</li>
              <li>Interior</li>
              <li>Construction</li>
              <li>Vastu</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-serif-display text-base font-bold text-[var(--text-primary)] mb-4">Contact Information</h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li>
                <a
                  href="tel:+918130535793"
                  className="flex items-start gap-2.5 hover:text-[var(--accent-warm)] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--accent-warm)]" />
                  <span>+91 8130535793</span>
                </a>
              </li>
              <li>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=architecturealliance.career@gmail.com"
                  className="flex items-start gap-2.5 hover:text-[var(--accent-warm)] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--accent-warm)]" />
                  <span>architecturealliance.career@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--accent-warm)]" />
                <span>
                  FIRST FLOOR, KAVERY ROYAL MARKET, Swarna Jayanti Nagar| 
                  <br />
                  Aligarh, Uttar Pradesh 202001|
                </span>
              </li>
            </ul>
          </div>

          {/* Office Map — far right */}
          <div>
            <div className="rounded-xl overflow-hidden border border-[var(--text-primary)]/15 shadow-sm bg-[var(--bg-card)] h-full min-h-[180px]">
              <iframe
                title="Architecture Alliance Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.287705298419!2d78.0981032793457!3d27.893143100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a5f98da7e919%3A0x2162dd0f6f45045b!2sARCHITECTURE%20ALLIANCE!5e0!3m2!1sen!2sin!4v1786948072703!5m2!1sen!2sin"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 text-center text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Architecture Alliance. All rights reserved. Crafting human-centric environments worldwide.
        </div>
      </div>
    </footer>
  );
};

