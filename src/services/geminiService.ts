import { GoogleGenAI, Type, Chat as GeminiChat } from "@google/genai";
import { Feedback, JLPTLevel, JournalEntry } from "../types";

let ai: GoogleGenAI;
let chat: GeminiChat | null = null;

export const setApiKey = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
};

const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    correctedText: {
      type: Type.STRING,
      description:
        "The corrected, natural-sounding version of the user's journal entry.",
    },
    grammarFeedback: {
      type: Type.ARRAY,
      description: "Specific grammar mistakes found in the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          mistake: {
            type: Type.STRING,
            description: "The incorrect phrase or part of the sentence.",
          },
          correction: {
            type: Type.STRING,
            description: "The correct phrase or part of the sentence.",
          },
          explanation: {
            type: Type.STRING,
            description: `A clear explanation of the grammar rule, tailored for a ${JLPTLevel} learner.`,
          },
        },
        required: ["mistake", "correction", "explanation"],
      },
    },
    vocabularyFeedback: {
      type: Type.ARRAY,
      description: "Suggestions for better vocabulary choices.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
            description: "The original word used by the user.",
          },
          suggestion: {
            type: Type.STRING,
            description: "A more natural or appropriate word or phrase.",
          },
          explanation: {
            type: Type.STRING,
            description: `An explanation of why the suggestion is better, tailored for a ${JLPTLevel} learner.`,
          },
        },
        required: ["word", "suggestion", "explanation"],
      },
    },
    overallComment: {
      type: Type.STRING,
      description: `A brief, encouraging overall comment on the journal entry for a ${JLPTLevel} learner.`,
    },
    jlptScore: {
      type: Type.NUMBER,
      description: `A score from 0 to 100 representing the correctness of the entry for a ${JLPTLevel} learner.`,
    },
  },
  required: [
    "correctedText",
    "grammarFeedback",
    "vocabularyFeedback",
    "overallComment",
    "jlptScore",
  ],
};

export const getJournalFeedback = async (
  text: string,
  level: JLPTLevel,
): Promise<Feedback> => {
  if (!ai) {
    throw new Error("API key not set. Please set it in the settings.");
  }

  const prompt = `
    You are a friendly and encouraging Japanese language teacher. 
    A student at the ${level} level has written the following journal entry. 
    Please analyze it and provide feedback in the specified JSON format.
    Your explanations should be simple and easy for a ${level} learner to understand.
    Use English for all explanations and feedback.
    Also, provide a 'jlptScore' from 0 to 100, indicating the correctness of the entry for a ${level} learner.

    Journal Entry:
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
    if (!jsonString) {
      throw new Error("Empty response from Gemini API.");
    }
    const feedback: Feedback = JSON.parse(jsonString);
    return feedback;
  } catch (error) {
    console.error("Error generating journal feedback:", error);
    throw new Error("Failed to get feedback from Gemini API.");
  }
};

export const startChat = (journalEntries: JournalEntry[]) => {
  if (!ai) {
    throw new Error("API key not set. Please set it in the settings.");
  }

  const journalContext = journalEntries
    .map(
      (entry) =>
        `Date: ${new Date(
          entry.date,
        ).toLocaleDateString()}\nEntry:\n${entry.originalText}\n---`,
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

  chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendChatMessage = async (
  message: string,
  onChunk: (chunk: string) => void,
) => {
  if (!chat) {
    throw new Error("Chat not initialized. Call startChat first.");
  }

  try {
    const stream = await chat.sendMessageStream({
      message: message,
    });

    for await (const chunk of stream) {
      onChunk(chunk.text ?? "");
    }
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to send message to Gemini API.");
  }
};
