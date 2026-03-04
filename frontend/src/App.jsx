/**
 * CreateX Frontend App — Platform-Centric Dashboard
 * Routing, auth context, Brand DNA provider, and page transitions
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
    Box, Flex, HStack, VStack, Text, Button, IconButton,
    Avatar, Spinner, Center, Link, Menu, MenuButton, MenuList, MenuItem,
    Tooltip, Image,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import {
    FiZap, FiHome, FiSettings, FiLogOut, FiBarChart2, FiGrid, FiUploadCloud,
} from 'react-icons/fi';
import { SiInstagram, SiLinkedin } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { FiMail, FiBookOpen } from 'react-icons/fi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandDNAProvider, useBrandDNA } from './context/BrandDNAContext';
import { PageTransition, showToast, KeyboardShortcutsModal, useKeyboardShortcuts } from './components/common';
import WelcomeScreen from './components/Welcome/WelcomeScreen';

// Lazy load pages
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const SacoDashboard = lazy(() => import('./components/Dashboard/SacoDashboard'));
const ContentUpload = lazy(() => import('./components/Upload/ContentUpload'));
const PlatformLibrary = lazy(() => import('./components/Libraries/PlatformLibrary'));
const PerformanceAnalytics = lazy(() => import('./components/Analytics/PerformanceAnalytics'));
const Settings = lazy(() => import('./components/Settings'));
const AgentWorkflowPage = lazy(() => import('./components/AgentWorkflow/AgentWorkflowPage'));
const LiveAgentWorkspace = lazy(() => import('./components/AgentWorkspace/LiveAgentWorkspace'));

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

// ─── Modern Side Navigation ───
function SideNav() {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: FiHome, label: 'Dashboard', path: '/' },
        { icon: FiUploadCloud, label: 'Upload', path: '/upload' },
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
            bg="rgba(53, 53, 53, 0.85)"
            backdropFilter="blur(20px)"
            border="1px solid" borderColor="rgba(255, 255, 255, 0.08)"
            borderRight="none" roundedLeft="2xl"
            py={4} px={2} overflow="hidden"
            boxShadow="-4px 0 30px rgba(0, 0, 0, 0.3)"
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
                                        // Navigate to first library when clicking the group icon
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
                                _hover={{ bg: isActive ? 'rgba(255, 107, 1, 0.1)' : 'whiteAlpha.50' }}
                                whileHover={{ x: -2, transition: { duration: 0.15 } }}
                                position="relative" overflow="hidden" textAlign="left" minH="40px"
                            >
                                {isActive && (
                                    <Box position="absolute" left={0} top="50%" transform="translateY(-50%)"
                                        w="3px" h="60%" bg="#FF6B01" rounded="full"
                                        boxShadow="0 0 10px rgba(255,107,1,0.35)" />
                                )}
                                <Box as={item.icon} boxSize={4}
                                    color={isActive ? '#FF6B01' : 'gray.400'} flexShrink={0} />
                                <MotionBox
                                    animate={{ opacity: isExpanded ? 1 : 0 }}
                                    transition={{ duration: isExpanded ? 0.3 : 0.1, delay: isExpanded ? 0.1 : 0 }}
                                    overflow="hidden" whiteSpace="nowrap"
                                >
                                    <Text fontSize="sm" fontWeight={isActive ? '700' : '500'}
                                        color={isActive ? 'white' : 'gray.400'}>
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
                                                _hover={{ bg: 'whiteAlpha.50' }}
                                                cursor="pointer" textAlign="left"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Box as={lib.icon} boxSize={3}
                                                    color={isSubActive ? '#FF6B01' : 'gray.500'} flexShrink={0} />
                                                <Text fontSize="xs"
                                                    fontWeight={isSubActive ? '600' : '400'}
                                                    color={isSubActive ? 'white' : 'gray.500'}>
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

// ─── Navbar ───
function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    let brandName = '';
    try {
        const raw = localStorage.getItem('saco_brand_dna');
        if (raw) { brandName = JSON.parse(raw).brandName || ''; }
    } catch { /* noop */ }

    const handleLogout = () => {
        logout();
        showToast.success('Logged out successfully');
    };

    let logoUrl = '';
    try {
        const raw = localStorage.getItem('saco_brand_dna');
        if (raw) { logoUrl = JSON.parse(raw).logoDataUrl || ''; }
    } catch { /* noop */ }

    return (
        <Box
            as="nav"
            position="sticky" top={0} zIndex={100}
            bg="rgba(26, 26, 26, 0.85)"
            backdropFilter="blur(20px)"
            borderBottom="1px solid" borderColor="surface.border"
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
                        <Text fontSize="xl" fontWeight="700" color="white"
                            display={{ base: 'none', sm: 'block' }}>
                            {brandName || 'CreateX'}
                        </Text>
                    </HStack>
                </Link>

                {/* Greeting + profile */}
                <HStack spacing={3}>
                    {brandName && (
                        <Text fontSize="sm" color="gray.400" display={{ base: 'none', md: 'block' }}>
                            Hey, <Text as="span" color="white" fontWeight="600">{brandName}</Text> 👋
                        </Text>
                    )}
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
        <Box minH="100vh" bg="surface.bg">
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
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return;
            const modal = document.querySelector('.chakra-modal__overlay');
            if (modal) return;
            if (e.key === 'Escape') navigate(-1);
            else if (e.key === 'Enter') navigate(1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

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
                            <ProtectedRoute><SacoDashboard /></ProtectedRoute>
                        } />

                        <Route path="/upload" element={
                            <ProtectedRoute><ContentUpload /></ProtectedRoute>
                        } />

                        <Route path="/library/:platform" element={
                            <ProtectedRoute><PlatformLibrary /></ProtectedRoute>
                        } />

                        <Route path="/analytics" element={
                            <ProtectedRoute><PerformanceAnalytics /></ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <Layout><Settings /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/workflow/:contentId" element={
                            <ProtectedRoute><AgentWorkflowPage /></ProtectedRoute>
                        } />

                        <Route path="/agents/:contentId" element={
                            <ProtectedRoute><LiveAgentWorkspace /></ProtectedRoute>
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
                <BrowserRouter>
                    <WelcomeScreen>
                        <AnimatedRoutes />
                    </WelcomeScreen>
                </BrowserRouter>
            </BrandDNAProvider>
        </AuthProvider>
    );
}

export default App;
