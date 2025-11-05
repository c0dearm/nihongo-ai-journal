import { useState, useEffect } from "react";
import { JLPTLevel, Theme, LocalStorageKeys } from "../types";
import { useGemini } from "../hooks/useGemini";

export default function useSettings() {
  const { setApiKey: setGeminiApiKey } = useGemini();
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(() => {
    const savedJlptLevel = localStorage.getItem(LocalStorageKeys.jlptLevel);
    return (savedJlptLevel as JLPTLevel) || JLPTLevel.N5;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(LocalStorageKeys.theme);
    return (savedTheme as Theme) || Theme.System;
  });

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.jlptLevel, jlptLevel);
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
    localStorage.setItem(LocalStorageKeys.theme, theme);
  }, [theme]);

  const saveSettings = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem(LocalStorageKeys.geminiApiKey, apiKey);
  };

  return {
    jlptLevel,
    setJlptLevel,
    theme,
    setTheme,
    saveSettings,
  };
}
