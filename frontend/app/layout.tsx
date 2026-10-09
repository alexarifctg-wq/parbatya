import './globals.css';
import WhatsAppButton from '@/components/WhatsAppButton';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Hanken_Grotesk } from 'next/font/google';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-display' });
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'PARBATYA TRAVELS BD — Discover Bangladesh Beyond the Ordinary',
  description: 'Destinations, journeys, experiences, stays and authentic local products from across Bangladesh.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}<WhatsAppButton /></body>
    </html>
  );
}
