import type { Metadata, Viewport } from 'next';
import { appearanceBoot } from '../appearance';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/fraunces/500.css';
import 'katex/dist/katex.min.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Lumni — A little more curious',
  description:
    'Hands-on STEM learning for South African learners. Discover interactive 3D labs, playful quizzes and daily puzzles.',
  applicationName: 'Lumni',
  manifest: '/manifest-playground-light.webmanifest',
  appleWebApp: { capable: true, title: 'Lumni', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
    { media: '(prefers-color-scheme: dark)', color: '#18191d' },
  ],
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceBoot }} />
      </head>
      <body data-lumni-app="true">{children}</body>
    </html>
  );
}
