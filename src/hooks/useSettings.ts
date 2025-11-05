import { useState, useEffect } from "react";
import { JLPTLevel, Theme } from "../types";
import { setApiKey as setGeminiApiKey } from "../services/geminiService";
import { LOCAL_STORAGE_KEYS } from "../constants";

export default function useSettings() {
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(() => {
    const savedJlptLevel = localStorage.getItem(LOCAL_STORAGE_KEYS.JLPT_LEVEL);
    return (savedJlptLevel as JLPTLevel) || JLPTLevel.N5;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    return (savedTheme as Theme) || Theme.System;
  });

  useEffect(() => {
    const savedApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.GEMINI_API_KEY);
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.JLPT_LEVEL, jlptLevel);
  }, [jlptLevel]);

  useEffect(() => {
    if (
      theme === Theme.Dark ||
      (theme === Theme.System &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const saveSettings = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GEMINI_API_KEY, apiKey);
  };

  return {
    jlptLevel,
    setJlptLevel,
    theme,
    setTheme,
    saveSettings,
  };
}
