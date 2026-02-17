import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? (
                <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 transform hover:scale-110 transition-transform" />
            ) : (
                <SunIcon className="h-6 w-6 text-yellow-500 transform hover:scale-110 transition-transform" />
            )}
        </button>
    );
};

export default ThemeToggle;
