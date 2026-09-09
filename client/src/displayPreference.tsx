import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPreferences, setPreferences, type LessonDisplayMode } from "./api.js";

interface DisplayPreferenceState {
  mode: LessonDisplayMode | null;
  loading: boolean;
  choose: (mode: LessonDisplayMode) => void;
}

const DisplayPreferenceContext = createContext<DisplayPreferenceState | null>(null);

export function DisplayPreferenceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LessonDisplayMode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferences()
      .then((p) => setMode(p.lessonDisplayMode))
      .finally(() => setLoading(false));
  }, []);

  function choose(next: LessonDisplayMode) {
    setMode(next);
    setPreferences(next);
  }

  return (
    <DisplayPreferenceContext.Provider value={{ mode, loading, choose }}>{children}</DisplayPreferenceContext.Provider>
  );
}

export function useDisplayPreference(): DisplayPreferenceState {
  const ctx = useContext(DisplayPreferenceContext);
  if (!ctx) throw new Error("useDisplayPreference must be used within a DisplayPreferenceProvider");
  return ctx;
}
