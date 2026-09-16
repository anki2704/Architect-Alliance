import React from 'react';
import { ArrowRight, Instagram, Linkedin, Facebook, Twitter, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="footer" className="bg-[#f4f4f1] text-[var(--text-primary)] pt-16 pb-12  relative overflow-hidden">
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

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/918130535793?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="WHATSAPP"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#25D366] text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-[#1da851] transition-all shadow-xl hover:shadow-2xl cursor-pointer group transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </motion.div>
          </div>
        </div>
        

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 pb-7 border-b border-[var(--text-primary)]/10">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/images/brand/logo-new.png" alt="Architecture Alliance" className="h-30 w-auto object-contain bg-transparent shrink-0" />
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
            <h4 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-5">Contact Information</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li>
                <a
                  href="tel:+918130535793"
                  className="flex items-start gap-3 font-extrabold hover:text-[var(--accent-warm)] transition-colors"
                >
                  <Phone className="w-5 h-5 mt-0.5git shrink-0 text-[var(--accent-warm)]" />
                  <span className="text-base">+91 8130535793</span>
                </a>
              </li>
              <li>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=architecturealliance.career@gmail.com"
                  className="flex items-start gap-3 font-extrabold hover:text-[var(--accent-warm)] transition-colors"
                >
                  <Mail className="w-5 h-5 mt-0.5 shrink-0 text-[var(--accent-warm)]" />
                  <span className="text-base">architecturealliance.career@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start font-extrabold gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[var(--accent-warm)]" />
                <span className="text-base leading-relaxed">
                  FIRST FLOOR, KAVERY ROYAL MARKET, Swarna Jayanti Nagar| 
                  <br />
                  Aligarh, Uttar Pradesh 202001|
                </span>
              </li>
            </ul>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {/*Designing Spaces, Building Dreams — Award-winning sustainable architectural studio crafting modern, biophilic structures.*/}
            </p>

            <div className="flex items-center gap-8 pt-3">
              <a href="https://www.instagram.com/architecturealliance/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-20 h-20 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Instagram className="w-10 h-10" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-20 h-20 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Linkedin className="w-10 h-10" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-20 h-20 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Facebook className="w-10 h-10" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-20 h-20 rounded-full glass-pill text-[var(--text-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all border border-[var(--text-primary)]/15">
                <Twitter className="w-10 h-10" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          {/*<div>
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
          </div>*/}

          {/* Services */}
          {/*<div>
            <h4 className="font-serif-display text-base font-bold text-[var(--text-primary)] mb-4">Typologies</h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>Residential</li>
              <li>Interior</li>
              <li>Construction</li>
              <li>Vastu</li>
            </ul>
          </div>*/}

          {/* Contact information is rendered in the brand column above. */}

          {/* Office Map — far right */}
          <div>
            <div className="rounded-xl overflow-hidden border border-[var(--text-primary)]/15 shadow-sm bg-[var(--bg-card)] h-full min-h-[350px] w-full min-w-[900px]">
              <iframe
                title="Architecture Alliance Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.287705298419!2d78.0981032793457!3d27.893143100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a5f98da7e919%3A0x2162dd0f6f45045b!2sARCHITECTURE%20ALLIANCE!5e0!3m2!1sen!2sin!4v1786948072703!5m2!1sen!2sin"
                className="w-full h-full"
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

