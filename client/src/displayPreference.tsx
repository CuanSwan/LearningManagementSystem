import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ColorScheme, LessonDisplayMode } from "./types.js";
import { getPreferences, setColorScheme as setColorSchemeApi, setPreferences } from "./api.js";

interface DisplayPreferenceState {
  mode: LessonDisplayMode | null;
  loading: boolean;
  choose: (mode: LessonDisplayMode) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const DisplayPreferenceContext = createContext<DisplayPreferenceState | null>(null);

export function DisplayPreferenceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LessonDisplayMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");

  useEffect(() => {
    getPreferences()
      .then((p) => {
        setMode(p.lessonDisplayMode);
        setColorSchemeState(p.colorScheme ?? "light");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = colorScheme;
  }, [colorScheme]);

  function choose(next: LessonDisplayMode) {
    setMode(next);
    setPreferences(next);
  }

  function setColorScheme(next: ColorScheme) {
    setColorSchemeState(next);
    setColorSchemeApi(next);
  }

  return (
    <DisplayPreferenceContext.Provider value={{ mode, loading, choose, colorScheme, setColorScheme }}>
      {children}
    </DisplayPreferenceContext.Provider>
  );
}

export function useDisplayPreference(): DisplayPreferenceState {
  const ctx = useContext(DisplayPreferenceContext);
  if (!ctx) throw new Error("useDisplayPreference must be used within a DisplayPreferenceProvider");
  return ctx;
}
