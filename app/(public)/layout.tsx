import { Navbar } from '@/components/Navbar';
import { TweaksProvider } from '@/components/TweaksPanel';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TweaksProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </TweaksProvider>
  );
}
