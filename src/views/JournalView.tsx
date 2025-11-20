import React, { useState, useMemo } from "react";
/* eslint-disable react/prop-types */
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useJournal } from "../contexts/JournalContext";
import { JournalEntryCard } from "../components/JournalEntryCard";
import { EntryEditor } from "../components/EntryEditor";
import { EntryDetailModal } from "../components/EntryDetailModal";
import { Button } from "../components/ui/Button";
import { PlusIcon, CalendarIcon, BookOpenIcon } from "../components/ui/Icons";

// Custom Input for DatePicker
const DatePickerInput = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ value, onClick }, ref) => (
  <button
    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    onClick={onClick}
    ref={ref}
  >
    <CalendarIcon className="h-4 w-4 text-gray-500" />
    <span className="text-gray-700 dark:text-gray-300">
      {value || "Filter by Date"}
    </span>
  </button>
));

DatePickerInput.displayName = "DatePickerInput";

export const JournalView: React.FC = () => {
  const { entries, deleteEntry } = useJournal();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Date Filter State
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return entries;
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  }, [entries, startDate, endDate]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Journal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your daily Japanese writing practice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative z-20">
            <DatePicker
              selectsRange={true}
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              customInput={<DatePickerInput />}
            />
          </div>
          <Button
            onClick={() => setIsEditorOpen(true)}
            className="shadow-lg shadow-indigo-500/20"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <BookOpenIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No entries found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2 mb-6">
              {entries.length === 0
                ? "Start your journey by writing your first journal entry in Japanese."
                : "Try adjusting your date filter."}
            </p>
            {entries.length === 0 && (
              <Button onClick={() => setIsEditorOpen(true)}>Write Entry</Button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
              onClick={setSelectedEntryId}
            />
          ))
        )}
      </div>

      <EntryEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />

      <EntryDetailModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntryId(null)}
      />
    </div>
  );
};
