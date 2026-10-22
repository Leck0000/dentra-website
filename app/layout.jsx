import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'DENTRA — Dental screening, made simple',
  description:
    'Screen at home. Understand your options. Find a dentist nearby. On Android and iPhone.',
  openGraph: {
    type: 'website',
    url: 'https://leck0000.github.io/dentra-website/',
    siteName: 'DENTRA',
    title: 'DENTRA — A smarter first step for your smile',
    description:
      'Screen at home. Understand your options. Find a dentist nearby. On Android and iPhone.',
    images: [
      {
        url: 'https://leck0000.github.io/dentra-website/og.png',
        width: 1200,
        height: 630,
        alt: 'DENTRA, a dental screening app: a smarter first step for your smile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DENTRA — A smarter first step for your smile',
    description:
      'Screen at home. Understand your options. Find a dentist nearby. On Android and iPhone.',
    images: ['https://leck0000.github.io/dentra-website/og.png'],
  },
};

export const viewport = { themeColor: '#fbfbfd' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
