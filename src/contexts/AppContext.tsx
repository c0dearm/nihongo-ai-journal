import React, { ReactNode } from 'react';
import { SettingsProvider } from './SettingsContext';
import { GeminiProvider } from './GeminiContext';
import { JournalProvider } from './JournalContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <GeminiProvider>
        <JournalProvider>
          {children}
        </JournalProvider>
      </GeminiProvider>
    </SettingsProvider>
  );
};
