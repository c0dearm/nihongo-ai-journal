import React, { useState } from "react";
import { JournalEntry, JLPTLevel } from "../types";
import JlptSelector from "./JlptSelector";
import { PlusIcon, BookOpenIcon, LoaderIcon, ChevronDownIcon, TrashIcon } from "./Icons";

interface JournalProps {
  entries: JournalEntry[];
  addEntry: (text: string) => void;
  jlptLevel: JLPTLevel;
  setJlptLevel: (level: JLPTLevel) => void;
  onDeleteEntry: (id: string) => void;
}

const FeedbackItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-4">
    <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
    <div className="mt-2 text-sm text-gray-600 space-y-2">{children}</div>
  </div>
);

interface EntryCardProps {
  entry: JournalEntry;
  isInitiallyOpen: boolean;
  onDelete: (id: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, isInitiallyOpen, onDelete }) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const feedbackId = `feedback-${entry.id}`;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from expanding/collapsing
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden">
      <button
        className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
        onClick={() => setIsOpen((prev) => (entry.feedback ? !prev : prev))}
        disabled={!entry.feedback || entry.isLoading}
        aria-expanded={isOpen}
        aria-controls={feedbackId}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">
              {new Date(entry.date).toLocaleString()}
            </p>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap font-jp">
              {entry.originalText}
            </p>
          </div>
          <div className="flex items-center space-x-4 pl-4">
            {entry.isLoading && (
              <LoaderIcon className="animate-spin text-indigo-500 h-5 w-5" />
            )}
            {entry.feedback && (
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            )}
            <button
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-full p-1"
              aria-label="Delete entry"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </button>

      <div
        id={feedbackId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {entry.feedback && (
            <div className="px-5 pb-5 border-t pt-4">
              <h3 className="font-bold text-indigo-600">AIフィードバック</h3>

              <FeedbackItem title="Corrected Text">
                <p className="p-2 bg-green-50 rounded-md border border-green-200 font-jp">
                  {entry.feedback.correctedText}
                </p>
              </FeedbackItem>

              {entry.feedback.grammarFeedback.length > 0 && (
                <FeedbackItem title="Grammar">
                  {entry.feedback.grammarFeedback.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-yellow-50 border border-yellow-200 rounded-md"
                    >
                      <p>
                        <span className="font-semibold">Mistake:</span>{" "}
                        <span className="text-red-600 font-jp">
                          {item.mistake}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Correction:</span>{" "}
                        <span className="text-green-600 font-jp">
                          {item.correction}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Explanation:</span>{" "}
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </FeedbackItem>
              )}

              {entry.feedback.vocabularyFeedback.length > 0 && (
                <FeedbackItem title="Vocabulary">
                  {entry.feedback.vocabularyFeedback.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-blue-50 border border-blue-200 rounded-md"
                    >
                      <p>
                        <span className="font-semibold">Word:</span>{" "}
                        <span className="text-gray-600 font-jp">
                          {item.word}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Suggestion:</span>{" "}
                        <span className="text-indigo-600 font-jp">
                          {item.suggestion}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Explanation:</span>{" "}
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </FeedbackItem>
              )}

              <FeedbackItem title="Overall Comment">
                <p className="p-2 bg-gray-100 rounded-md border border-gray-200 italic">
                  &quot;{entry.feedback.overallComment}&quot;
                </p>
              </FeedbackItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Journal: React.FC<JournalProps> = ({
  entries,
  addEntry,
  jlptLevel,
  setJlptLevel,
  onDeleteEntry,
}) => {
  const [newEntryText, setNewEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await addEntry(newEntryText);
    setNewEntryText("");
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Journal</h2>
        <form onSubmit={handleSubmit}>
          <JlptSelector
            selectedLevel={jlptLevel}
            onLevelChange={setJlptLevel}
          />
          <textarea
            value={newEntryText}
            onChange={(e) => setNewEntryText(e.target.value)}
            placeholder="今日の出来事を書いてみましょう..."
            className="w-full h-32 p-3 mt-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newEntryText.trim() || isSubmitting}
            className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {isSubmitting ? (
              <>
                <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Analyzing...
              </>
            ) : (
              <>
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Entry & Get Feedback
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50 rounded-b-xl">
        {entries.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No journal entries yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by writing your first entry above.
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isInitiallyOpen={index === 0}
              onDelete={onDeleteEntry}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;
