import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { appearanceBoot } from '../appearance';
import { brand } from '../lib/brand';
import { siteOrigin, pageMetadata, structuredData, jsonLd } from '../lib/site';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/fraunces/500.css';
import 'katex/dist/katex.min.css';
import './globals.css';
export const metadata: Metadata = {
  ...pageMetadata(brand.title, '/'),
  metadataBase: siteOrigin ? new URL(siteOrigin) : undefined,
  applicationName: brand.name,
  category: 'education',
  robots: { index: Boolean(siteOrigin), follow: true },
  manifest: '/manifest-playground-light.webmanifest',
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
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
        <link rel="describedby" type="text/plain" href="/llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData()) }}
        />
        <script dangerouslySetInnerHTML={{ __html: appearanceBoot }} />
      </head>
      <body data-lumni-app="true">
        {children}
        <Analytics />
        <a href="/vision/index.html" style={{ display: 'block', width: 'fit-content', margin: '16px auto', padding: '12px 18px', border: '1px solid currentColor', borderRadius: 999, fontSize: 14, textDecoration: 'none' }}>Try on-device vision (preview)</a>
      </body>
    </html>
  );
}
