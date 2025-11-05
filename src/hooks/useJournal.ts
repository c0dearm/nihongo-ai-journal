import { useState, useEffect, useCallback } from "react";
import { JournalEntry, JLPTLevel, LocalStorageKeys } from "../types";
import { useGemini } from "../hooks/useGemini";

export default function useJournal() {
  const { getJournalFeedback, ai } = useGemini();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(LocalStorageKeys.journalEntries);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      LocalStorageKeys.journalEntries,
      JSON.stringify(journalEntries),
    );
  }, [journalEntries]);

  const handleFetchFeedback = useCallback(
    async (entryId: string, text: string, level: JLPTLevel) => {
      if (!ai) {
        console.error("API key not set. Cannot fetch journal feedback.");
        setJournalEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? { ...entry, isLoading: false } // Stop loading, but don't show error feedback yet
              : entry,
          ),
        );
        return;
      }
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
    [getJournalFeedback, ai],
  );

  const addJournalEntry = useCallback(
    async (text: string, jlptLevel: JLPTLevel) => {
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
    [handleFetchFeedback],
  );

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const exportJournal = () => {
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

  return {
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    exportJournal,
    handleFetchFeedback,
  };
}
