import React, { useState, useCallback, useEffect } from "react";
import { JournalEntry, JLPTLevel, Theme } from "./types";
import Journal from "./components/Journal";
import Chat from "./components/Chat";
import EntryForm from "./components/EntryForm";
import { getJournalFeedback, setApiKey } from "./services/geminiService";
import { PencilIcon } from "./components/Icons";
import Settings from "./components/Settings";
import Header from "./components/Header";

const App: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("journalEntries");
    return saved ? JSON.parse(saved) : [];
  });
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as Theme) || Theme.System;
  });

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
          jlptScore: 0,
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
      <Header
        onChatClick={() => setIsChatOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="flex-grow container mx-auto py-4 px-0 sm:p-6 lg:p-8 relative">
        <Journal entries={journalEntries} onDeleteEntry={handleDeleteEntry} />

        <button
          onClick={() => setIsEntryFormOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          aria-label="Add new journal entry"
        >
          <PencilIcon className="h-6 w-6" />
        </button>

        <EntryForm
          isOpen={isEntryFormOpen}
          onClose={() => setIsEntryFormOpen(false)}
          addEntry={addJournalEntry}
        />

        <Settings
          isOpen={isSettingsOpen}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          onExportJournal={handleExportJournal}
          jlptLevel={jlptLevel}
          onJlptLevelChange={setJlptLevel}
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
