import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'DENTRA — Dental screening, made simple',
  description:
    'DENTRA is a dental screening app that helps you check on your oral health, find nearby clinics, and understand treatments. Coming soon on Google Play.',
};

export const viewport = { themeColor: '#fbfbfd' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
