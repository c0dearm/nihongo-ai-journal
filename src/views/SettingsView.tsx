import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useJournal } from '../contexts/JournalContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { JLPTLevel, Theme } from '../types';

export const SettingsView: React.FC = () => {
  const { apiKey, setApiKey, jlptLevel, setJlptLevel, theme, setTheme } = useSettings();
  const { exportJournal } = useJournal();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = () => {
    setApiKey(keyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Gemini API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Required for AI feedback and chat features.</p>
          <div className="flex gap-2">
            <Input 
              type="password" 
              value={keyInput} 
              onChange={(e) => setKeyInput(e.target.value)} 
              placeholder="Enter your API Key" 
            />
            <Button onClick={handleSaveKey}>
              {isSaved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Level</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Adjusts the difficulty of AI feedback.</p>
          <div className="grid grid-cols-5 gap-2">
            {Object.values(JLPTLevel).map((level) => (
              <button
                key={level}
                onClick={() => setJlptLevel(level)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                  jlptLevel === level
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
             {[Theme.Light, Theme.Dark, Theme.System].map((t) => (
               <button
                 key={t}
                 onClick={() => setTheme(t)}
                 className={`capitalize py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                   theme === t
                     ? 'bg-indigo-600 text-white border-indigo-600'
                     : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                 }`}
               >
                 {t}
               </button>
             ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Download a backup of your journal entries.</p>
          <Button variant="outline" onClick={exportJournal}>Export JSON</Button>
        </CardContent>
      </Card>
    </div>
  );
};
