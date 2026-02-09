/**
 * SACO Frontend App - Redesigned
 * Main application with routing, auth context, and page transitions
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
    Box,
    Flex,
    HStack,
    VStack,
    Text,
    Button,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Avatar,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Spinner,
    Center,
    Link,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import {
    FiZap,
    FiHome,
    FiUpload,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiUser,
} from 'react-icons/fi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageTransition, showToast, KeyboardShortcutsModal, useKeyboardShortcuts } from './components/common';

// Lazy load pages for code splitting
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ContentUpload = lazy(() => import('./components/Upload/ContentUpload'));
const ContentDetail = lazy(() => import('./components/Content/ContentDetail'));
const BrandSettings = lazy(() => import('./components/Brand/BrandSettings'));
const Settings = lazy(() => import('./components/Settings'));

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

    if (loading) {
        return <LoadingFallback />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Navigation link component
const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            as={RouterLink}
            to={to}
            onClick={onClick}
            _hover={{ textDecoration: 'none' }}
        >
            <Button
                variant="ghost"
                leftIcon={<Icon />}
                color={isActive ? 'brand.400' : 'gray.300'}
                bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                fontWeight={isActive ? '600' : '400'}
            >
                {children}
            </Button>
        </Link>
    );
};

// Modern Navbar
function Navbar() {
    const { user, logout } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleLogout = () => {
        logout();
        showToast.success('Logged out successfully');
    };

    return (
        <Box
            as="nav"
            position="sticky"
            top={0}
            zIndex={100}
            bg="rgba(10, 10, 15, 0.8)"
            backdropFilter="blur(20px)"
            borderBottom="1px solid"
            borderColor="surface.border"
        >
            <Flex
                maxW="1400px"
                mx="auto"
                px={{ base: 4, md: 6 }}
                py={3}
                justify="space-between"
                align="center"
            >
                {/* Logo */}
                <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                    <HStack spacing={3}>
                        <Box
                            bg="brand.500"
                            borderRadius="lg"
                            p={2}
                            boxShadow="0 0 20px rgba(99, 102, 241, 0.3)"
                        >
                            <FiZap size={20} color="white" />
                        </Box>
                        <Text
                            fontSize="xl"
                            fontWeight="700"
                            color="white"
                            display={{ base: 'none', sm: 'block' }}
                        >
                            SACO
                        </Text>
                    </HStack>
                </Link>

                {/* Desktop Navigation */}
                <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                    <NavLink to="/" icon={FiHome}>Dashboard</NavLink>
                    <NavLink to="/upload" icon={FiUpload}>Upload</NavLink>
                    <NavLink to="/brand" icon={FiSettings}>Brand DNA</NavLink>
                </HStack>

                {/* User Menu */}
                <HStack spacing={3}>
                    {/* Mobile Menu Button */}
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        icon={<FiMenu />}
                        variant="ghost"
                        color="gray.300"
                        onClick={onOpen}
                        aria-label="Open menu"
                    />

                    {/* User Dropdown */}
                    <Menu>
                        <MenuButton
                            as={Button}
                            variant="ghost"
                            rightIcon={<ChevronDownIcon />}
                            _hover={{ bg: 'whiteAlpha.100' }}
                            display={{ base: 'none', md: 'flex' }}
                        >
                            <HStack spacing={2}>
                                <Avatar size="sm" name={user?.username} bg="brand.500" />
                                <Text color="white" fontWeight="500">
                                    {user?.username || 'User'}
                                </Text>
                            </HStack>
                        </MenuButton>
                        <MenuList bg="surface.card" borderColor="surface.border">
                            <MenuItem
                                icon={<FiUser />}
                                bg="transparent"
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem
                                icon={<FiSettings />}
                                bg="transparent"
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                Settings
                            </MenuItem>
                            <MenuDivider borderColor="surface.border" />
                            <MenuItem
                                icon={<FiLogOut />}
                                onClick={handleLogout}
                                bg="transparent"
                                _hover={{ bg: 'whiteAlpha.100' }}
                                color="error.400"
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent bg="surface.card">
                    <DrawerCloseButton color="gray.400" />
                    <DrawerHeader borderBottomWidth="1px" borderColor="surface.border">
                        <HStack spacing={3}>
                            <Avatar size="sm" name={user?.username} bg="brand.500" />
                            <Text color="white">{user?.username || 'User'}</Text>
                        </HStack>
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={2} align="stretch" py={4}>
                            <NavLink to="/" icon={FiHome} onClick={onClose}>Dashboard</NavLink>
                            <NavLink to="/upload" icon={FiUpload} onClick={onClose}>Upload</NavLink>
                            <NavLink to="/brand" icon={FiSettings} onClick={onClose}>Brand DNA</NavLink>
                            <Box pt={4} borderTop="1px solid" borderColor="surface.border" mt={4}>
                                <Button
                                    w="full"
                                    variant="ghost"
                                    leftIcon={<FiLogOut />}
                                    color="error.400"
                                    justifyContent="flex-start"
                                    onClick={() => { onClose(); handleLogout(); }}
                                >
                                    Logout
                                </Button>
                            </Box>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}

// Layout with navbar for authenticated pages
function Layout({ children }) {
    const navigate = useNavigate();
    const { isOpen, onClose } = useKeyboardShortcuts(navigate);

    return (
        <Box minH="100vh" bg="surface.bg">
            <Navbar />
            <Box
                as="main"
                maxW="1400px"
                mx="auto"
                px={{ base: 4, md: 6 }}
                py={6}
            >
                <PageTransition>
                    {children}
                </PageTransition>
            </Box>

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />
        </Box>
    );
}

// Animated Routes wrapper
function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
                <Routes location={location} key={location.pathname}>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/upload" element={
                        <ProtectedRoute>
                            <Layout>
                                <ContentUpload />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/content/:id" element={
                        <ProtectedRoute>
                            <Layout>
                                <ContentDetail />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/brand" element={
                        <ProtectedRoute>
                            <Layout>
                                <BrandSettings />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Layout>
                                <Settings />
                            </Layout>
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
                                    <Button
                                        bg="brand.500"
                                        color="white"
                                        _hover={{ bg: 'brand.600' }}
                                    >
                                        Go Home
                                    </Button>
                                </Link>
                            </VStack>
                        </Center>
                    } />
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
