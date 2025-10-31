import React, { useState, useCallback, useEffect } from "react";
import { JournalEntry, JLPTLevel, Theme } from "./types";
import Journal from "./components/Journal";
import Chat from "./components/Chat";
import NewEntryForm from "./components/NewEntryForm";
import { getJournalFeedback, setApiKey } from "./services/geminiService";
import { GeminiIcon, SettingsIcon, PencilIcon } from "./components/Icons";
import Settings from "./components/Settings";

const App: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("journalEntries");
    return saved ? JSON.parse(saved) : [];
  });
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewEntryFormOpen, setIsNewEntryFormOpen] = useState(false);
  const [jishoSearchTerm, setJishoSearchTerm] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as Theme) || Theme.System;
  });

  const handleJishoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (jishoSearchTerm.trim()) {
      window.open(
        `https://jisho.org/search/${encodeURIComponent(jishoSearchTerm)}`,
        "_blank",
      );
      setJishoSearchTerm(""); // Clear search term after opening Jisho
    }
  };

  const handleFetchFeedback = useCallback(
    async (entryId: string, text: string, level: JLPTLevel) => {
      try {
        const feedback = await getJournalFeedback(text, level);
        setJournalEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? { ...entry, feedback, isLoading: false }
              : entry,
          ),
        );
      } catch (error) {
        console.error("Failed to get journal feedback:", error);
        const errorFeedback = {
          correctedText: "Error processing entry.",
          grammarFeedback: [],
          vocabularyFeedback: [],
          overallComment:
            "An error occurred while getting feedback from the AI. Please try again.",
        };
        setJournalEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? { ...entry, feedback: errorFeedback, isLoading: false }
              : entry,
          ),
        );
      }
    },
    [],
  );

  useEffect(() => {
    const savedApiKey = localStorage.getItem("geminiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const savedJlptLevel = localStorage.getItem("jlptLevel");
    if (savedJlptLevel) {
      setJlptLevel(savedJlptLevel as JLPTLevel);
    }

    journalEntries.forEach((entry) => {
      if (entry.isLoading) {
        handleFetchFeedback(entry.id, entry.originalText, entry.jlptLevel);
      }
    });
  }, [handleFetchFeedback, journalEntries]);

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("jlptLevel", jlptLevel);
  }, [jlptLevel]);

  useEffect(() => {
    const handleTextSelection = () => {
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        setJishoSearchTerm(selectedText);
      }
    };

    document.addEventListener("selectionchange", handleTextSelection);

    return () => {
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, []);

  useEffect(() => {
    if (
      theme === Theme.Dark ||
      (theme === Theme.System &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSaveSettings = (apiKey: string) => {
    setApiKey(apiKey);
    localStorage.setItem("geminiApiKey", apiKey);
    setIsSettingsOpen(false);
  };

  const addJournalEntry = useCallback(
    async (text: string) => {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        originalText: text,
        feedback: null,
        isLoading: true,
        jlptLevel: jlptLevel,
      };

      setJournalEntries((prev) => [newEntry, ...prev]);
      await handleFetchFeedback(
        newEntry.id,
        newEntry.originalText,
        newEntry.jlptLevel,
      );
    },
    [jlptLevel, handleFetchFeedback],
  );

  const handleDeleteEntry = useCallback((id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleExportJournal = () => {
    const json = JSON.stringify(journalEntries, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `journal-backup_${new Date().toISOString().replace(/:/g, "-")}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
      <header className="bg-gray-100 shadow-sm sticky top-0 z-50 dark:bg-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center dark:text-gray-100">
              <span className="text-red-500 mr-2">日本語</span>AIジャーナル
            </h1>
            <div className="flex items-center">
              {!isChatOpen && !isSettingsOpen && (
                <>
                  <form
                    onSubmit={handleJishoSearch}
                    className="relative flex items-center mr-2"
                  >
                    <input
                      type="text"
                      value={jishoSearchTerm}
                      onChange={(e) => setJishoSearchTerm(e.target.value)}
                      placeholder="Search Jisho..."
                      className="px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-40 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </div>
                  </form>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    aria-label="Open journal chat"
                  >
                    <GeminiIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    aria-label="Open settings"
                  >
                    <SettingsIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-4 px-0 sm:p-6 lg:p-8 relative">
        {isNewEntryFormOpen ? (
          <NewEntryForm
            addEntry={addJournalEntry}
            jlptLevel={jlptLevel}
            setJlptLevel={setJlptLevel}
            onEntryAdded={() => setIsNewEntryFormOpen(false)}
            onCancel={() => setIsNewEntryFormOpen(false)}
          />
        ) : (
          <Journal
            entries={journalEntries}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {!isNewEntryFormOpen && (
          <button
            onClick={() => setIsNewEntryFormOpen(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            aria-label="Add new journal entry"
          >
            <PencilIcon className="h-6 w-6" />
          </button>
        )}

        <Settings
          isOpen={isSettingsOpen}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          onExportJournal={handleExportJournal}
        />

        <Chat
          journalEntries={journalEntries}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;
