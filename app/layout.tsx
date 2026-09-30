import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'], 
  subsets: ['latin'],
  variable: '--font-merriweather'
});

export const metadata: Metadata = {
  title: 'Bawsala News',
  description: 'Hybrid News Aggregator and CMS',
};

import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} antialiased bg-background text-foreground font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
