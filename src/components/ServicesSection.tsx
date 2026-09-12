import React, { useState } from 'react';
import {
  Landmark,
  Sofa,
  Construction,
  Compass,
  BookAIcon,
  ClipboardCheck,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  num: string;
  title: string;
  titleLine2?: string;
  //sub: string;
  desc: string;
  image: string;
}

const services: ServiceItem[] = [
  {
    id: 'architectural',
    num: '01',
    title: 'ARCHITECTURAL',
    titleLine2: 'DESIGN',
    //sub: 'Residential / Commercial / Hospitality & Retail',
    desc: 'We create thoughtful architectural spaces that balance form, function, and timeless aesthetics. Every project is shaped through careful planning, refined material selection, natural light, and a strong sense of spatial harmony. Our approach transforms ideas into distinctive, functional environments designed to feel both contemporary and enduring.',
    image: 'https://images.openai.com/static-rsc-4/Z9CLe8cNv0kQiyaovYPUepJGBWH9lpVJwWoztMeUDnMZz8Otlm8-NBpc7S7gqsYs0QUr0znBAiTkBfi58AwFKuVod3WO_YKMaF2NAyhH40V7pyBBs7R2xKqLGWDF1Am3bGOhI2sso2lPSMVCjJxGzRXHq6R0Pu_3XMAKdv6Nhhv_BI7H9lSsIic002y8LCaa?purpose=fullsize',
  },
  {
    id: 'interior',
    num: '02',
    title: 'INTERIOR',
    titleLine2: 'DESIGN',
    //sub: 'Residential Interiors / Commercial Interiors / Hospitality & Retail',
    desc: 'Our interior design approach is rooted in creating spaces that feel both beautiful and purposeful. From carefully curated materials and textures to thoughtful lighting and spatial composition, every detail is considered to create interiors that reflect character, enhance everyday living, and stand the test of time.',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'construction',
    num: '03',
    title: 'CONSTRUCTION',
    //sub: 'Execution / Site Supervision / Quality Control',
    desc: 'We manage the construction process with precision, ensuring every stage is executed with careful planning, quality control, and attention to detail. From site coordination and material selection to execution and final finishing, we bring design concepts to life through efficient, reliable, and seamless project management.',
    image:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'vastu',
    num: '04',
    title: 'VASTU',
    //sub: 'Orientation / Energy Flow / Spatial Harmony',
    desc: 'We thoughtfully integrate Vastu principles with contemporary design to create spaces that feel balanced, harmonious, and purposeful. From orientation and spatial planning to the placement of key elements, every detail is considered to encourage a positive flow of energy while maintaining modern functionality and aesthetics.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'project-mgmt',
    num: '05',
    title: 'PROJECT',
    titleLine2: 'MANAGEMENT',
    //sub: 'Planning / Coordination / Execution',
    desc: 'We bring structure, precision, and efficiency to every stage of a project. From planning and coordination to execution and final delivery, we oversee every detail to ensure a seamless process, consistent quality, and a finished space that reflects the original design vision.',
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'Allied-Services',
    num: '06',
    title: 'ALLIED',
    titleLine2: 'SERVICES',
    //sub: 'Procurement / Coordination / Quality',
    desc: 'We provide reliable support beyond design, coordinating the essential details that bring every project together. From sourcing and vendor coordination to materials, finishes, and on-site requirements, we ensure every element works seamlessly with the design vision and project timeline.',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
  },
];

