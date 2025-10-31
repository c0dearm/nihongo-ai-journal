import React, { useState, useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";
import { Theme } from "../types";

interface SettingsProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onExportJournal: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onSave,
  onClose,
  theme,
  onThemeChange,
  onExportJournal,
}) => {
  const [apiKey, setApiKey] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem("geminiApiKey") || "";
      setApiKey(savedApiKey);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <div
      className={`fixed inset-0 z-60 ${isOpen ? "" : "pointer-events-none"}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b flex justify-between items-center flex-shrink-0 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Configure your application settings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close settings"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gemini API Key
            </label>
            <input
              ref={inputRef}
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter your API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <button
                onClick={() => onThemeChange(Theme.System)}
                className={`flex-1 px-4 py-2 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  theme === Theme.System
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                System
              </button>
              <button
                onClick={() => onThemeChange(Theme.Light)}
                className={`flex-1 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  theme === Theme.Light
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange(Theme.Dark)}
                className={`flex-1 px-4 py-2 text-sm rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  theme === Theme.Dark
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t rounded-b-xl flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={onExportJournal}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Backup Journal
            </button>
            <button
              onClick={handleSave}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
