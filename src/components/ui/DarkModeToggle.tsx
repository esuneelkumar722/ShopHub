import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    return theme === 'light' ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />;
  };

  const getLabel = () => {
    return `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
};
