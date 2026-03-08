/**
 * Theme Context
 * Wraps Chakra UI's useColorMode for global theme state.
 * Persists via Chakra's built-in localStorage key (chakra-ui-color-mode).
 */

import React, { createContext, useContext } from 'react';
import { useColorMode } from '@chakra-ui/react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const { colorMode, toggleColorMode, setColorMode } = useColorMode();

    const value = {
        colorMode,       // 'light' | 'dark'
        isDark: colorMode === 'dark',
        toggleColorMode,
        setColorMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export default ThemeContext;
