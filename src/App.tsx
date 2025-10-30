import React, { useState, useCallback, useEffect, useRef } from "react";
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
  const [jishoSearchTerm, setJishoSearchTerm] = useState("");
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showJishoPopup, setShowJishoPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const jishoPopupRef = useRef<HTMLDivElement>(null);

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

  const handleTextSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      setSelectedText(selectedText);
      setShowJishoPopup(true);
      setPopupPosition({ x: event.pageX, y: event.pageY });
    }
  }, []);

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
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jishoPopupRef.current &&
        !jishoPopupRef.current.contains(event.target as Node)
      ) {
        setShowJishoPopup(false);
        setSelectedText(null);
      }
    };

    if (showJishoPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showJishoPopup]);

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
                  <form
                    onSubmit={handleJishoSearch}
                    className="flex items-center gap-2 mr-2"
                  >
                    <input
                      type="text"
                      value={jishoSearchTerm}
                      onChange={(e) => setJishoSearchTerm(e.target.value)}
                      placeholder="Search Jisho..."
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-32"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      aria-label="Search Jisho.org"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </button>
                  </form>
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
        {showJishoPopup && selectedText && (
          <div
            ref={jishoPopupRef}
            style={{
              position: "absolute",
              left: popupPosition.x,
              top: popupPosition.y,
              zIndex: 1000,
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded-md shadow-lg cursor-pointer hover:bg-blue-600 text-sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              window.open(
                `https://jisho.org/search/${encodeURIComponent(selectedText)}`,
                "_blank",
              );
              setShowJishoPopup(false);
              setSelectedText(null);
            }}
          >
            Search Jisho for &quot;{selectedText}&quot;
          </div>
        )}
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
