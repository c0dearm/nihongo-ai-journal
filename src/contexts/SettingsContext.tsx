import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { JLPTLevel, Theme, LocalStorageKeys } from "../types";

interface SettingsContextType {
  jlptLevel: JLPTLevel;
  setJlptLevel: (level: JLPTLevel) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  preferredVoice: string;
  setPreferredVoice: (voice: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>(() => {
    return (
      (localStorage.getItem(LocalStorageKeys.jlptLevel) as JLPTLevel) ||
      JLPTLevel.N5
    );
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (
      (localStorage.getItem(LocalStorageKeys.theme) as Theme) || Theme.System
    );
  });

  const [preferredVoice, setPreferredVoice] = useState<string>(() => {
    return localStorage.getItem(LocalStorageKeys.preferredVoice) || "Kore";
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(LocalStorageKeys.geminiApiKey) || "";
  });

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.jlptLevel, jlptLevel);
  }, [jlptLevel]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === Theme.System) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem(LocalStorageKeys.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.preferredVoice, preferredVoice);
  }, [preferredVoice]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(LocalStorageKeys.geminiApiKey, apiKey);
    }
  }, [apiKey]);

  return (
    <SettingsContext.Provider
      value={{
        jlptLevel,
        setJlptLevel,
        theme,
        setTheme,
        apiKey,
        setApiKey,
        preferredVoice,
        setPreferredVoice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
