import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrepOS — The Operating System for SDE Placement Readiness',
  description:
    'One roadmap. One dashboard. One destination for software engineering placement readiness. Master DSA, Core CS, and Company Patterns.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
