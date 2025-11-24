import React, { useEffect, useState, useRef } from "react";
import { useGemini } from "../contexts/GeminiContext";
import { useJournal } from "../contexts/JournalContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  SendIcon,
  UserIcon,
  LoaderIcon,
  ChatBubbleIcon,
  SparklesIcon,
  MicrophoneIcon,
  StopIcon,
} from "../components/ui/Icons";

export const ChatView: React.FC = () => {
  const {
    startChat,
    sendChatMessage,
    chatMessages,
    isChatLoading,
    isApiKeySet,
    isLiveActive,
    toggleLive,
  } = useGemini();
  const { entries } = useJournal();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isApiKeySet) {
      // Start chat only if not already started or if context changed?
      // For simplicity, start on mount to ensure fresh context.
      startChat(entries);
    }
  }, [isApiKeySet, startChat, entries]); // Dependencies might cause restart on every entry change, which is good for context update.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const msg = input;
    setInput("");
    await sendChatMessage(msg);
  };

  if (!isApiKeySet) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ChatBubbleIcon className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          API Key Required
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
          Please add your Gemini API key in Settings to use the chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-60px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <ChatBubbleIcon className="w-12 h-12 mb-4" />
            <p>Ask me anything about your Japanese journal entries!</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {msg.role === "user" ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
              </div>
              <div
                className={`p-3 rounded-lg max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isChatLoading &&
          chatMessages[chatMessages.length - 1]?.role !== "model" && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        {(chatMessages.length > 0 || isChatLoading) && (
          <div ref={messagesEndRef} />
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <form onSubmit={handleSend} className="flex gap-2 max-w-3xl mx-auto">
          <div className="relative flex-1">
            {isLiveActive && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <MicrophoneIcon className="w-5 h-5 text-emerald-500 animate-pulse" />
              </div>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLiveActive ? "Listening..." : "Ask a question..."}
              className={`w-full transition-all duration-200 ${
                isLiveActive
                  ? "!pl-10 !border-emerald-400 dark:!border-emerald-500 !bg-emerald-50 dark:!bg-emerald-900/20 placeholder:!text-emerald-400 dark:placeholder:!text-emerald-300 animate-pulse disabled:!opacity-100"
                  : ""
              }`}
              disabled={isChatLoading || isLiveActive}
            />
          </div>
          <Button
            type="button"
            variant={isLiveActive ? "danger" : "outline"}
            size="icon"
            onClick={() => toggleLive(entries)}
            className={
              isLiveActive
                ? "animate-pulse"
                : "text-indigo-500 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50"
            }
            title={isLiveActive ? "Stop Live Session" : "Start Live Session"}
          >
            {isLiveActive ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </Button>
          <Button
            type="submit"
            disabled={!input.trim() || isChatLoading || isLiveActive}
            size="icon"
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
