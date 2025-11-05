import { useState, useEffect, useRef } from "react";
import { JournalEntry, ChatMessage } from "../types";
import { startChat, sendChatMessage } from "../services/geminiService";
import { bind } from "wanakana";

export default function useChat(
  journalEntries: JournalEntry[],
  isOpen: boolean,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (inputRef.current) {
      bind(inputRef.current);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      try {
        startChat(journalEntries);
      } catch (error) {
        console.error("Failed to start chat:", error);
      }
    }
  }, [isOpen, journalEntries]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "日記のことでも何でも、何でも聞いてください。ぜひ試してみてください！",
        },
      ]);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = inputRef.current?.value || "";

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: text,
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
      let modelResponse = "";
      await sendChatMessage(text, (chunk: string) => {
        modelResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg,
          ),
        );
      });
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

  return {
    messages,
    input,
    isLoading,
    messagesEndRef,
    inputRef,
    handleSendMessage,
    setInput,
  };
}
