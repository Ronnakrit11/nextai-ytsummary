import './globals.css';
import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

// Use Bricolage Grotesque as the main font with multiple weights
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'YouTube Video Insights',
  description: 'Get AI-powered summaries and key points from any YouTube video',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bricolageGrotesque.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
