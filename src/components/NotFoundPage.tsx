import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center px-4 sm:px-6 pt-28 pb-20">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">
          404
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold mb-4">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-full bg-[var(--accent-warm)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
};
