import React, { useState } from "react";
import { AppProvider } from "./contexts/AppContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { JournalView } from "./views/JournalView";
import { ChatView } from "./views/ChatView";
import { SettingsView } from "./views/SettingsView";
import { StatsView } from "./views/StatsView";
import { View } from "./types";

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("journal");

  const renderView = () => {
    switch (currentView) {
      case "journal":
        return <JournalView />;
      case "chat":
        return <ChatView />;
      case "settings":
        return <SettingsView />;
      case "stats":
        return <StatsView />;
      default:
        return <JournalView />;
    }
  };

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
