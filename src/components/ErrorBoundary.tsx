import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * simple fallback instead of leaving the visitor with a blank white page.
 * This does NOT catch errors in event handlers or async code — only
 * render/lifecycle errors, which is what React error boundaries support.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-md text-center">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-medium mb-4">
              Something went wrong
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
              Please refresh the page. If the problem continues, try again in a few minutes.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 rounded-full bg-[var(--accent-warm)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
