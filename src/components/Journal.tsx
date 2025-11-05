import React, { useState } from "react";
import { JournalEntry, JLPTLevel } from "../types";
import {
  BookOpenIcon,
  LoaderIcon,
  ChevronDownIcon,
  TrashIcon,
  CalendarIcon,
} from "./Icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const jlptLevelColors: Record<JLPTLevel, { bg: string; text: string }> = {
  [JLPTLevel.N5]: { bg: "bg-blue-100", text: "text-blue-800" },
  [JLPTLevel.N4]: { bg: "bg-green-100", text: "text-green-800" },
  [JLPTLevel.N3]: { bg: "bg-yellow-100", text: "text-yellow-800" },
  [JLPTLevel.N2]: { bg: "bg-orange-100", text: "text-orange-800" },
  [JLPTLevel.N1]: { bg: "bg-red-100", text: "text-red-800" },
};

interface JournalProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
}

const FeedbackItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-4">
    <h4 className="font-semibold text-gray-700 text-sm dark:text-gray-300">
      {title}
    </h4>
    <div className="mt-2 text-sm text-gray-600 space-y-2 dark:text-gray-400">
      {children}
    </div>
  </div>
);

interface EntryCardProps {
  entry: JournalEntry;
  isInitiallyOpen: boolean;
  onDelete: (id: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  isInitiallyOpen,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const feedbackId = `feedback-${entry.id}`;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from expanding/collapsing
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden dark:bg-gray-800">
      <div
        className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg cursor-pointer"
        onClick={() => setIsOpen((prev) => (entry.feedback ? !prev : prev))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen((prev) => (entry.feedback ? !prev : prev));
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={feedbackId}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {new Date(entry.date).toLocaleString()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${jlptLevelColors[entry.jlptLevel].bg} ${jlptLevelColors[entry.jlptLevel].text}`}
              >
                {entry.jlptLevel}
              </span>
              {entry.feedback?.jlptScore !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.feedback.jlptScore >= 80 ? "bg-green-100 text-green-800" : entry.feedback.jlptScore >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                >
                  {entry.feedback.jlptScore}%
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap font-jp dark:text-gray-300">
              {entry.originalText}
            </p>
          </div>
          <div className="flex items-center space-x-4 pl-4">
            {entry.isLoading && (
              <LoaderIcon className="animate-spin text-indigo-500 h-5 w-5" />
            )}
            {entry.feedback && (
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
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
      </div>

      <div
        id={feedbackId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {entry.feedback && (
            <div className="px-5 pb-5 border-t pt-4 dark:border-gray-700">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400">
                AIフィードバック
              </h3>

              <FeedbackItem title="Corrected Text">
                <p className="p-2 bg-green-50 rounded-md border border-green-200 font-jp dark:bg-green-900/50 dark:border-green-800 dark:text-green-200">
                  {entry.feedback.correctedText}
                </p>
              </FeedbackItem>

              {entry.feedback.grammarFeedback.length > 0 && (
                <FeedbackItem title="Grammar">
                  {entry.feedback.grammarFeedback.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/50 dark:border-yellow-800"
                    >
                      <p>
                        <span className="font-semibold">Mistake:</span>{" "}
                        <span className="text-red-600 font-jp dark:text-red-400">
                          {item.mistake}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Correction:</span>{" "}
                        <span className="text-green-600 font-jp dark:text-green-400">
                          {item.correction}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Explanation:</span>{" "}
                        <span className="dark:text-gray-300">
                          {item.explanation}
                        </span>
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
                      className="p-2 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/50 dark:border-blue-800"
                    >
                      <p>
                        <span className="font-semibold">Word:</span>{" "}
                        <span className="text-gray-600 font-jp dark:text-gray-400">
                          {item.word}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Suggestion:</span>{" "}
                        <span className="text-indigo-600 font-jp dark:text-indigo-400">
                          {item.suggestion}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Explanation:</span>{" "}
                        <span className="dark:text-gray-300">
                          {item.explanation}
                        </span>
                      </p>
                    </div>
                  ))}
                </FeedbackItem>
              )}

              <FeedbackItem title="Overall Comment">
                <p className="p-2 bg-gray-100 rounded-md border border-gray-200 italic dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
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

const CustomDateRangeInput = React.forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="text"
      className="w-full pl-12 pr-8 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
      value={value}
      readOnly
      placeholder="Select a date range"
    />
  </div>
));

CustomDateRangeInput.displayName = "CustomDateRangeInput";

const Journal: React.FC<JournalProps> = ({ entries, onDeleteEntry }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [startDate, setStartDate] = useState<Date | undefined>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const CustomDateRangeInput = React.forwardRef<
    HTMLInputElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        className="w-full pl-12 pr-8 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
        value={value}
        readOnly
        placeholder="Select a date range"
      />
    </div>
  ));

  CustomDateRangeInput.displayName = "CustomDateRangeInput";

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

    if (start && entryDate < start) {
      return false;
    }
    if (end && entryDate > end) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 mb-2 dark:text-gray-100">
          Journal Entries
        </h3>
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={startDate}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              setStartDate(start ?? undefined);
              setEndDate(end ?? undefined);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            dateFormat="yyyy/MM/dd"
            isClearable={true}
            customInput={<CustomDateRangeInput />}
          />
        </div>
      </div>

      <div className="flex-grow p-2 space-y-2 overflow-y-auto bg-gray-50 rounded-b-xl dark:bg-gray-900">
        {filteredEntries.length === 0 ? (
          <div className="text-center text-gray-500 py-10 dark:text-gray-400">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No journal entries yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by writing your first entry above.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
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
