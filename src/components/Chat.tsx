import React, { useState, useEffect, useRef } from "react";
import { JournalEntry, ChatMessage } from "../types";
import { GoogleGenAI, Chat as GeminiChat } from "@google/genai";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      console.error("Gemini API key not found in local storage.");
      // Optionally, you could show a message to the user in the chat window
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const journalContext = journalEntries
      .map(
        (entry) =>
          `Date: ${new Date(entry.date).toLocaleDateString()}\nEntry:\n${entry.originalText}\n---`,
      )
      .join("\n\n");

    const systemInstruction = `You are a helpful and friendly Japanese language tutor. 
The user is maintaining a journal to practice Japanese. 
You will answer questions they have about their journal entries. 
Here are their entries so far, use them as context for your answers.
Do not mention this context instruction unless the user asks for it.
---
CONTEXT:
${journalContext}
---
`;

    chatRef.current = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
    });

    if (messages.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Your journal has been updated. I am now aware of your new entries. How can I help?",
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [journalEntries, messages.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    const modelMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: modelMessageId, role: "model", text: "" },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      if (!chatRef.current) throw new Error("Chat not initialized");

      const stream = await chatRef.current.sendMessageStream({
        message: input,
      });

      let modelResponse = "";

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId ? { ...msg, text: errorMessage } : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-60 ${isOpen ? "" : "pointer-events-none"}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Journal Chat</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ask me anything about your entries.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close chat"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-10 h-full flex flex-col justify-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chat is ready
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ask a question to get started.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "model" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-md p-3 rounded-lg ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                  {msg.role === "model" && msg.text === "" && isLoading ? (
                    <div className="flex items-center justify-center space-x-1.5 h-5">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
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

        <div className="p-4 bg-white border-t rounded-b-xl flex-shrink-0">
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
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
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
