import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'DENTRA — A smarter first step before your next dental visit',
  description:
    'Find dental clinics near you, learn what common treatments involve, and ask questions in plain language. DENTRA is coming soon to Google Play.',
  metadataBase: new URL('https://getdentra.site'),
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'DENTRA',
    title: 'DENTRA — A smarter first step before your next dental visit',
    description:
      'Find dental clinics near you, learn what common treatments involve, and ask questions in plain language. DENTRA is coming soon to Google Play.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'DENTRA, a dental screening app, coming soon on Google Play',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DENTRA — A smarter first step before your next dental visit',
    description:
      'Find dental clinics near you, learn what common treatments involve, and ask questions in plain language. DENTRA is coming soon to Google Play.',
    images: ['/og.png'],
  },
};

export const viewport = { themeColor: '#EAFAF8' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
