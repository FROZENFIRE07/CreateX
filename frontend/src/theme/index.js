/**
 * SACO Custom Theme
 * Chakra UI theme with design tokens for the AI content platform
 */

import { extendTheme } from '@chakra-ui/react';

// Brand color scale (primary: #6366f1 - Indigo)
const colors = {
    brand: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1', // Primary
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
    },
    accent: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#8b5cf6', // Secondary
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
    },
    success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
    },
    // Dark theme surface colors
    surface: {
        bg: '#0a0a0f',
        card: '#12121a',
        cardHover: '#1a1a24',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
    },
};

// Typography
const fonts = {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const fontSizes = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
};

// Spacing scale (4px base)
const space = {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
};

// Border radius
const radii = {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
};

// Shadows with brand color glow
const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
    glowLg: '0 0 40px rgba(99, 102, 241, 0.4)',
    glowAccent: '0 0 20px rgba(139, 92, 246, 0.3)',
};

// Component style overrides
const components = {
    Button: {
        baseStyle: {
            fontWeight: '600',
            borderRadius: 'lg',
            transition: 'all 0.2s ease',
        },
        variants: {
            primary: {
                bg: 'brand.500',
                color: 'white',
                _hover: {
                    bg: 'brand.600',
                    transform: 'translateY(-1px)',
                    boxShadow: 'glow',
                },
                _active: {
                    bg: 'brand.700',
                    transform: 'translateY(0)',
                },
            },
            secondary: {
                bg: 'transparent',
                color: 'brand.400',
                border: '1px solid',
                borderColor: 'brand.500',
                _hover: {
                    bg: 'brand.500',
                    color: 'white',
                },
            },
            ghost: {
                color: 'gray.400',
                _hover: {
                    bg: 'whiteAlpha.100',
                    color: 'white',
                },
            },
        },
        defaultProps: {
            variant: 'primary',
        },
    },
    Card: {
        baseStyle: {
            container: {
                bg: 'surface.card',
                borderRadius: 'xl',
                border: '1px solid',
                borderColor: 'surface.border',
                transition: 'all 0.2s ease',
                _hover: {
                    borderColor: 'surface.borderHover',
                    boxShadow: 'lg',
                },
            },
        },
    },
    Input: {
        variants: {
            filled: {
                field: {
                    bg: 'whiteAlpha.50',
                    border: '1px solid',
                    borderColor: 'surface.border',
                    borderRadius: 'lg',
                    _hover: {
                        bg: 'whiteAlpha.100',
                        borderColor: 'surface.borderHover',
                    },
                    _focus: {
                        bg: 'whiteAlpha.100',
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    },
                },
            },
        },
        defaultProps: {
            variant: 'filled',
        },
    },
    Heading: {
        baseStyle: {
            fontWeight: '700',
            letterSpacing: '-0.02em',
        },
    },
    Badge: {
        baseStyle: {
            borderRadius: 'full',
            px: 3,
            py: 1,
            fontWeight: '600',
            fontSize: 'xs',
            textTransform: 'none',
        },
        variants: {
            success: {
                bg: 'success.500',
                color: 'white',
            },
            error: {
                bg: 'error.500',
                color: 'white',
            },
            warning: {
                bg: 'warning.500',
                color: 'white',
            },
            info: {
                bg: 'brand.500',
                color: 'white',
            },
            processing: {
                bg: 'accent.500',
                color: 'white',
            },
        },
    },
};

// Global styles
const styles = {
    global: {
        'html, body': {
            bg: 'surface.bg',
            color: 'gray.100',
            lineHeight: 'tall',
        },
        '*::selection': {
            bg: 'brand.500',
            color: 'white',
        },
        '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '::-webkit-scrollbar-track': {
            bg: 'surface.bg',
        },
        '::-webkit-scrollbar-thumb': {
            bg: 'whiteAlpha.200',
            borderRadius: 'full',
        },
        '::-webkit-scrollbar-thumb:hover': {
            bg: 'whiteAlpha.300',
        },
    },
};

// Semantic tokens for dark mode (primarily dark theme)
const semanticTokens = {
    colors: {
        'chakra-body-bg': 'surface.bg',
        'chakra-body-text': 'gray.100',
    },
};

// Assemble the theme
const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    colors,
    fonts,
    fontSizes,
    space,
    radii,
    shadows,
    components,
    styles,
    semanticTokens,
});

export default theme;
