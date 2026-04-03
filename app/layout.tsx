import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GreenDraw — Golf. Give. Win.',
  description: 'A subscription platform combining golf performance, monthly prize draws, and charity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
