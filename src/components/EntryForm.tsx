import React, { useState, useRef, useEffect, useCallback } from "react";
import { PlusIcon } from "./Icons";
import { bind } from "wanakana";

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  addEntry: (text: string) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ isOpen, onClose, addEntry }) => {
  const [entryText, setEntryText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wanakanaRef = useCallback((node: HTMLTextAreaElement) => {
    if (node) {
      bind(node);
      textareaRef.current = node;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSubmit = textareaRef.current?.value || "";
    if (!textToSubmit.trim()) return;

    onClose(); // Close the modal immediately
    await addEntry(textToSubmit);
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    setEntryText(""); // Clear the entryText state as well
  };

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div
        ref={modalRef}
        className="relative p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700 max-w-lg w-full mx-4"
      >
        <form onSubmit={handleSubmit}>
          <textarea
            ref={wanakanaRef}
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="今日の出来事を書いてみましょう..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <button
            type="submit"
            disabled={!entryText.trim()}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Entry
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
