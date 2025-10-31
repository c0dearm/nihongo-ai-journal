import React, { useState, useRef, useEffect } from "react";
import { JLPTLevel } from "../types";
import JlptSelector from "./JlptSelector";
import { PlusIcon, LoaderIcon } from "./Icons";
import { bind } from "wanakana";

interface NewEntryFormProps {
  addEntry: (text: string) => void;
  jlptLevel: JLPTLevel;
  setJlptLevel: (level: JLPTLevel) => void;
  onEntryAdded: () => void; // Callback to close the form after adding an entry
  onCancel: () => void; // Callback to cancel adding an entry and return to journal
}

const NewEntryForm: React.FC<NewEntryFormProps> = ({
  addEntry,
  jlptLevel,
  setJlptLevel,
  onEntryAdded,
  onCancel,
}) => {
  const [newEntryText, setNewEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      bind(textareaRef.current);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSubmit = textareaRef.current?.value || "";
    if (!textToSubmit.trim() || isSubmitting) return;

    setIsSubmitting(true);
    onEntryAdded(); // Call the callback to close the form immediately
    await addEntry(textToSubmit);
    setNewEntryText("");
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-gray-100">
        Add New Journal Entry
      </h2>
      <form onSubmit={handleSubmit}>
        <JlptSelector
          selectedLevel={jlptLevel}
          onLevelChange={setJlptLevel}
        />
        <textarea
          ref={textareaRef}
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
          placeholder="今日の出来事を書いてみましょう..."
          className="w-full h-32 p-3 mt-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!newEntryText.trim() || isSubmitting}
          className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {isSubmitting ? (
            <>
              <LoaderIcon className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" />
              Analyzing...
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-5 w-5" />
              Add Entry & Get Feedback
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default NewEntryForm;
