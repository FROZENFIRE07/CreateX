/**
 * Live Agent Workspace - Mission Control Style
 * Full-screen animated agent monitoring with real-time updates
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Badge,
    Progress,
    Icon,
    IconButton,
    Tooltip,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
    FiArrowLeft,
    FiZap,
    FiCpu,
    FiLayers,
    FiEye,
    FiSend,
    FiRefreshCw,
    FiCheckCircle,
    FiActivity,
    FiClock,
} from 'react-icons/fi';
import api from '../../services/api';
import { showToast } from '../common';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Agent configuration
const AGENTS = [
    {
        id: 'manager',
        name: 'Manager',
        fullName: 'Manager Agent',
        icon: FiZap,
        color: '#8b5cf6',
        gradient: 'linear(to-r, purple.500, purple.600)',
        avatar: '🎯',
        description: 'Orchestrating workflow',
    },
    {
        id: 'ingest',
        name: 'Ingest',
        fullName: 'Ingest Agent',
        icon: FiCpu,
        color: '#3b82f6',
        gradient: 'linear(to-r, blue.500, blue.600)',
        avatar: '🧠',
        description: 'Analyzing content',
    },
    {
        id: 'generator',
        name: 'Generator',
        fullName: 'Generator Agent',
        icon: FiLayers,
        color: '#10b981',
        gradient: 'linear(to-r, green.500, green.600)',
        avatar: '✨',
        description: 'Creating variants',
    },
    {
        id: 'reviewer',
        name: 'Reviewer',
        fullName: 'Reviewer Agent',
        icon: FiEye,
        color: '#f59e0b',
        gradient: 'linear(to-r, orange.500, orange.600)',
        avatar: '🔍',
        description: 'Scoring consistency',
    },
    {
        id: 'publisher',
        name: 'Publisher',
        fullName: 'Publisher Agent',
        icon: FiSend,
        color: '#ec4899',
        gradient: 'linear(to-r, pink.500, pink.600)',
        avatar: '🚀',
        description: 'Formatting output',
    },
];

// Typing animation component
const TypingIndicator = () => (
    <HStack spacing={1}>
        {[0, 1, 2].map((i) => (
            <MotionBox
                key={i}
                w="6px"
                h="6px"
                bg="gray.400"
                borderRadius="full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                }}
            />
        ))}
    </HStack>
);

// Terminal log component with character-by-character animation
const TerminalLog = ({ logs, agentColor }) => {
    const logsEndRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <Box
            bg="rgba(0, 0, 0, 0.4)"
            borderRadius="md"
            p={3}
            maxH="120px"
            overflowY="auto"
            fontFamily="mono"
            fontSize="xs"
            border="1px solid"
            borderColor="whiteAlpha.200"
            css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: agentColor, borderRadius: '2px' },
            }}
        >
            {logs.length === 0 ? (
                <Text color="gray.600" fontSize="xs">Waiting for activity...</Text>
            ) : (
                <VStack align="stretch" spacing={1}>
                    {logs.map((log, idx) => (
                        <MotionBox
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Text color="gray.400">
                                <Text as="span" color={agentColor}>▸</Text> {log}
                            </Text>
                        </MotionBox>
                    ))}
                    <div ref={logsEndRef} />
                </VStack>
            )}
        </Box>
    );
};

// Agent Card Component
const AgentCard = ({ agent, progress, status, logs, onRestart, elapsedTime, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = () => {
        if (status === 'completed') return 'green.400';
        if (status === 'active') return agent.color;
        if (status === 'error') return 'red.400';
        return 'gray.600';
    };

    const getStatusBadge = () => {
        if (status === 'completed') return { label: 'Complete', scheme: 'green' };
        if (status === 'active') return { label: 'Working', scheme: 'purple' };
        if (status === 'error') return { label: 'Error', scheme: 'red' };
        return { label: 'Idle', scheme: 'gray' };
    };

    const badge = getStatusBadge();

    return (
        <MotionBox
            onClick={onClick}
            bg="rgba(255, 255, 255, 0.03)"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor={status === 'active' ? agent.color : 'whiteAlpha.100'}
            p={5}
            position="relative"
            overflow="hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
                scale: 1.02,
                rotateY: isHovered ? 2 : 0,
                rotateX: isHovered ? -2 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{ transformStyle: 'preserve-3d' }}
            boxShadow={status === 'active' ? `0 0 40px ${agent.color}40` : 'none'}
            cursor="pointer"
        >
            {/* Animated background gradient */}
            {status === 'active' && (
                <MotionBox
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient={agent.gradient}
                    opacity={0.1}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Pulsing border for active state */}
            {status === 'active' && (
                <MotionBox
                    position="absolute"
                    top={-1}
                    left={-1}
                    right={-1}
                    bottom={-1}
                    border="2px solid"
                    borderColor={agent.color}
                    borderRadius="2xl"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}

            <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
                {/* Header */}
                <Flex justify="space-between" align="start">
                    <HStack spacing={3}>
                        {/* Animated Avatar */}
                        <MotionBox
                            bg={getStatusColor()}
                            borderRadius="xl"
                            p={3}
                            boxShadow={status === 'active' ? `0 0 20px ${agent.color}` : 'none'}
                            animate={
                                status === 'active'
                                    ? {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }
                                    : status === 'completed'
                                        ? { scale: 1 }
                                        : {}
                            }
                            transition={{ duration: 2, repeat: status === 'active' ? Infinity : 0 }}
                        >
                            <Text fontSize="2xl">{agent.avatar}</Text>
                        </MotionBox>

                        <VStack align="start" spacing={0}>
                            <Text fontWeight="700" color="white" fontSize="md">
                                {agent.fullName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {agent.description}
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={2}>
                        <Badge colorScheme={badge.scheme} variant="subtle" fontSize="xs">
                            {badge.label}
                        </Badge>
                        {status === 'error' && (
                            <Tooltip label="Restart Agent">
                                <IconButton
                                    size="xs"
                                    icon={<FiRefreshCw />}
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={onRestart}
                                />
                            </Tooltip>
                        )}
                    </HStack>
                </Flex>

                {/* Status Indicator */}
                <HStack spacing={2}>
                    {status === 'active' && <TypingIndicator />}
                    {status === 'completed' && (
                        <MotionBox
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <Icon as={FiCheckCircle} color="green.400" boxSize={5} />
                        </MotionBox>
                    )}
                    <Text fontSize="xs" color="gray.400">
                        {status === 'active' && 'Processing...'}
                        {status === 'completed' && 'Task completed'}
                        {status === 'idle' && 'Waiting...'}
                        {status === 'error' && 'Failed - click restart'}
                    </Text>
                </HStack>

                {/* Progress Bar with Shimmer */}
                {(status === 'active' || status === 'completed') && (
                    <Box>
                        <Flex justify="space-between" mb={2}>
                            <Text fontSize="xs" color="gray.500" fontWeight="600">
                                Progress
                            </Text>
                            <Text fontSize="xs" color={getStatusColor()} fontWeight="700">
                                {progress}%
                            </Text>
                        </Flex>
                        <Box position="relative">
                            <Progress
                                value={progress}
                                size="sm"
                                borderRadius="full"
                                bg="whiteAlpha.100"
                                sx={{
                                    '& > div': {
                                        background: agent.color,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    },
                                }}
                            />
                            {/* Shimmer effect */}
                            {status === 'active' && progress < 100 && (
                                <MotionBox
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    bgGradient="linear(to-r, transparent, whiteAlpha.400, transparent)"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </Box>
                    </Box>
                )}

                {/* Terminal Logs */}
                <TerminalLog logs={logs} agentColor={agent.color} />

                {/* Elapsed Time */}
                {elapsedTime > 0 && (
                    <HStack spacing={2} fontSize="xs" color="gray.500">
                        <Icon as={FiClock} />
                        <Text>Started {elapsedTime}s ago</Text>
                    </HStack>
                )}
            </VStack>
        </MotionBox>
    );
};

// Connection Lines Component
const ConnectionLines = ({ activeAgentIndex }) => {
    return (
        <Box position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none" zIndex={0}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connection lines between agents */}
                {[0, 1, 2, 3].map((idx) => {
                    const isActive = activeAgentIndex >= idx;
                    return (
                        <motion.line
                            key={idx}
                            x1="25%"
                            y1={`${15 + idx * 20}%`}
                            x2="75%"
                            y2={`${15 + (idx + 1) * 20}%`}
                            stroke={isActive ? 'url(#lineGradient)' : '#374151'}
                            strokeWidth="2"
                            strokeDasharray="8,4"
                            filter={isActive ? 'url(#glow)' : 'none'}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: isActive ? 1 : 0.3,
                                opacity: isActive ? 1 : 0.3,
                            }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                    );
                })}

                {/* Animated particles flowing through connections */}
                {activeAgentIndex >= 0 && (
                    <motion.circle
                        r="4"
                        fill="#8b5cf6"
                        filter="url(#glow)"
                        animate={{
                            cx: ['25%', '75%'],
                            cy: [`${15 + activeAgentIndex * 20}%`, `${15 + (activeAgentIndex + 1) * 20}%`],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                )}
            </svg>
        </Box>
    );
};

// Main Component
function LiveAgentWorkspace() {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [agentStates, setAgentStates] = useState({});
    const [agentLogs, setAgentLogs] = useState({});
    const [agentProgress, setAgentProgress] = useState({});
    const [agentStartTimes, setAgentStartTimes] = useState({});
    const [masterProgress, setMasterProgress] = useState(0);
    const [status, setStatus] = useState('processing');
    const [showConfetti, setShowConfetti] = useState(false);
    const [elapsedTimes, setElapsedTimes] = useState({});
    const startTimeRef = useRef(Date.now());

    // Update elapsed times every second
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newElapsed = {};
            Object.keys(agentStartTimes).forEach((agentId) => {
                newElapsed[agentId] = Math.floor((now - agentStartTimes[agentId]) / 1000);
            });
            setElapsedTimes(newElapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [agentStartTimes]);

    // Polling for status updates
    useEffect(() => {
        if (!contentId) return;

        const pollStatus = async () => {
            try {
                const res = await api.get(`/content/${contentId}/status`);
                const data = res.data;

                if (data.log && data.log.length > 0) {
                    const newStates = {};
                    const newLogs = {};
                    const newProgress = {};
                    const newStartTimes = { ...agentStartTimes };

                    // Initialize logs for all agents
                    AGENTS.forEach((agent) => {
                        if (!newLogs[agent.id]) newLogs[agent.id] = [];
                    });

                    // Process logs
                    data.log.forEach((logEntry) => {
                        const agentId = logEntry.agent?.toLowerCase();
                        const action = logEntry.action;
                        const message = logEntry.details?.message || action;

                        if (agentId && AGENTS.find((a) => a.id === agentId)) {
                            // Track start time
                            if (!newStartTimes[agentId]) {
                                newStartTimes[agentId] = Date.now();
                            }

                            // Update state
                            if (action === 'completed') {
                                newStates[agentId] = 'completed';
                                newProgress[agentId] = 100;
                            } else if (action === 'error') {
                                newStates[agentId] = 'error';
                            } else {
                                newStates[agentId] = 'active';
                                // Simulate progress
                                newProgress[agentId] = Math.min(
                                    95,
                                    (newLogs[agentId]?.length || 0) * 20
                                );
                            }

                            // Add to logs
                            if (!newLogs[agentId]) newLogs[agentId] = [];
                            if (!newLogs[agentId].includes(message)) {
                                newLogs[agentId].push(message);
                            }
                        }
                    });

                    setAgentStates(newStates);
                    setAgentLogs(newLogs);
                    setAgentProgress(newProgress);
                    setAgentStartTimes(newStartTimes);

                    // Calculate master progress
                    const completedCount = Object.values(newStates).filter(
                        (s) => s === 'completed'
                    ).length;
                    const newMasterProgress = Math.round((completedCount / AGENTS.length) * 100);
                    setMasterProgress(newMasterProgress);
                }

                // Check completion
                if (data.status === 'completed') {
                    setStatus('completed');
                    setMasterProgress(100);
                    setShowConfetti(true);
                    showToast.celebrate('All agents completed! 🎉');

                    // Auto-redirect after 3 seconds
                    setTimeout(() => {
                        navigate(`/content/${contentId}`);
                    }, 3000);

                    return true;
                } else if (data.status === 'failed') {
                    setStatus('failed');
                    showToast.error('Orchestration failed');
                    return true;
                }

                return false;
            } catch (err) {
                console.error('Polling error:', err);
                return false;
            }
        };

        const interval = setInterval(async () => {
            const done = await pollStatus();
            if (done) clearInterval(interval);
        }, 1000);

        pollStatus();

        return () => clearInterval(interval);
    }, [contentId, navigate, agentStartTimes]);

    const handleRestart = (agentId) => {
        showToast.info(`Restarting ${agentId} agent...`);
        // Implement restart logic here
    };

    const handleBackToDashboard = () => {
        navigate('/');
    };

    const getMasterProgressLabel = () => {
        if (masterProgress === 0) return 'Initializing...';
        if (masterProgress === 25) return 'Planning Complete';
        if (masterProgress === 50) return 'Content Analyzed';
        if (masterProgress === 75) return 'Variants Generated';
        if (masterProgress === 100) return 'All Systems Complete';
        return `${masterProgress}% Complete`;
    };

    return (
        <Box
            minH="100vh"
            bg="linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)"
            position="relative"
            overflow="hidden"
        >
            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.3}
                />
            )}

            {/* Animated background grid */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={0.1}
                backgroundImage="radial-gradient(circle, #8b5cf6 1px, transparent 1px)"
                backgroundSize="50px 50px"
            />

            {/* Connection Lines */}
            <ConnectionLines activeAgentIndex={Object.keys(agentStates).length - 1} />

            {/* Main Content */}
            <Box position="relative" zIndex={1} py={6} px={{ base: 4, md: 8 }}>
                <VStack spacing={6} maxW="1600px" mx="auto">
                    {/* Header */}
                    <MotionFlex
                        w="full"
                        justify="space-between"
                        align="center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        flexWrap="wrap"
                        gap={4}
                    >
                        <HStack spacing={4}>
                            <Button
                                leftIcon={<FiArrowLeft />}
                                variant="ghost"
                                color="white"
                                onClick={handleBackToDashboard}
                                _hover={{ bg: 'whiteAlpha.200' }}
                            >
                                Back to Dashboard
                            </Button>
                            <VStack align="start" spacing={0}>
                                <Heading size="xl" color="white" fontWeight="800">
                                    🚀 Live Agent Workspace
                                </Heading>
                                <Text color="gray.400" fontSize="sm">
                                    Mission Control - Watch AI Agents Collaborate
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack spacing={3}>
                            <Icon as={FiActivity} color="brand.400" boxSize={5} />
                            <Text color="white" fontWeight="600">
                                {Object.keys(agentStates).length} / {AGENTS.length} Active
                            </Text>
                        </HStack>
                    </MotionFlex>

                    {/* Master Progress Bar */}
                    <MotionBox
                        w="full"
                        bg="rgba(255, 255, 255, 0.03)"
                        backdropFilter="blur(20px)"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        p={6}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center">
                                <HStack spacing={3}>
                                    <Text color="white" fontWeight="700" fontSize="lg">
                                        Master Progress
                                    </Text>
                                    <Badge
                                        colorScheme={masterProgress === 100 ? 'green' : 'purple'}
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                    >
                                        {getMasterProgressLabel()}
                                    </Badge>
                                </HStack>
                                <Text color="brand.400" fontWeight="800" fontSize="2xl">
                                    {masterProgress}%
                                </Text>
                            </Flex>

                            <Box position="relative">
                                <Progress
                                    value={masterProgress}
                                    size="lg"
                                    borderRadius="full"
                                    bg="whiteAlpha.100"
                                    sx={{
                                        '& > div': {
                                            bgGradient: 'linear(to-r, purple.500, pink.500, orange.500)',
                                        },
                                    }}
                                />
                                {/* Shimmer on master progress */}
                                {masterProgress < 100 && (
                                    <MotionBox
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        bgGradient="linear(to-r, transparent, whiteAlpha.500, transparent)"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </Box>

                            {/* Progress Milestones */}
                            <Flex justify="space-between" px={2}>
                                {[0, 25, 50, 75, 100].map((milestone) => (
                                    <VStack key={milestone} spacing={1}>
                                        <Box
                                            w="12px"
                                            h="12px"
                                            borderRadius="full"
                                            bg={
                                                masterProgress >= milestone
                                                    ? 'brand.400'
                                                    : 'whiteAlpha.300'
                                            }
                                            border="2px solid"
                                            borderColor={
                                                masterProgress >= milestone ? 'brand.300' : 'whiteAlpha.400'
                                            }
                                            boxShadow={
                                                masterProgress >= milestone
                                                    ? '0 0 10px rgba(139, 92, 246, 0.6)'
                                                    : 'none'
                                            }
                                        />
                                        <Text fontSize="xs" color="gray.500">
                                            {milestone}%
                                        </Text>
                                    </VStack>
                                ))}
                            </Flex>
                        </VStack>
                    </MotionBox>

                    {/* Agent Cards Grid */}
                    <Box
                        w="full"
                        display="grid"
                        gridTemplateColumns={{
                            base: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                        }}
                        gap={6}
                    >
                        {AGENTS.map((agent, idx) => (
                            <MotionBox
                                key={agent.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <AgentCard
                                    agent={agent}
                                    progress={agentProgress[agent.id] || 0}
                                    status={agentStates[agent.id] || 'idle'}
                                    logs={agentLogs[agent.id] || []}
                                    onRestart={() => handleRestart(agent.id)}
                                    elapsedTime={elapsedTimes[agent.id] || 0}
                                    onClick={() => navigate(`/workspace/${contentId}/agent/${agent.id}`)}
                                />
                            </MotionBox>
                        ))}
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
}

export default LiveAgentWorkspace;
