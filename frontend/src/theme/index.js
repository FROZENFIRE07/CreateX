/**
 * SACO Custom Theme
 * Chakra UI theme with design tokens for the AI content platform
 * Supports Dark & Light modes via semantic tokens
 */

import { extendTheme } from '@chakra-ui/react';

// Brand color scale (primary: #FF6B01 - Orange)
const colors = {
    brand: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#FF6B01', // Primary — matches dashboard
        600: '#E85F00',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
    },
    accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Secondary — warm amber
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    },
    success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#4ADE80',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#F87171',
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
    // Surface colors kept as raw values for backward compat
    surface: {
        bg: '#1A1A1A',
        card: '#353535',
        cardHover: '#444444',
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
    glow: '0 0 20px rgba(255, 107, 1, 0.35)',
    glowLg: '0 0 40px rgba(255, 107, 1, 0.45)',
    glowAccent: '0 0 20px rgba(245, 158, 11, 0.3)',
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
            ghost: (props) => ({
                color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
                _hover: {
                    bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
                    color: props.colorMode === 'dark' ? 'white' : 'gray.900',
                },
            }),
        },
        defaultProps: {
            variant: 'primary',
        },
    },
    Card: {
        baseStyle: (props) => ({
            container: {
                bg: props.colorMode === 'dark' ? 'surface.card' : 'white',
                borderRadius: 'xl',
                border: '1px solid',
                borderColor: props.colorMode === 'dark' ? 'surface.border' : 'gray.200',
                transition: 'all 0.2s ease',
                _hover: {
                    borderColor: props.colorMode === 'dark' ? 'surface.borderHover' : 'gray.300',
                    boxShadow: 'lg',
                },
            },
        }),
    },
    Input: {
        variants: {
            filled: (props) => ({
                field: {
                    bg: props.colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50',
                    border: '1px solid',
                    borderColor: props.colorMode === 'dark' ? 'surface.border' : 'gray.200',
                    borderRadius: 'lg',
                    color: props.colorMode === 'dark' ? 'white' : 'gray.800',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
                        borderColor: props.colorMode === 'dark' ? 'surface.borderHover' : 'gray.300',
                    },
                    _focus: {
                        bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px rgba(255, 107, 1, 0.5)',
                    },
                },
            }),
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
    global: (props) => ({
        'html, body': {
            bg: props.colorMode === 'dark' ? 'surface.bg' : '#F7F7F8',
            color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
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
            bg: props.colorMode === 'dark' ? 'surface.bg' : 'gray.100',
        },
        '::-webkit-scrollbar-thumb': {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200',
            borderRadius: 'full',
        },
        '::-webkit-scrollbar-thumb:hover': {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'blackAlpha.300',
        },
    }),
};

// Semantic tokens for dark/light mode
const semanticTokens = {
    colors: {
        'chakra-body-bg': {
            _dark: 'surface.bg',
            _light: '#F7F7F8',
        },
        'chakra-body-text': {
            _dark: 'gray.100',
            _light: 'gray.800',
        },
        'surface-bg': {
            _dark: '#1A1A1A',
            _light: '#F7F7F8',
        },
        'surface-card': {
            _dark: '#353535',
            _light: '#FFFFFF',
        },
        'surface-card-hover': {
            _dark: '#444444',
            _light: '#F5F5F5',
        },
        'surface-border': {
            _dark: 'rgba(255, 255, 255, 0.08)',
            _light: 'rgba(0, 0, 0, 0.08)',
        },
        'surface-border-hover': {
            _dark: 'rgba(255, 255, 255, 0.15)',
            _light: 'rgba(0, 0, 0, 0.15)',
        },
        'text-primary': {
            _dark: 'gray.100',
            _light: 'gray.800',
        },
        'text-secondary': {
            _dark: 'gray.400',
            _light: 'gray.600',
        },
        'text-muted': {
            _dark: 'gray.500',
            _light: 'gray.500',
        },
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
