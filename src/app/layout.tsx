import "./globals.css";

import type { Metadata } from "next";

const meta = {
  title: 'EstentoAI',
  description:
    'The best AI-based search engine developed by a student of Tomsk Polytechnic University.',
};

export const metadata: Metadata = {
  ...meta,
  title: {
    default: 'EstentoAI - The best AI-based search engine developed by a student of Tomsk Polytechnic University.',
    template: `%s - estentoAI`,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    ...meta,
    card: 'summary_large_image',
    site: '@estento',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
