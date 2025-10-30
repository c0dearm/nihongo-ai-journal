import React, { useState, useCallback, useEffect } from "react";
import { JournalEntry, JLPTLevel } from "./types";
import Journal from "./components/Journal";
import Chat from "./components/Chat";
import { getJournalFeedback, setApiKey } from "./services/geminiService";
import { GeminiIcon, SettingsIcon } from "./components/Icons";
import Settings from "./components/Settings";

const App: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("journalEntries");
    return saved ? JSON.parse(saved) : [];
  });
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-red-500 mr-2">日本語</span>AIジャーナル
            </h1>
            <div className="flex items-center">
              {!isChatOpen && !isSettingsOpen && (
                <>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    aria-label="Open journal chat"
                  >
                    <GeminiIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-2"
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

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 relative">
        <Journal
          entries={journalEntries}
          addEntry={addJournalEntry}
          jlptLevel={jlptLevel}
          setJlptLevel={setJlptLevel}
          onDeleteEntry={handleDeleteEntry}
        />

        <Settings
          isOpen={isSettingsOpen}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
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
