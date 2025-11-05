import React from "react";
import JishoSearch from "./JishoSearch";
import { GeminiIcon, SettingsIcon } from "./Icons";

interface HeaderProps {
  onChatClick: () => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatClick, onSettingsClick }) => {
  return (
    <header className="bg-gray-100 shadow-sm sticky top-0 z-50 dark:bg-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center dark:text-gray-100">
            <span className="text-red-500 mr-2">日本語</span>AIジャーナル
          </h1>
          <div className="flex items-center">
            <JishoSearch />
            <button
              onClick={onChatClick}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Open chat"
            >
              <GeminiIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
