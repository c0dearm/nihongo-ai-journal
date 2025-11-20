import React, { useState } from "react";
import { JournalEntry } from "../types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { LoaderIcon, SparklesIcon } from "./ui/Icons";
import { useJournal } from "../contexts/JournalContext";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const { refreshFeedback } = useJournal();
  const [activeTab, setActiveTab] = useState<
    "original" | "corrected" | "analysis"
  >("analysis");

  if (!entry) return null;

  const handleRefresh = async () => {
    await refreshFeedback(entry.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entry Details"
      className="max-w-3xl h-[80vh] flex flex-col"
    >
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        {["analysis", "original", "corrected"].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab as "original" | "corrected" | "analysis")
            }
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {activeTab === "original" && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-100">
              {entry.originalText}
            </p>
          </div>
        )}

        {activeTab === "corrected" && (
          <div className="space-y-4">
            {entry.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <LoaderIcon className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                <p>Analyzing with AI...</p>
              </div>
            ) : entry.feedback ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                  Corrected Version
                </h4>
                <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-100">
                  {entry.feedback.correctedText}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No feedback available yet.</p>
                <Button onClick={handleRefresh} size="sm" variant="outline">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Feedback
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            {entry.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <LoaderIcon className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                <p>Analyzing with AI...</p>
              </div>
            ) : entry.feedback ? (
              <>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Overall Feedback
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {entry.feedback.overallComment}
                  </p>
                </div>

                {entry.feedback.grammarFeedback.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      Grammar Check
                    </h4>
                    <div className="space-y-3">
                      {entry.feedback.grammarFeedback.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md text-sm border-l-4 border-red-400"
                        >
                          <div className="flex gap-2 mb-1">
                            <span className="line-through text-red-500 dark:text-red-400 opacity-70">
                              {item.mistake}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {item.correction}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.feedback.vocabularyFeedback.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                      Vocabulary Suggestions
                    </h4>
                    <div className="space-y-3">
                      {entry.feedback.vocabularyFeedback.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md text-sm border-l-4 border-amber-400"
                        >
                          <div className="flex gap-2 mb-1">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {item.word}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {item.suggestion}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No feedback available yet.</p>
                <Button onClick={handleRefresh} size="sm" variant="outline">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Feedback
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
