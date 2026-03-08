/**
 * OrchAI Frontend App — Platform-Centric Dashboard
 * Routing, auth context, Brand DNA provider, and page transitions
 * Orange theme with right-side SideNav navigation
 */

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
    Box, Flex, HStack, VStack, Text, Button, IconButton,
    Avatar, Spinner, Center, Link, Tooltip, Image,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import {
    FiZap, FiHome, FiSettings, FiBarChart2, FiGrid, FiUploadCloud, FiTarget,
} from 'react-icons/fi';
import { SiInstagram, SiLinkedin } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { FiMail, FiBookOpen } from 'react-icons/fi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandDNAProvider, useBrandDNA } from './context/BrandDNAContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PageTransition, showToast, KeyboardShortcutsModal, useKeyboardShortcuts } from './components/common';
import WelcomeScreen from './components/Welcome/WelcomeScreen';

// Lazy load pages for code splitting
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const SacoDashboard = lazy(() => import('./components/Dashboard/SacoDashboard'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ContentUpload = lazy(() => import('./components/Upload/ContentUpload'));
const ContentDetail = lazy(() => import('./components/Content/ContentDetail'));
const BrandSettings = lazy(() => import('./components/Brand/BrandSettings'));
const Settings = lazy(() => import('./components/Settings'));
const PlatformLibrary = lazy(() => import('./components/Libraries/PlatformLibrary'));
const PerformanceAnalytics = lazy(() => import('./components/Analytics/PerformanceAnalytics'));
const History = lazy(() => import('./components/History/History'));

const MotionBox = motion(Box);

// Loading fallback
const LoadingFallback = () => (
    <Center h="100vh" bg="surface.bg">
        <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" thickness="3px" />
            <Text color="gray.400">Loading...</Text>
        </VStack>
    </Center>
);

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingFallback />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// ─── Modern Side Navigation (right side, auto-expand on hover) ───
function SideNav() {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const navItems = [
        { icon: FiHome, label: 'Dashboard', path: '/' },
        { icon: FiUploadCloud, label: 'Upload', path: '/upload' },
        { icon: FiTarget, label: 'Brand DNA', path: '/brand' },
        { icon: FiGrid, label: 'Libraries', path: '/libraries', isGroup: true },
        { icon: FiBarChart2, label: 'Analytics', path: '/analytics' },
        { icon: FiSettings, label: 'Settings', path: '/settings' },
    ];

    const libraryItems = [
        { icon: SiInstagram, label: 'Instagram', path: '/library/instagram' },
        { icon: FiBookOpen, label: 'Blogs', path: '/library/blogs' },
        { icon: SiLinkedin, label: 'LinkedIn', path: '/library/linkedin' },
        { icon: FiMail, label: 'Emails', path: '/library/email' },
        { icon: FaXTwitter, label: 'Twitter (X)', path: '/library/twitter' },
    ];

    const isLibraryActive = location.pathname.startsWith('/library');

    return (
        <MotionBox
            position="fixed"
            right={0} top="50%" transform="translateY(-50%)"
            zIndex={99}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            animate={{ width: isExpanded ? 220 : 60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            bg={isDark ? 'rgba(53, 53, 53, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
            backdropFilter="blur(20px)"
            border="1px solid" borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
            borderRight="none" roundedLeft="2xl"
            py={4} px={2} overflow="hidden"
            boxShadow={isDark ? '-4px 0 30px rgba(0, 0, 0, 0.3)' : '-4px 0 30px rgba(0, 0, 0, 0.08)'}
            display={{ base: 'none', md: 'block' }}
        >
            {/* Orange accent line */}
            <Box position="absolute" top={0} left={0} w="2px" h="100%" bg="#FF6B01" opacity={0.6} />

            <VStack spacing={1} align="stretch">
                {navItems.map((item) => {
                    const isActive = item.isGroup ? isLibraryActive : location.pathname === item.path;

                    return (
                        <Box key={item.path}>
                            <MotionBox
                                as="button"
                                onClick={() => {
                                    if (item.isGroup) {
                                        navigate('/library/instagram');
                                    } else {
                                        navigate(item.path);
                                    }
                                }}
                                display="flex" alignItems="center" gap={3}
                                w="100%" px={3} py={2.5} rounded="xl"
                                bg={isActive ? 'rgba(255, 107, 1, 0.1)' : 'transparent'}
                                border="1px solid"
                                borderColor={isActive ? '#FF6B01' : 'transparent'}
                                cursor="pointer"
                                _hover={{ bg: isActive ? 'rgba(255, 107, 1, 0.1)' : isDark ? 'whiteAlpha.50' : 'blackAlpha.50' }}
                                whileHover={{ x: -2, transition: { duration: 0.15 } }}
                                position="relative" overflow="hidden" textAlign="left" minH="40px"
                            >
                                {isActive && (
                                    <Box position="absolute" left={0} top="50%" transform="translateY(-50%)"
                                        w="3px" h="60%" bg="#FF6B01" rounded="full"
                                        boxShadow="0 0 10px rgba(255,107,1,0.35)" />
                                )}
                                <Box as={item.icon} boxSize={4}
                                    color={isActive ? '#FF6B01' : isDark ? 'gray.400' : 'gray.500'} flexShrink={0} />
                                <MotionBox
                                    animate={{ opacity: isExpanded ? 1 : 0 }}
                                    transition={{ duration: isExpanded ? 0.3 : 0.1, delay: isExpanded ? 0.1 : 0 }}
                                    overflow="hidden" whiteSpace="nowrap"
                                >
                                    <Text fontSize="sm" fontWeight={isActive ? '700' : '500'}
                                        color={isActive ? (isDark ? 'white' : 'gray.800') : (isDark ? 'gray.400' : 'gray.600')}>
                                        {item.label}
                                    </Text>
                                </MotionBox>
                            </MotionBox>

                            {/* Library sub-items */}
                            {item.isGroup && isExpanded && (
                                <VStack spacing={0} pl={4} mt={1} align="stretch">
                                    {libraryItems.map((lib) => {
                                        const isSubActive = location.pathname === lib.path;
                                        return (
                                            <MotionBox
                                                key={lib.path}
                                                as="button"
                                                onClick={() => navigate(lib.path)}
                                                display="flex" alignItems="center" gap={2.5}
                                                w="100%" px={3} py={1.5} rounded="lg"
                                                bg={isSubActive ? 'rgba(255,107,1,0.08)' : 'transparent'}
                                                _hover={{ bg: isDark ? 'whiteAlpha.50' : 'blackAlpha.50' }}
                                                cursor="pointer" textAlign="left"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Box as={lib.icon} boxSize={3}
                                                    color={isSubActive ? '#FF6B01' : 'gray.500'} flexShrink={0} />
                                                <Text fontSize="xs"
                                                    fontWeight={isSubActive ? '600' : '400'}
                                                    color={isSubActive ? (isDark ? 'white' : 'gray.800') : (isDark ? 'gray.500' : 'gray.600')}>
                                                    {lib.label}
                                                </Text>
                                            </MotionBox>
                                        );
                                    })}
                                </VStack>
                            )}
                        </Box>
                    );
                })}
            </VStack>
        </MotionBox>
    );
}

// ─── Minimal Top Navbar ───
function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDark, toggleColorMode } = useTheme();
    const { brandDNA } = useBrandDNA();

    const brandName = brandDNA.brandName || '';
    const logoUrl = brandDNA.logoDataUrl || '';

    const handleLogout = () => {
        logout();
        showToast.success('Logged out successfully');
    };

    return (
        <Box
            as="nav"
            position="sticky" top={0} zIndex={100}
            bg="app.navBg"
            backdropFilter="blur(20px)"
            borderBottom="1px solid" borderColor="app.border"
        >
            <Flex maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={3}
                justify="space-between" align="center">
                {/* Logo */}
                <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                    <HStack spacing={3}>
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo" maxH="36px" maxW="36px" rounded="lg" />
                        ) : (
                            <Box bg="brand.500" borderRadius="lg" p={2}
                                boxShadow="0 0 20px rgba(255, 107, 1, 0.35)">
                                <FiZap size={20} color="white" />
                            </Box>
                        )}
                        <Text fontSize="xl" fontWeight="700" color="app.text"
                            display={{ base: 'none', sm: 'block' }}>
                            OrchAI
                        </Text>
                    </HStack>
                </Link>

                {/* Greeting + profile */}
                <HStack spacing={3}>
                    {brandName && (
                        <Text fontSize="sm" color="app.textSecondary" display={{ base: 'none', md: 'block' }}>
                            Hey, <Text as="span" color="app.text" fontWeight="600">{brandName}</Text> 👋
                        </Text>
                    )}
                    {/* Theme Toggle */}
                    <Tooltip label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} hasArrow>
                        <IconButton
                            aria-label="Toggle theme"
                            icon={isDark ? <SunIcon /> : <MoonIcon />}
                            onClick={toggleColorMode}
                            variant="ghost"
                            size="sm"
                            color="app.textSecondary"
                            _hover={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.100', color: 'app.text', transform: 'rotate(20deg)' }}
                            transition="all 0.2s"
                        />
                    </Tooltip>
                    <Tooltip label={user ? (user.username || 'Profile') : 'Sign In'} hasArrow>
                        <Avatar
                            size="sm"
                            name={user ? (user.username || user.email) : '?'}
                            bg="brand.500" color="white"
                            cursor="pointer"
                            onClick={() => navigate(user ? '/settings' : '/login')}
                            _hover={{ boxShadow: '0 0 15px rgba(255,107,1,0.35)', transform: 'scale(1.1)' }}
                            transition="all 0.2s"
                        />
                    </Tooltip>
                </HStack>
            </Flex>
        </Box>
    );
}

// ─── Layout ───
function Layout({ children }) {
    const navigate = useNavigate();
    const { isOpen, onClose } = useKeyboardShortcuts(navigate);

    return (
        <Box minH="100vh" bg="app.bg">
            <Navbar />
            <Box as="main" maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
                <PageTransition>{children}</PageTransition>
            </Box>
            <KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />
        </Box>
    );
}

// ─── Animated Routes ───
function AnimatedRoutes() {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <>
            {user && <SideNav />}
            <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes location={location} key={location.pathname}>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout><SacoDashboard /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Layout><Dashboard /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/upload" element={
                            <ProtectedRoute>
                                <Layout><ContentUpload /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/content/:id" element={
                            <ProtectedRoute>
                                <Layout><ContentDetail /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/brand" element={
                            <ProtectedRoute>
                                <Layout><BrandSettings /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <Layout><Settings /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/library/:platform" element={
                            <ProtectedRoute>
                                <Layout><PlatformLibrary /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <Layout><PerformanceAnalytics /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/history" element={
                            <ProtectedRoute>
                                <Layout><History /></Layout>
                            </ProtectedRoute>
                        } />

                        {/* 404 */}
                        <Route path="*" element={
                            <Center h="100vh" bg="surface.bg">
                                <VStack spacing={6}>
                                    <MotionBox
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Text fontSize="8xl">🚀</Text>
                                    </MotionBox>
                                    <VStack spacing={2}>
                                        <Text fontSize="4xl" fontWeight="700" color="white">404</Text>
                                        <Text color="gray.400">Page not found</Text>
                                    </VStack>
                                    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                                        <Button bg="brand.500" color="white" _hover={{ bg: 'brand.600' }}>
                                            Go Home
                                        </Button>
                                    </Link>
                                </VStack>
                            </Center>
                        } />
                    </Routes>
                </Suspense>
            </AnimatePresence>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrandDNAProvider>
                <ThemeProvider>
                    <BrowserRouter>
                        <WelcomeScreen>
                            <AnimatedRoutes />
                        </WelcomeScreen>
                    </BrowserRouter>
                </ThemeProvider>
            </BrandDNAProvider>
        </AuthProvider>
    );
}

export default App;
