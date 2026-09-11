import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-schibsted',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Faresa Prasetyo Nugroho — AI & Frontend Engineer',
  description:
    'Portfolio of Faresa Prasetyo Nugroho, AI & Frontend Engineer in Jakarta. Autonomous agents, n8n automation, and scroll-driven websites built with Next.js, GSAP and Lenis.',
  authors: [{ name: 'Faresa Prasetyo Nugroho' }],
  openGraph: {
    title: 'Faresa Prasetyo Nugroho — AI & Frontend Engineer',
    description: 'Agents that act on their own, and websites that move when you do.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0b0a08',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${newsreader.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Flag JS before first paint so intro elements can start hidden without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
