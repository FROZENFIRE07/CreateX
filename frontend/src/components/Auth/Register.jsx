/**
 * Register Component - Redesigned
 * Split-screen layout with animated showcase and modern registration form
 */

import React, { useState, useMemo } from 'react';
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
    IconButton,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Divider,
    Progress,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiMail,
    FiLock,
    FiUser,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiZap,
    FiCheck,
    FiX
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { showToast } from '../common';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Password strength indicator
const PasswordStrength = ({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const getColor = () => {
        if (strength <= 1) return 'error.500';
        if (strength <= 2) return 'warning.500';
        if (strength <= 3) return 'yellow.500';
        return 'success.500';
    };

    const getLabel = () => {
        if (strength <= 1) return 'Weak';
        if (strength <= 2) return 'Fair';
        if (strength <= 3) return 'Good';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <VStack align="stretch" spacing={1} mt={2}>
            <Progress
                value={(strength / 5) * 100}
                size="xs"
                colorScheme={strength <= 1 ? 'red' : strength <= 2 ? 'orange' : strength <= 3 ? 'yellow' : 'green'}
                borderRadius="full"
                bg="surface.border"
            />
            <Text fontSize="xs" color={getColor()}>{getLabel()}</Text>
        </VStack>
    );
};

// Animated background gradient (same as login)
const AnimatedBackground = () => (
    <Box position="absolute" inset={0} overflow="hidden" zIndex={0}>
        <MotionBox
            position="absolute"
            width="600px"
            height="600px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
            top="-200px"
            left="-100px"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <MotionBox
            position="absolute"
            width="500px"
            height="500px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)"
            bottom="-150px"
            right="-100px"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Box
            position="absolute"
            inset={0}
            opacity={0.03}
            backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
            backgroundSize="50px 50px"
        />
    </Box>
);

// Feature list for showcase
const features = [
    { icon: '🎯', title: '85% Hit Rate', desc: 'Quality-first content generation' },
    { icon: '⚡', title: 'Real-time Streaming', desc: 'Watch AI work in real-time' },
    { icon: '🎨', title: 'Brand Consistency', desc: 'Your voice, everywhere' },
    { icon: '📊', title: 'Analytics', desc: 'Track content performance' },
];

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();
    const isMobile = useBreakpointValue({ base: true, lg: false });

    const passwordMatch = password && confirmPassword && password === confirmPassword;
    const passwordMismatch = password && confirmPassword && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(username, email, password);

        if (result.success) {
            showToast.celebrate('Account created! Welcome to SACO 🚀');
            navigate('/');
        } else {
            setError(result.error);
            showToast.error(result.error);
        }

        setLoading(false);
    };

    const handleGoogleSignup = () => {
        showToast.info('Google signup coming soon!');
    };

    return (
        <Flex minH="100vh" bg="surface.bg">
            {/* Left Side - Showcase */}
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

                    <VStack spacing={8} zIndex={1} textAlign="center" maxW="500px">
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <HStack spacing={3} mb={4}>
                                <Box bg="brand.500" borderRadius="xl" p={3} boxShadow="glow">
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
                            <Heading size="xl" color="white" lineHeight="1.3">
                                Start Creating
                                <Text as="span" color="brand.400"> Amazing Content</Text>
                            </Heading>
                            <Text color="gray.400" mt={4} fontSize="lg">
                                Join thousands using AI to transform their content workflow
                            </Text>
                        </MotionBox>

                        {/* Features grid */}
                        <VStack spacing={4} w="full" mt={6}>
                            {features.map((feature, i) => (
                                <MotionBox
                                    key={feature.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    w="full"
                                >
                                    <HStack
                                        bg="rgba(255,255,255,0.05)"
                                        borderRadius="lg"
                                        p={4}
                                        spacing={4}
                                        border="1px solid"
                                        borderColor="surface.border"
                                    >
                                        <Text fontSize="2xl">{feature.icon}</Text>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="600" color="white">{feature.title}</Text>
                                            <Text fontSize="sm" color="gray.400">{feature.desc}</Text>
                                        </VStack>
                                    </HStack>
                                </MotionBox>
                            ))}
                        </VStack>
                    </VStack>
                </MotionFlex>
            )}

            {/* Right Side - Register Form */}
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
                <VStack spacing={6} w="full" maxW="400px">
                    {/* Mobile logo */}
                    {isMobile && (
                        <HStack spacing={3} mb={2}>
                            <Box bg="brand.500" borderRadius="xl" p={3} boxShadow="glow">
                                <FiZap size={24} color="white" />
                            </Box>
                            <Heading size="lg" color="white">SACO</Heading>
                        </HStack>
                    )}

                    <VStack spacing={2} textAlign="center">
                        <Heading size="xl" color="white">Create Account</Heading>
                        <Text color="gray.400">Start your AI content journey</Text>
                    </VStack>

                    <Button
                        w="full"
                        variant="outline"
                        borderColor="surface.border"
                        color="white"
                        leftIcon={<FcGoogle size={20} />}
                        onClick={handleGoogleSignup}
                        _hover={{ bg: 'whiteAlpha.100' }}
                        size="lg"
                    >
                        Continue with Google
                    </Button>

                    <HStack w="full">
                        <Divider borderColor="surface.border" />
                        <Text color="gray.500" fontSize="sm" px={4} whiteSpace="nowrap">or</Text>
                        <Divider borderColor="surface.border" />
                    </HStack>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel color="gray.300" fontSize="sm">Username</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement><FiUser color="gray" /></InputLeftElement>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        required
                                        minLength={3}
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.300" fontSize="sm">Email</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement><FiMail color="gray" /></InputLeftElement>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.300" fontSize="sm">Password</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement><FiLock color="gray" /></InputLeftElement>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label="Toggle password"
                                            color="gray.400"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                <PasswordStrength password={password} />
                            </FormControl>

                            <FormControl isInvalid={passwordMismatch}>
                                <FormLabel color="gray.300" fontSize="sm">Confirm Password</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement><FiLock color="gray" /></InputLeftElement>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    {confirmPassword && (
                                        <InputRightElement>
                                            {passwordMatch ? (
                                                <FiCheck color="#10b981" />
                                            ) : (
                                                <FiX color="#ef4444" />
                                            )}
                                        </InputRightElement>
                                    )}
                                </InputGroup>
                                {passwordMismatch && (
                                    <FormErrorMessage>Passwords don't match</FormErrorMessage>
                                )}
                            </FormControl>

                            {error && (
                                <Text color="error.400" fontSize="sm" textAlign="center">{error}</Text>
                            )}

                            <Button
                                type="submit"
                                w="full"
                                size="lg"
                                bg="brand.500"
                                color="white"
                                rightIcon={<FiArrowRight />}
                                isLoading={loading}
                                loadingText="Creating account..."
                                _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'glow' }}
                                _active={{ transform: 'translateY(0)' }}
                                mt={2}
                            >
                                Create Account
                            </Button>
                        </VStack>
                    </form>

                    <Text color="gray.500" fontSize="sm">
                        Already have an account?{' '}
                        <Link to="/login">
                            <Text as="span" color="brand.400" fontWeight="500">Sign in</Text>
                        </Link>
                    </Text>
                </VStack>
            </MotionFlex>
        </Flex>
    );
}

export default Register;
