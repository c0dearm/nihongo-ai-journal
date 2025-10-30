import { GoogleGenAI, Type } from "@google/genai";
import { Feedback, JLPTLevel } from "../types";

let ai: GoogleGenAI;

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
  },
  required: [
    "correctedText",
    "grammarFeedback",
    "vocabularyFeedback",
    "overallComment",
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
