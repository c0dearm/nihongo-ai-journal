import React, { useState } from "react";
import { JournalEntry, JLPTLevel } from "../types";
import { BookOpenIcon, LoaderIcon, ChevronDownIcon, TrashIcon } from "./Icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeedbackCard from "./FeedbackCard";
import DateRangePicker from "./DateRangePicker";

const jlptLevelColors: Record<JLPTLevel, { bg: string; text: string }> = {
  [JLPTLevel.N5]: { bg: "bg-blue-100", text: "text-blue-800" },
  [JLPTLevel.N4]: { bg: "bg-green-100", text: "text-green-800" },
  [JLPTLevel.N3]: { bg: "bg-yellow-100", text: "text-yellow-800" },
  [JLPTLevel.N2]: { bg: "bg-orange-100", text: "text-orange-800" },
  [JLPTLevel.N1]: { bg: "bg-red-100", text: "text-red-800" },
};

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
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  jlptLevelColors[entry.jlptLevel].bg
                } ${jlptLevelColors[entry.jlptLevel].text}`}
              >
                {entry.jlptLevel}
              </span>
              {entry.feedback?.jlptScore !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    entry.feedback.jlptScore >= 80
                      ? "bg-green-100 text-green-800"
                      : entry.feedback.jlptScore >= 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
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
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
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
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {entry.feedback && <FeedbackCard feedback={entry.feedback} />}
        </div>
      </div>
    </div>
  );
};

interface JournalProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onDeleteEntry }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [startDate, setStartDate] = useState<Date | undefined>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

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
            customInput={<DateRangePicker />}
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