export const ServicesSection: React.FC = () => {
  const [active, setActive] = useState(0);

  return (
    <section
      id="services"
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
      style={{ background: '#f4f4f1', color: '#080808' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Outer framed container */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 'min(82vh, 780px)',
            minHeight: 560,
            border: '1px solid #d5d5d0',
            borderRadius: 22,
            background: '#f7f7f5',
          }}
        >
          {/* Viewport */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Horizontal track — content area only (tabs fixed on right) */}
            <div
              className="h-full flex will-change-transform"
              style={{
                // On desktop leave space for right tabs (310px)
                width: '100%',
                transform: `translate3d(${-active * 100}%, 0, 0)`,
                transition: 'transform 0.82s cubic-bezier(0.76, 0, 0.24, 1)',
              }}
            >
              {services.map((svc, i) => (
                <article
                  key={svc.id}
                  className="relative h-full flex-shrink-0"
                  style={{
                    flex: '0 0 100%',
                    // desktop: content doesn't go under tabs
                    paddingRight: 0,
                  }}
                >
                  <main
                    className="flex flex-col h-full min-w-0"
                    style={{
                      padding: '32px clamp(20px, 4vw, 56px) 32px clamp(20px, 4vw, 48px)',
                      // reserve space for desktop tabs so content never sits under them
                      marginRight: 0,
                      maxWidth: '100%',
                    }}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{svc.num}</span>
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.16em',
                          color: '#777',
                        }}
                      >
                        OUR SERVICES
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      key={`title-${active}-${i}`}
                      className="font-extrabold"
                      style={{
                        margin: '12px 0 10px',
                        fontSize: 'clamp(40px, 5vw, 76px)',
                        lineHeight: 0.86,
                        letterSpacing: '-0.065em',
                        ...(i === active
                          ? {
                              animation:
                                'svcEnter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s both',
                            }
                          : {}),
                      }}
                    >
                      {svc.title}
                      {svc.titleLine2 ? (
                        <>
                          <br />
                          {svc.titleLine2}
                        </>
                      ) : null}
                    </h2>

                    <div
                      key={`sub-${active}-${i}`}
                      style={{
                        fontSize: 13,
                        color: '#444',
                        ...(i === active
                          ? {
                              animation:
                                'svcEnter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s both',
                            }
                          : {}),
                      }}
                    >
                      {/* {svc.sub} */}
                    </div>

                    <p
                      key={`desc-${active}-${i}`}
                      className="max-w-[620px]"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.55,
                        margin: '24px 0 16px',
                        color: '#333',
                        ...(i === active
                          ? {
                              animation:
                                'svcEnter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.16s both',
                            }
                          : {}),
                      }}
                    >
                      {svc.desc}
                    </p>

                    {/* <button
                      key={`btn-${active}-${i}`}
                      type="button"
                      className="w-max inline-flex items-center gap-3 bg-[#050505] text-white border-0 rounded px-3.5 py-2.5 text-xs font-bold cursor-pointer hover:bg-[#222] transition-colors"
                      style={
                        i === active
                          ? {
                              animation:
                                'svcEnter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both',
                            }
                          : undefined
                      }
                    >
                      Detail Service
                      <span style={{ fontSize: 16 }}>↗</span>
                    </button>*/}

                    {/* Photo */}
                    <div
                      key={`photo-${active}-${i}`}
                      className="mt-auto overflow-hidden"
                      style={{
                        width: 'min(560px, 100%)',
                        height: 'min(28vh, 220px)',
                        minHeight: 140,
                        marginTop: 'auto',
                        ...(i === active
                          ? {
                              animation:
                                'svcPhotoEnter 0.9s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                            }
                          : {}),
                      }}
                    >
                      <img
                        src={svc.image}
                        alt={svc.title}
                        className="w-full h-full object-cover block"
                        draggable={false}
                      />
                    </div>
                  </main>
                </article>
              ))}
            </div>

            {/* Fixed right tabs — desktop only */}
            <nav
              className="hidden md:flex absolute right-0 top-0 bottom-0 z-20"
              style={{
                width: 280,
                borderLeft: '1px solid #d5d5d0',
                background: '#f7f7f5',
              }}
            >
              {services.map((svc, i) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex-1 min-w-0 flex flex-col items-center justify-between cursor-pointer transition-colors border-0 outline-none"
                  style={{
                    padding: '24px 8px',
                    background: i === active ? '#ffffff' : '#f7f7f5',
                    borderLeft: i === 0 ? 'none' : '1px solid #d5d5d0',
                  }}
                >
                  <span
                    className="self-start"
                    style={{ fontSize: 17, fontWeight: 700 }}
                  >
                    {svc.num}
                  </span>
                  <span
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: 13,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {svc.title}
                    {svc.titleLine2 ? ` ${svc.titleLine2}` : ''}
                  </span>
                </button>
              ))}
            </nav>

            {/* Mobile bottom tabs */}
            <nav
              className="md:hidden absolute left-0 right-0 bottom-0 z-20 flex overflow-x-auto"
              style={{
                height: 84,
                borderTop: '1px solid #d5d5d0',
                background: '#f7f7f5',
              }}
            >
              {services.map((svc, i) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex-1 min-w-[72px] flex flex-col items-center justify-center gap-1 cursor-pointer border-0 outline-none"
                  style={{
                    background: i === active ? '#ffffff' : '#f7f7f5',
                    borderLeft: i === 0 ? 'none' : '1px solid #d5d5d0',
                    padding: '8px 4px',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{svc.num}</span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: 1.15,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {svc.title}
                    {svc.titleLine2 ? ` ${svc.titleLine2}` : ''}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes svcEnter {
          from { opacity: 0; transform: translateX(70px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes svcPhotoEnter {
          from { opacity: 0; transform: translateX(100px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Desktop: content stays left of the fixed tabs */
        @media (min-width: 768px) {
          #services article main {
            margin-right: 280px !important;
          }
        }

        /* Mobile: space for bottom tab bar */
        @media (max-width: 767px) {
          #services article main {
            padding-bottom: 100px !important;
          }
        }
      `}</style>
    </section>
  );
};
