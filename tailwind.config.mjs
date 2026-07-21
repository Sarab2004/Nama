/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text-strong)',
              '--tw-prose-lead': 'var(--text-muted)',
              '--tw-prose-links': 'var(--link)',
              '--tw-prose-bold': 'var(--text-strong)',
              '--tw-prose-counters': 'var(--text-muted)',
              '--tw-prose-bullets': 'var(--accent)',
              '--tw-prose-hr': 'var(--divider)',
              '--tw-prose-quotes': 'var(--text)',
              '--tw-prose-quote-borders': 'var(--primary)',
              '--tw-prose-captions': 'var(--text-subtle)',
              '--tw-prose-code': 'var(--text-strong)',
              '--tw-prose-pre-code': 'var(--text-inverse)',
              '--tw-prose-pre-bg': 'var(--surface-inverse)',
              '--tw-prose-th-borders': 'var(--border-strong)',
              '--tw-prose-td-borders': 'var(--border)',
              '--tw-prose-invert-body': 'var(--text)',
              '--tw-prose-invert-headings': 'var(--text-strong)',
              '--tw-prose-invert-lead': 'var(--text-muted)',
              '--tw-prose-invert-links': 'var(--link)',
              '--tw-prose-invert-bold': 'var(--text-strong)',
              '--tw-prose-invert-counters': 'var(--text-muted)',
              '--tw-prose-invert-bullets': 'var(--accent)',
              '--tw-prose-invert-hr': 'var(--divider)',
              '--tw-prose-invert-quotes': 'var(--text)',
              '--tw-prose-invert-quote-borders': 'var(--primary)',
              '--tw-prose-invert-captions': 'var(--text-subtle)',
              '--tw-prose-invert-code': 'var(--text-strong)',
              '--tw-prose-invert-pre-code': 'var(--text)',
              '--tw-prose-invert-pre-bg': 'var(--surface-2)',
              '--tw-prose-invert-th-borders': 'var(--border-strong)',
              '--tw-prose-invert-td-borders': 'var(--border)',
              maxWidth: 'none',
              lineHeight: '1.85',
              a: {
                fontWeight: '600',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              },
              'a:hover': {
                color: 'var(--link-hover)',
              },
              h1: {
                fontWeight: '700',
                marginBottom: '0.25em',
              },
              h2: {
                fontWeight: '700',
              },
              h3: {
                fontWeight: '600',
              },
              blockquote: {
                fontStyle: 'normal',
                background: 'var(--surface-2)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
