import React, { useState, useRef, useCallback } from "react";
import { bind, unbind } from "wanakana";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { useJournal } from "../contexts/JournalContext";

interface EntryEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntryEditor: React.FC<EntryEditorProps> = ({
  isOpen,
  onClose,
}) => {
  const { addEntry } = useJournal();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Wanakana binding
  const setRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      bind(node);
      textareaRef.current = node;
    } else {
      if (textareaRef.current) unbind(textareaRef.current);
      textareaRef.current = null;
    }
  }, []);

  const handleSubmit = async () => {
    // Use ref value because state might lag with Wanakana binding direct DOM manipulation
    const val = textareaRef.current?.value || text;
    if (!val.trim()) return;

    onClose();
    await addEntry(val);
    setText("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Journal Entry">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Write in Japanese. Input is automatically converted to
          Hiragana/Katakana.
        </p>
        <Textarea
          ref={setRef}
          value={text}
          onChange={handleChange}
          placeholder="今日の出来事を書いてみましょう..."
          className="min-h-[200px] font-serif text-lg p-4 leading-relaxed"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text && !textareaRef.current?.value}
          >
            Save Entry
          </Button>
        </div>
      </div>
    </Modal>
  );
};
