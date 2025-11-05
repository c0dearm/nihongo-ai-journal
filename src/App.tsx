import React, { useState, useEffect } from "react";
import useJournal from "./hooks/useJournal";
import useSettings from "./hooks/useSettings";
import Journal from "./components/Journal";
import Chat from "./components/Chat";
import EntryForm from "./components/EntryForm";
import { PencilIcon } from "./components/Icons";
import Settings from "./components/Settings";
import Header from "./components/Header";

const App: React.FC = () => {
  const {
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    exportJournal,
    handleFetchFeedback,
  } = useJournal();
  const { jlptLevel, setJlptLevel, theme, setTheme, saveSettings } =
    useSettings();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);

  useEffect(() => {
    journalEntries.forEach((entry) => {
      if (entry.isLoading) {
        handleFetchFeedback(entry.id, entry.originalText, entry.jlptLevel);
      }
    });
  }, [handleFetchFeedback, journalEntries]);

  const handleSaveSettings = (apiKey: string) => {
    saveSettings(apiKey);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
      <Header
        onChatClick={() => setIsChatOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="flex-grow container mx-auto py-4 px-0 sm:p-6 lg:p-8 relative">
        <Journal entries={journalEntries} onDeleteEntry={deleteJournalEntry} />

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
          addEntry={(text) => addJournalEntry(text, jlptLevel)}
        />

        <Settings
          isOpen={isSettingsOpen}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          onExportJournal={exportJournal}
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
