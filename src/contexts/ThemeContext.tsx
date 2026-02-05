import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  mode: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  resetToSystem: () => void;
  setThemeMode: (newMode: 'light' | 'dark' | 'system') => void;
}

export type { ThemeContextType };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem('themeMode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system'; // Default to system
  });

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return mode === 'system' ? systemTheme : mode;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mode === 'system') {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      // Only toggle between light and dark in header
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      setTheme(next);
      return next;
    });
  };

  const resetToSystem = () => {
    setMode('system');
    localStorage.removeItem('themeMode');
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    if (newMode === 'system') {
      localStorage.removeItem('themeMode');
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      localStorage.setItem('themeMode', newMode);
      setTheme(newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, resetToSystem, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
