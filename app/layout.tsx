import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrepOS — The Operating System for SDE Placement Readiness',
  description:
    'One roadmap. One dashboard. One destination for software engineering placement readiness. Master DSA, Core CS, and Company Patterns.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
