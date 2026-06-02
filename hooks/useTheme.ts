'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('orion9-theme');
    const preferDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(preferDark);
    document.documentElement.classList.toggle('dark', preferDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    window.localStorage.setItem('orion9-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return { isDark, toggleTheme };
}
