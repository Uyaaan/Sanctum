'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('sanctum-theme') ?? 'system';
  });

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  function setAndPersist(next) {
    setTheme(next);
    localStorage.setItem('sanctum-theme', next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndPersist }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
}
