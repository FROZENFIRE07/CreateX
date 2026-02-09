/**
 * Login Component - Redesigned
 * Split-screen layout with animated showcase and modern login form
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Button,
    Checkbox,
    IconButton,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Divider,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiZap,
    FiLayers,
    FiTarget,
    FiTrendingUp
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { showToast } from '../common';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Animated floating cards for the showcase
const FloatingCard = ({ icon, title, subtitle, delay, x, y }) => (
    <MotionBox
        position="absolute"
        left={x}
        top={y}
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(20px)"
        borderRadius="xl"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        p={4}
        minW="180px"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{
            opacity: 1,
            y: [0, -10, 0],
            scale: 1,
        }}
        transition={{
            opacity: { delay, duration: 0.5 },
            y: { delay, duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
            scale: { delay, duration: 0.5 },
        }}
    >
        <HStack spacing={3}>
            <Box color="brand.400" fontSize="xl">{icon}</Box>
            <VStack align="start" spacing={0}>
                <Text fontWeight="600" fontSize="sm" color="white">{title}</Text>
                <Text fontSize="xs" color="gray.400">{subtitle}</Text>
            </VStack>
        </HStack>
    </MotionBox>
);

// Animated background gradient
const AnimatedBackground = () => (
    <Box
        position="absolute"
        inset={0}
        overflow="hidden"
        zIndex={0}
    >
        {/* Gradient orbs */}
        <MotionBox
            position="absolute"
            width="600px"
            height="600px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
            top="-200px"
            left="-100px"
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
        <MotionBox
            position="absolute"
            width="500px"
            height="500px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)"
            bottom="-150px"
            right="-100px"
            animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />

        {/* Grid pattern overlay */}
        <Box
            position="absolute"
            inset={0}
            opacity={0.03}
            backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
            backgroundSize="50px 50px"
        />
    </Box>
);

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const isMobile = useBreakpointValue({ base: true, lg: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            showToast.celebrate('Welcome back! 🎉');
            navigate('/');
        } else {
            setError(result.error);
            showToast.error(result.error);
        }

        setLoading(false);
    };

    const handleGoogleLogin = () => {
        showToast.info('Google login coming soon!');
    };

    return (
        <Flex minH="100vh" bg="surface.bg">
            {/* Left Side - Showcase (Hidden on mobile) */}
            {!isMobile && (
                <MotionFlex
                    flex={1.2}
                    position="relative"
                    direction="column"
                    justify="center"
                    align="center"
                    px={12}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <AnimatedBackground />

                    {/* Main headline */}
                    <VStack spacing={6} zIndex={1} textAlign="center" maxW="500px">
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <HStack spacing={3} mb={4}>
                                <Box
                                    bg="brand.500"
                                    borderRadius="xl"
                                    p={3}
                                    boxShadow="glow"
                                >
                                    <FiZap size={24} color="white" />
                                </Box>
                                <Heading size="lg" color="white">SACO</Heading>
                            </HStack>
                        </MotionBox>

                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Heading
                                size="2xl"
                                color="white"
                                lineHeight="1.2"
                                fontWeight="700"
                            >
                                AI-Powered Content
                                <Text as="span" color="brand.400"> Orchestration</Text>
                            </Heading>
                        </MotionBox>

                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Text color="gray.400" fontSize="lg" maxW="400px">
                                Transform your content into platform-optimized variants with systemic AI intelligence
                            </Text>
                        </MotionBox>
                    </VStack>

                    {/* Floating showcase cards */}
                    <FloatingCard
                        icon={<FiTarget />}
                        title="85% Hit Rate"
                        subtitle="Quality-first generation"
                        delay={0.6}
                        x="10%"
                        y="20%"
                    />
                    <FloatingCard
                        icon={<FiLayers />}
                        title="Multi-Platform"
                        subtitle="Twitter, LinkedIn, Email..."
                        delay={0.8}
                        x="65%"
                        y="25%"
                    />
                    <FloatingCard
                        icon={<FiTrendingUp />}
                        title="Real-time Analytics"
                        subtitle="Track performance"
                        delay={1.0}
                        x="15%"
                        y="70%"
                    />
                </MotionFlex>
            )}

            {/* Right Side - Login Form */}
            <MotionFlex
                flex={1}
                direction="column"
                justify="center"
                align="center"
                p={{ base: 6, md: 12 }}
                bg="surface.bg"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <VStack spacing={8} w="full" maxW="400px">
                    {/* Mobile logo */}
                    {isMobile && (
                        <HStack spacing={3} mb={4}>
                            <Box
                                bg="brand.500"
                                borderRadius="xl"
                                p={3}
                                boxShadow="glow"
                            >
                                <FiZap size={24} color="white" />
                            </Box>
                            <Heading size="lg" color="white">SACO</Heading>
                        </HStack>
                    )}

                    {/* Header */}
                    <VStack spacing={2} textAlign="center">
                        <Heading size="xl" color="white">Welcome back</Heading>
                        <Text color="gray.400">Sign in to continue to your dashboard</Text>
                    </VStack>

                    {/* Google Login */}
                    <Button
                        w="full"
                        variant="outline"
                        borderColor="surface.border"
                        color="white"
                        leftIcon={<FcGoogle size={20} />}
                        onClick={handleGoogleLogin}
                        _hover={{ bg: 'whiteAlpha.100', borderColor: 'surface.borderHover' }}
                        size="lg"
                    >
                        Continue with Google
                    </Button>

                    <HStack w="full">
                        <Divider borderColor="surface.border" />
                        <Text color="gray.500" fontSize="sm" px={4} whiteSpace="nowrap">
                            or sign in with email
                        </Text>
                        <Divider borderColor="surface.border" />
                    </HStack>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={5}>
                            <FormControl isInvalid={!!error}>
                                <FormLabel color="gray.300" fontSize="sm">Email</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                        <FiMail color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl isInvalid={!!error}>
                                <FormLabel color="gray.300" fontSize="sm">Password</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                        <FiLock color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            color="gray.400"
                                            _hover={{ color: 'white' }}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                {error && <FormErrorMessage>{error}</FormErrorMessage>}
                            </FormControl>

                            <HStack w="full" justify="space-between">
                                <Checkbox
                                    isChecked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    colorScheme="brand"
                                    size="sm"
                                >
                                    <Text color="gray.400" fontSize="sm">Remember me</Text>
                                </Checkbox>
                                <Link to="/forgot-password">
                                    <Text color="brand.400" fontSize="sm" _hover={{ color: 'brand.300' }}>
                                        Forgot password?
                                    </Text>
                                </Link>
                            </HStack>

                            <Button
                                type="submit"
                                w="full"
                                size="lg"
                                bg="brand.500"
                                color="white"
                                rightIcon={<FiArrowRight />}
                                isLoading={loading}
                                loadingText="Signing in..."
                                _hover={{
                                    bg: 'brand.600',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'glow'
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s"
                            >
                                Sign In
                            </Button>
                        </VStack>
                    </form>

                    {/* Footer */}
                    <Text color="gray.500" fontSize="sm">
                        Don't have an account?{' '}
                        <Link to="/register">
                            <Text as="span" color="brand.400" fontWeight="500" _hover={{ color: 'brand.300' }}>
                                Create one
                            </Text>
                        </Link>
                    </Text>
                </VStack>
            </MotionFlex>
        </Flex>
    );
}

export default Login;
