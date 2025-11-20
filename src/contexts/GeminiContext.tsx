import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { GoogleGenAI, Chat as GeminiChat, Type } from "@google/genai";
import { Feedback, JLPTLevel, JournalEntry, ChatMessage } from "../types";
import { useSettings } from "./SettingsContext";

interface GeminiContextType {
  ai: GoogleGenAI | null;
  isApiKeySet: boolean;
  getJournalFeedback: (text: string, level: JLPTLevel) => Promise<Feedback>;
  startChat: (journalEntries: JournalEntry[]) => void;
  sendChatMessage: (message: string) => Promise<void>;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isLoading: boolean;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useGemini = () => {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGemini must be used within a GeminiProvider");
  }
  return context;
};

const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    correctedText: { type: Type.STRING, description: "Corrected version." },
    grammarFeedback: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mistake: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["mistake", "correction", "explanation"],
      },
    },
    vocabularyFeedback: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["word", "suggestion", "explanation"],
      },
    },
    overallComment: { type: Type.STRING },
    overallScore: { type: Type.INTEGER, minimum: 0, maximum: 100 },
  },
  required: [
    "correctedText",
    "grammarFeedback",
    "vocabularyFeedback",
    "overallComment",
    "overallScore",
  ],
};

export const GeminiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { apiKey } = useSettings();
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<GeminiChat | null>(null);

  useEffect(() => {
    if (apiKey) {
      setAi(new GoogleGenAI({ apiKey }));
    } else {
      setAi(null);
    }
  }, [apiKey]);

  const getJournalFeedback = useCallback(
    async (text: string, level: JLPTLevel): Promise<Feedback> => {
      if (!ai) throw new Error("API key not set");
      setIsLoading(true);

      const prompt = `
      Act as a Japanese language teacher. Analyze this journal entry by a ${level} student.
      Provide feedback in JSON. Explanations in English.
      Entry:
      ---
      ${text}
      ---
    `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: feedbackSchema,
          },
        });

        const jsonString = response.text?.trim();
        if (!jsonString) throw new Error("Empty response");
        return JSON.parse(jsonString);
      } catch (error) {
        console.error("Feedback generation failed", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ai],
  );

  const startChat = useCallback(
    (journalEntries: JournalEntry[]) => {
      if (!ai) return;

      const context = journalEntries
        .map(
          (e) =>
            `Date: ${new Date(e.date).toLocaleDateString()}\nEntry:\n${e.originalText}\n---`,
        )
        .join("\n\n");

      const systemInstruction = `You are a helpful Japanese tutor.
User's journal entries for context:
---
${context}
---
Answer questions about their journal or Japanese in general.`;

      chatRef.current = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction },
      });
      setChatMessages([]); // Reset on start or maybe keep? Reset is safer for new context.
    },
    [ai],
  );

  const sendChatMessage = useCallback(async (message: string) => {
    if (!chatRef.current) throw new Error("Chat not started");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: message,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // Create a placeholder for the model response
      const modelMsgId = (Date.now() + 1).toString();
      // We wait for the first chunk to add the message to the state
      // to avoid showing an empty bubble along with the loading spinner.

      const stream = await chatRef.current.sendMessageStream({ message });

      let isFirstChunk = true;

      for await (const chunk of stream) {
        const text = chunk.text || "";
        
        if (isFirstChunk) {
          if (!text) continue; // Skip empty initial chunks
          setChatMessages((prev) => [
            ...prev,
            { id: modelMsgId, role: "model", text: text },
          ]);
          isFirstChunk = false;
        } else {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMsgId ? { ...msg, text: msg.text + text } : msg,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Error: Failed to send message.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  return (
    <GeminiContext.Provider
      value={{
        ai,
        isApiKeySet: !!ai,
        getJournalFeedback,
        startChat,
        sendChatMessage,
        isLoading,
        chatMessages,
        isChatLoading,
      }}
    >
      {children}
    </GeminiContext.Provider>
  );
};
