import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { View } from '../../types';
import { cn } from '../../lib/utils';
import { PlusIcon } from '../ui/Icons'; // Use for mobile menu toggle if needed, but I'll use a hamburger or bottom nav.

interface MainLayoutProps {
  children: ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, onViewChange }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
           <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">NIHONGO AI</span>
           {/* Simple mobile nav toggle or just bottom nav. Let's do bottom nav for mobile. */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2 dark:border-gray-800 dark:bg-gray-950 md:hidden">
           {['journal', 'chat', 'stats', 'settings'].map((view) => (
             <button 
               key={view}
               onClick={() => onViewChange(view as View)}
               className={cn(
                 "flex flex-col items-center justify-center rounded-lg p-2 text-xs",
                 currentView === view ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
               )}
             >
               {/* I'll just put text for now or simplified icons, mapped properly */}
               <span className="capitalize">{view}</span>
             </button>
           ))}
        </nav>
      </div>
    </div>
  );
};
