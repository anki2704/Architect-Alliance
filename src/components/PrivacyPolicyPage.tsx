import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto prose-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-2">
          Legal
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">1. Who we are</h2>
            <p>
              Architecture Alliance (&quot;we&quot;, &quot;us&quot;) operates this website and related enquiry,
              booking and account services. Studio: First Floor, Kavery Royal Market, Swarna Jayanti Nagar,
              Aligarh, Uttar Pradesh 202001. Email: architecturealliance.career@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enquiry form: name, email, phone, subject, message</li>
              <li>Account / booking: registration and project-related details you submit</li>
              <li>Technical data: basic logs needed for security and rate limiting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">3. Why we use it</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To respond to enquiries and project discussions</li>
              <li>To manage bookings and user accounts</li>
              <li>To secure the service (authentication, abuse prevention)</li>
              <li>To improve our services where necessary</li>
            </ul>
            <p className="mt-2">We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">4. Storage & security</h2>
            <p>
              Data is stored using trusted infrastructure (e.g. database and email providers).
              Access is limited to authorised personnel. No method of transmission is 100% secure;
              we take reasonable technical and organisational measures.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">5. Your rights</h2>
            <p>
              You may request access, correction, or deletion of your personal data by contacting
              architecturealliance.career@gmail.com. We will respond within a reasonable time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">6. Contact</h2>
            <p>
              For privacy questions: architecturealliance.career@gmail.com | +91 8130535793
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};