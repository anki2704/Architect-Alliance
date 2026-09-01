import React from 'react';
import { motion } from 'motion/react';
import { Box, Cpu, ShieldCheck, Layers, Sparkles } from 'lucide-react';

export const Showcase3D: React.FC = () => {
  const tools = [
    { name: 'Autodesk Revit', category: 'BIM & Modeling', color: '#0696D7' },
    { name: 'Rhino 3D', category: 'NURBS Surface', color: '#D21034' },
    { name: 'Grasshopper', category: 'Parametric Scripts', color: '#3A9641' },
    { name: 'AutoCAD', category: '2D/3D Drafting', color: '#0696D7' },
    { name: 'SketchUp Pro', category: 'Conceptual Design', color: '#005F9E' },
    { name: 'Twinmotion', category: 'Real-time Render', color: '#000000' },
    { name: 'V-Ray / Corona', category: 'Photorealistic', color: '#2B579A' },
    { name: 'Enscape 3D', category: 'VR / Walkthrough', color: '#E86300' }
  ];

  return (
    <section className="py-24 bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--text-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
          Technical Stack & Interoperability
        </span>

        <h2 className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
          Plays Nice With Everything
        </h2>

        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto mb-16">
          Our architectural workflow integrates seamlessly with all industry-standard CAD, BIM, parametric scripting, and real-time ray-tracing rendering suites.
        </p>

        {/* Floating 3D Tilt Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl mx-auto perspective-1000">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              data-cursor="TECH"
              whileHover={{
                scale: 1.06,
                rotateX: 8,
                rotateY: -8,
                boxShadow: '0 20px 40px rgba(201, 123, 78, 0.15)'
              }}
              className="glass-card p-6 rounded-3xl flex flex-col items-center text-center cursor-pointer preserve-3d transition-all duration-300 border border-[var(--text-primary)]/10 hover:border-[var(--accent-warm)]"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--text-primary)] mb-4 shadow-md font-bold text-lg"
                style={{ backgroundColor: tool.color }}
              >
                {tool.name.charAt(0)}
              </div>

              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                {tool.name}
              </h4>

              <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {tool.category}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 inline-flex flex-wrap items-center justify-center gap-8 px-8 py-4 rounded-full glass-pill border border-[var(--text-primary)]/10 shadow-md text-xs font-semibold text-[var(--text-primary)]">
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-warm)]" />
            Real-Time GPU Ray-Tracing
          </span>
          <span className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[var(--accent-warm)]" />
            Full OpenBIM IFC Compliance
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-warm)]" />
            LEED Energy Modeling
          </span>
        </div>
      </div>
    </section>
  );
};
