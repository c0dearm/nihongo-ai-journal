import React from "react";
import { JournalEntry } from "../types";
import useChat from "../hooks/useChat";
import {
  UserIcon,
  SparklesIcon,
  LoaderIcon,
  PaperAirplaneIcon,
  CloseIcon,
} from "./Icons";

interface ChatProps {
  journalEntries: JournalEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ journalEntries, isOpen, onClose }) => {
  const {
    messages,
    input,
    isLoading,
    messagesEndRef,
    inputRef,
    handleSendMessage,
    setInput,
  } = useChat(journalEntries, isOpen);

  return (
    <div
      className={`fixed inset-0 z-60 ${isOpen ? "" : "pointer-events-none"}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b flex justify-between items-center flex-shrink-0 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Chat
            </h2>
          </div>
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Close chat"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-10 h-full flex flex-col justify-center dark:text-gray-400">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Chat is ready
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ask a question to get started.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "model" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {msg.role === "model" && msg.text === "" && isLoading ? (
                    <div className="flex items-center justify-center space-x-1.5 h-5">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-1.e h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t rounded-b-xl flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isLoading ? (
                <LoaderIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
