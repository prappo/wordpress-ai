import { Inter } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://wp-ai-dev.vercel.app'),
  title: 'WordPress AI - AI-Powered WordPress Development',
  description:
    'WordPress AI is a powerful WordPress plugin and theme generator. Streamline your workflow with AI-powered code generation, real-time preview, and seamless WordPress integration.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={'min-h-full dark'}>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
