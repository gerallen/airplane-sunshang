import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppState {
  selectedModelId: string;
  selectedTireId: string | null;
  setSelectedModelId: (id: string) => void;
  setSelectedTireId: (id: string | null) => void;
  resetView: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children, initialModelId = 'A320' }: { children: ReactNode; initialModelId?: string }) {
  const [selectedModelId, setSelectedModelId] = useState(initialModelId);
  const [selectedTireId, setSelectedTireId] = useState<string | null>(null);

  const resetView = () => setSelectedTireId(null);

  return (
    <AppContext.Provider value={{ selectedModelId, selectedTireId, setSelectedModelId, setSelectedTireId, resetView }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
