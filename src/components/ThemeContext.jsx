import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [primary, setPrimary] = useState(() => localStorage.getItem('primaryColor') || '#ef4444');
  const [accent, setAccent] = useState(() => localStorage.getItem('accentColor') || '#22d3ee');

  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && systemDark);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', primary);
    localStorage.setItem('primaryColor', primary);
  }, [primary]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--accent', accent);
    localStorage.setItem('accentColor', accent);
  }, [accent]);

  const value = useMemo(() => ({ theme, setTheme, primary, setPrimary, accent, setAccent }), [theme, primary, accent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
