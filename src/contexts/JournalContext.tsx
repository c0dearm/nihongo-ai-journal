import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { JournalEntry, LocalStorageKeys } from "../types";
import { useSettings } from "./SettingsContext";
import { useGemini } from "./GeminiContext";

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (text: string) => Promise<void>;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, text: string) => void;
  exportJournal: () => void;
  refreshFeedback: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
};

export const JournalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { jlptLevel } = useSettings();
  const { getJournalFeedback, isApiKeySet } = useGemini();

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(LocalStorageKeys.journalEntries);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      LocalStorageKeys.journalEntries,
      JSON.stringify(entries),
    );
  }, [entries]);

  const addEntry = useCallback(
    async (text: string) => {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        originalText: text,
        feedback: null,
        isLoading: true,
        jlptLevel: jlptLevel,
      };

      setEntries((prev) => [newEntry, ...prev]);

      if (isApiKeySet) {
        try {
          const feedback = await getJournalFeedback(text, jlptLevel);
          setEntries((prev) =>
            prev.map((e) =>
              e.id === newEntry.id ? { ...e, feedback, isLoading: false } : e,
            ),
          );
        } catch (error) {
          console.error("Failed to get feedback", error);
          setEntries((prev) =>
            prev.map((e) =>
              e.id === newEntry.id ? { ...e, isLoading: false } : e,
            ),
          );
        }
      } else {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === newEntry.id ? { ...e, isLoading: false } : e,
          ),
        );
      }
    },
    [jlptLevel, isApiKeySet, getJournalFeedback],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, text: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, originalText: text, feedback: null } : e,
      ),
    );
  }, []);

  const refreshFeedback = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry || !isApiKeySet) return;

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isLoading: true } : e)),
      );
      try {
        const feedback = await getJournalFeedback(
          entry.originalText,
          entry.jlptLevel,
        );
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, feedback, isLoading: false } : e,
          ),
        );
      } catch {
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isLoading: false } : e)),
        );
      }
    },
    [entries, isApiKeySet, getJournalFeedback],
  );

  const exportJournal = useCallback(() => {
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nihongo-journal-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entries]);

  return (
    <JournalContext.Provider
      value={{
        entries,
        addEntry,
        deleteEntry,
        updateEntry,
        exportJournal,
        refreshFeedback,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
