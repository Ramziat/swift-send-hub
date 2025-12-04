import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content */}
      <main className="pt-24 pb-32 md:pt-8 md:pb-8 md:pl-72 px-4 md:pr-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      {/* Language toggle moved to Navigation */}
    </div>
  );
};
