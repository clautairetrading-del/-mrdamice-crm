'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Basculer le mode sombre"
      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700/60 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-sm flex items-center justify-center gap-2 group"
    >
      {isDark ? (
        <>
          <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-semibold text-gray-200 hidden sm:inline">Jour</span>
        </>
      ) : (
        <>
          <Moon className="w-5 h-5 text-amber-600 group-hover:-rotate-12 transition-transform" />
          <span className="text-xs font-semibold text-gray-700 hidden sm:inline">Nuit</span>
        </>
      )}
    </button>
  );
}
