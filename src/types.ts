export enum JLPTLevel {
  N5 = "N5",
  N4 = "N4",
  N3 = "N3",
  N2 = "N2",
  N1 = "N1",
}

export interface Feedback {
  correctedText: string;
  grammarFeedback: {
    mistake: string;
    correction: string;
    explanation: string;
  }[];
  vocabularyFeedback: {
    word: string;
    suggestion: string;
    explanation: string;
  }[];
  overallComment: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  originalText: string;
  feedback: Feedback | null;
  isLoading: boolean;
  jlptLevel: JLPTLevel;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

export enum Theme {
  System = "system",
  Light = "light",
  Dark = "dark",
}
