import React, { useState } from "react";
import {
  BookOpenIcon,
  GeminiIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
} from "../ui/Icons";
import { cn } from "../../lib/utils";
import { View } from "../../types";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { id: "journal", label: "Journal", icon: BookOpenIcon },
    { id: "chat", label: "Chat", icon: GeminiIcon },
    { id: "stats", label: "Stats", icon: SparklesIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.open(
        `https://jisho.org/search/${encodeURIComponent(searchTerm)}`,
        "_blank",
      );
      setSearchTerm("");
    }
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:flex">
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
          NIHONGO AI
        </span>
      </div>

      <div className="p-4 pb-0">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Jisho..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={cn(
                "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                currentView === item.id
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-200">
              Learner
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
