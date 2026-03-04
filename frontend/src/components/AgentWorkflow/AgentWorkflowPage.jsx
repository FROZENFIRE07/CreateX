/**
 * Live Agent Workspace — Full-Screen Slideshow
 * Each agent is a full-screen animated page.
 * When an agent completes, it slides out and the next one slides in.
 * Theme: #FF6B01 / #FFFFFF / #353535
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Button, Badge, Icon,
    Divider, Tooltip, Collapse, useDisclosure, SimpleGrid, Progress,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiServer, FiShield, FiSend, FiCpu,
    FiZap, FiCheckCircle, FiClock,
    FiRefreshCw, FiDatabase, FiActivity,
    FiTarget, FiBarChart2, FiSearch, FiHash, FiFeather,
    FiBox, FiGlobe, FiStar, FiAlertCircle, FiLayers,
    FiMessageSquare, FiTrendingUp, FiChevronRight, FiChevronLeft,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { getUsername } from '../Welcome/WelcomeScreen';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// ─── THEME ───
const T = {
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.35)',
    primaryFaint: 'rgba(255,107,1,0.1)',
    white: '#FFFFFF',
    surface: '#353535',
    bg: '#1A1A1A',
    bgDeep: '#111111',
};

// ─── SLIDE VARIANTS ───
const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.9,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
        scale: 0.9,
    }),
};

// ─── AGENT DEFINITIONS ───
const AGENTS = [
    {
        id: 'manager', name: 'Manager', fullName: 'Manager Agent',
        role: 'Chief Orchestrator', icon: FiServer, color: '#A78BFA', avatar: '🎯',
        description: 'Orchestrates the entire workflow — delegates tasks, monitors progress, and ensures quality standards are met before output is finalized.',
        logs: [
            'Initializing orchestration pipeline...',
            'Parsing user prompt — detecting intent...',
            'Intent classified: Content Generation',
            'Allocating resources to agent cluster...',
            'Delegation complete → 4 agents activated',
        ],
        capabilities: [
            { icon: FiActivity, label: 'Pipeline Orchestration', desc: 'Coordinates the full content transformation pipeline' },
            { icon: FiDatabase, label: 'Memory System Access', desc: 'Queries vector store and episodic memory for context' },
            { icon: FiTarget, label: 'Task Delegation', desc: 'Routes work to the right specialized agent' },
            { icon: FiTrendingUp, label: 'KPI Calculation', desc: 'Computes quality metrics and performance scores' },
        ],
        expectedSteps: [
            { title: 'Creating Execution Plan', desc: 'Building the optimal pipeline strategy', icon: FiTarget },
            { title: 'Querying Memory Systems', desc: 'Retrieving brand DNA and past performance data', icon: FiDatabase },
            { title: 'Delegating to Worker Agents', desc: 'Dispatching tasks to Ingest, Generator, Reviewer, Publisher', icon: FiSend },
            { title: 'Monitoring Progress', desc: 'Tracking each agent\'s status and handling retries', icon: FiActivity },
            { title: 'Calculating KPIs', desc: 'Computing final quality scores and timing metrics', icon: FiBarChart2 },
        ],
    },
    {
        id: 'ingest', name: 'Ingest', fullName: 'Ingest Agent',
        role: 'Content Analyst', icon: FiDatabase, color: '#34D399', avatar: '🧠',
        description: 'Deeply analyzes content to extract themes, keywords, sentiment, and generates embeddings for RAG retrieval.',
        logs: [
            'Connecting to knowledge base...',
            'Indexing 24 relevant articles...',
            'Extracting key terms & entities...',
            'Building semantic context map...',
            'Knowledge base ready — 98% relevance',
        ],
        capabilities: [
            { icon: FiSearch, label: 'Content Analysis', desc: 'Deep structural analysis of input content' },
            { icon: FiHash, label: 'Theme Extraction', desc: 'Identifies core topics and subject matter' },
            { icon: FiFeather, label: 'Sentiment Analysis', desc: 'Determines tone, emotion, and style' },
            { icon: FiBox, label: 'Vector Embeddings', desc: 'Creates numerical representations for search' },
        ],
        expectedSteps: [
            { title: 'Analyzing Content Structure', desc: 'Parsing format, length, and readability level', icon: FiSearch },
            { title: 'Extracting Themes & Keywords', desc: 'Identifying core topics, entities, and phrases', icon: FiHash },
            { title: 'Determining Sentiment', desc: 'Analyzing tone, emotion, and persuasion style', icon: FiFeather },
            { title: 'Generating Embeddings', desc: 'Creating vector representations for similarity matching', icon: FiBox },
            { title: 'Retrieving Context via RAG', desc: 'Querying vector store for relevant historical content', icon: FiDatabase },
            { title: 'Creating Enriched Payload', desc: 'Combining analysis into a rich context package', icon: FiLayers },
        ],
    },
    {
        id: 'generator', name: 'Generator', fullName: 'Generator Agent',
        role: 'Content Creator', icon: FiZap, color: '#FBBF24', avatar: '✨',
        description: 'Creates platform-specific content variants tailored to format, audience, and brand voice.',
        logs: [
            'Loading brand DNA profile...',
            'Generating content variants (Tone: Auth.)...',
            'Applying brand vocabulary overlay...',
            'Running style consistency checks...',
            'Content payload drafted — 3 variants',
        ],
        capabilities: [
            { icon: FiGlobe, label: 'Multi-Platform Output', desc: 'Creates variants for Twitter, LinkedIn, Email' },
            { icon: FiFeather, label: 'Brand Voice Matching', desc: 'Matches your unique tone and style' },
            { icon: FiShield, label: 'Fact Grounding', desc: 'Keeps content faithful to source material' },
            { icon: FiStar, label: 'Creative Optimization', desc: 'Optimizes hooks, CTAs, and engagement' },
        ],
        expectedSteps: [
            { title: 'Receiving Enriched Content', desc: 'Accepting analysis with themes, sentiment, and RAG context', icon: FiCpu },
            { title: 'Generating Twitter Variant', desc: 'Crafting concise tweets with hooks, hashtags, and CTAs', icon: FiGlobe },
            { title: 'Generating LinkedIn Variant', desc: 'Creating professional long-form thought leadership posts', icon: FiGlobe },
            { title: 'Generating Email Variant', desc: 'Building email copy with subject line, body, and CTA', icon: FiGlobe },
            { title: 'Applying Brand Voice', desc: 'Fine-tuning variants to match Brand DNA settings', icon: FiFeather },
            { title: 'Ensuring Fact Grounding', desc: 'Verifying claims trace back to original content', icon: FiShield },
        ],
    },
    {
        id: 'reviewer', name: 'Reviewer', fullName: 'Reviewer Agent',
        role: 'Quality Inspector', icon: FiShield, color: '#60A5FA', avatar: '🔍',
        description: 'Scores each variant against Brand DNA using weighted multi-criteria evaluation — tone, values, keywords, audience fit.',
        logs: [
            'Loading brand guidelines v3.2...',
            'Scanning for tone violations...',
            'Checking passive voice ratio...',
            'Brand consistency score: calculating...',
            'Review complete — Score: 98/100 ✓',
        ],
        capabilities: [
            { icon: FiBarChart2, label: 'Multi-Criteria Scoring', desc: 'Evaluates tone, values, keywords, and more' },
            { icon: FiShield, label: 'Brand Consistency', desc: 'Ensures alignment with Brand DNA' },
            { icon: FiAlertCircle, label: 'Prohibited Word Check', desc: 'Flags restricted terminology' },
            { icon: FiTarget, label: 'Audience Fit Analysis', desc: 'Validates audience resonance' },
        ],
        expectedSteps: [
            { title: 'Receiving Variant for Review', desc: 'Accepting generated content for quality evaluation', icon: FiLayers },
            { title: 'Scoring Tone Match (30%)', desc: 'Evaluating brand communication tone alignment', icon: FiFeather },
            { title: 'Scoring Value Alignment (25%)', desc: 'Checking brand values and principles', icon: FiShield },
            { title: 'Checking Keyword Usage (15%)', desc: 'Verifying strategic keywords are incorporated', icon: FiHash },
            { title: 'Verifying Prohibited Words (15%)', desc: 'Scanning for blacklisted terms', icon: FiAlertCircle },
            { title: 'Scoring Audience Fit (15%)', desc: 'Assessing relevance to target audience', icon: FiTarget },
            { title: 'Calculating Weighted Score', desc: 'Computing final brand consistency score', icon: FiBarChart2 },
        ],
        scoringWeights: [
            { label: 'Tone Match', weight: 30, color: '#FBBF24' },
            { label: 'Value Alignment', weight: 25, color: '#34D399' },
            { label: 'Keyword Usage', weight: 15, color: '#60A5FA' },
            { label: 'Prohibited Words', weight: 15, color: '#F87171' },
            { label: 'Audience Fit', weight: 15, color: '#A78BFA' },
        ],
    },
    {
        id: 'publisher', name: 'Publisher', fullName: 'Publisher Agent',
        role: 'Distribution Specialist', icon: FiSend, color: T.primary, avatar: '🚀',
        description: 'Formats approved variants into platform-ready API payloads with metadata and formatting rules.',
        logs: [
            'Loading platform adapters...',
            'Formatting for X (Twitter)...',
            'Formatting for LinkedIn...',
            'Formatting for Email...',
            'All platforms ready — Awaiting deploy ✓',
        ],
        capabilities: [
            { icon: FiGlobe, label: 'Platform Formatting', desc: 'Formats to each platform\'s API specs' },
            { icon: FiBox, label: 'Metadata Generation', desc: 'Creates SEO tags and preview data' },
            { icon: FiSend, label: 'API Payload Creation', desc: 'Builds ready-to-send payloads' },
            { icon: FiCheckCircle, label: 'Delivery Validation', desc: 'Verifies platform requirements' },
        ],
        expectedSteps: [
            { title: 'Receiving Approved Variant', desc: 'Accepting reviewed content from Reviewer Agent', icon: FiCheckCircle },
            { title: 'Formatting for Twitter API', desc: 'Applying character limits, threading, and hashtag rules', icon: FiGlobe },
            { title: 'Formatting for LinkedIn API', desc: 'Structuring for rich text, mentions, and tags', icon: FiGlobe },
            { title: 'Formatting for Email API', desc: 'Building HTML template with subject and preview text', icon: FiGlobe },
            { title: 'Generating Metadata', desc: 'Creating SEO descriptions and tracking parameters', icon: FiBox },
            { title: 'Creating API Payloads', desc: 'Assembling final JSON payloads for platform APIs', icon: FiSend },
        ],
    },
];

// ─── PROCESS STEP ───
const ProcessStep = ({ step, index, isActive, isComplete, agentColor, total }) => (
    <MotionBox
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.12, duration: 0.5 }}
        bg={isActive ? `${agentColor}15` : isComplete ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.02)'}
        border="1px solid"
        borderColor={isActive ? `${agentColor}50` : isComplete ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'}
        borderRadius="xl"
        px={5} py={4}
        position="relative"
        overflow="hidden"
    >
        {isActive && (
            <MotionBox
                position="absolute" top={0} left={0} right={0} bottom={0}
                bg={agentColor} opacity={0.04}
                animate={{ opacity: [0.02, 0.07, 0.02] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        )}
        <HStack spacing={4} position="relative" zIndex={1}>
            <Flex
                w="42px" h="42px" borderRadius="xl" flexShrink={0}
                bg={isComplete ? '#4ADE80' : isActive ? agentColor : 'whiteAlpha.100'}
                align="center" justify="center"
                boxShadow={isActive ? `0 0 20px ${agentColor}50` : 'none'}
            >
                {isComplete ? (
                    <Icon as={FiCheckCircle} color="white" boxSize={5} />
                ) : (
                    <Icon as={step.icon} color={isActive ? 'white' : 'gray.600'} boxSize={5} />
                )}
            </Flex>
            <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="600" fontSize="md" color={T.white}>{step.title}</Text>
                <Text fontSize="sm" color="gray.500">{step.desc}</Text>
            </VStack>
            <HStack spacing={2}>
                {isActive && (
                    <MotionBox
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    >
                        <Box w="10px" h="10px" borderRadius="full" bg={agentColor} />
                    </MotionBox>
                )}
                {isComplete && (
                    <Badge bg="rgba(74,222,128,0.12)" color="#4ADE80" fontSize="xs" rounded="full" px={3}>Done</Badge>
                )}
            </HStack>
        </HStack>
    </MotionBox>
);

// ─── FULL-SCREEN AGENT PAGE ───
const AgentPage = ({ agent, progress, status, currentStepIndex, logs, elapsed, onRestart }) => {
    const logRef = useRef(null);
    const { isOpen: isLogsOpen, onToggle: onLogsToggle } = useDisclosure({ defaultIsOpen: true });

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logs]);

    return (
        <Box w="full" minH="calc(100vh - 200px)" position="relative">
            {/* ── AGENT HEADER ── */}
            <Flex direction={{ base: 'column', lg: 'row' }} gap={8} mb={8}>
                {/* Left: Identity */}
                <Flex align="start" gap={5} flex={1}>
                    <MotionBox
                        w="80px" h="80px" borderRadius="2xl"
                        bg={`${agent.color}15`} border="2px solid" borderColor={`${agent.color}40`}
                        display="flex" alignItems="center" justifyContent="center"
                        fontSize="3xl" flexShrink={0}
                        animate={status === 'working' ? {
                            boxShadow: [`0 0 0px ${agent.color}`, `0 0 30px ${agent.color}`, `0 0 0px ${agent.color}`],
                            scale: [1, 1.05, 1],
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        {agent.avatar}
                    </MotionBox>
                    <VStack align="start" spacing={2}>
                        <HStack spacing={3}>
                            <Heading size="xl" color={T.white}>{agent.fullName}</Heading>
                            {status === 'working' && (
                                <HStack spacing={1}>
                                    {[0, 1, 2].map(i => (
                                        <MotionBox key={i} w={1.5} h={1.5} rounded="full" bg={agent.color}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                                        />
                                    ))}
                                </HStack>
                            )}
                            {status === 'complete' && (
                                <MotionBox initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <Icon as={FiCheckCircle} boxSize={6} color="#4ADE80" />
                                </MotionBox>
                            )}
                        </HStack>
                        <Text fontSize="sm" color={agent.color} fontWeight="700" textTransform="uppercase" letterSpacing="widest">
                            {agent.role}
                        </Text>
                        <Text fontSize="md" color="gray.400" maxW="600px" lineHeight="tall">
                            {agent.description}
                        </Text>
                    </VStack>
                </Flex>

                {/* Right: Stats */}
                <HStack spacing={4} align="start">
                    {[
                        { value: `${Math.round(progress)}%`, label: 'Progress', color: agent.color },
                        { value: `${elapsed}s`, label: 'Elapsed', color: T.white },
                    ].map((stat) => (
                        <VStack key={stat.label} bg="rgba(255,255,255,0.03)" border="1px solid" borderColor="whiteAlpha.100" rounded="xl" px={5} py={4} spacing={1} minW="100px">
                            <Text fontSize="2xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                            <Text fontSize="xs" color="gray.500" fontWeight="600">{stat.label}</Text>
                        </VStack>
                    ))}
                    <VStack spacing={2} pt={2}>
                        <Badge
                            bg={status === 'complete' ? 'rgba(74,222,128,0.15)' : status === 'working' ? `${agent.color}15` : 'whiteAlpha.50'}
                            color={status === 'complete' ? '#4ADE80' : status === 'working' ? agent.color : 'gray.500'}
                            rounded="full" px={4} py={1.5} fontSize="sm"
                            border="1px solid"
                            borderColor={status === 'complete' ? '#4ADE80' : status === 'working' ? agent.color : 'whiteAlpha.200'}
                        >
                            {status === 'complete' ? '✓ Complete' : status === 'working' ? '● Working' : '○ Idle'}
                        </Badge>
                        {status === 'complete' && (
                            <Button size="xs" variant="ghost" color="gray.600" _hover={{ color: T.white }} leftIcon={<FiRefreshCw size={10} />} onClick={() => onRestart(agent.id)} fontSize="xs">
                                Restart
                            </Button>
                        )}
                    </VStack>
                </HStack>
            </Flex>

            {/* ── CAPABILITIES ── */}
            <HStack spacing={3} mb={6} flexWrap="wrap">
                {agent.capabilities.map((cap, idx) => (
                    <Tooltip key={idx} label={cap.desc} hasArrow placement="top">
                        <HStack
                            bg={`${agent.color}08`} border="1px solid" borderColor={`${agent.color}25`}
                            rounded="full" px={4} py={2} spacing={2} cursor="default"
                            _hover={{ bg: `${agent.color}15`, borderColor: `${agent.color}50` }}
                            transition="all 0.2s"
                        >
                            <Icon as={cap.icon} boxSize={3.5} color={agent.color} />
                            <Text fontSize="xs" color="gray.300" fontWeight="600">{cap.label}</Text>
                        </HStack>
                    </Tooltip>
                ))}
            </HStack>

            {/* ── MAIN CONTENT: Steps + Logs side by side ── */}
            <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                {/* Process Steps */}
                <Box flex={2}>
                    <HStack mb={4} spacing={2}>
                        <Icon as={FiActivity} color={agent.color} boxSize={5} />
                        <Heading size="sm" color={T.white}>Process Steps</Heading>
                        <Text fontSize="sm" color="gray.600">({agent.expectedSteps.length} steps)</Text>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                        {agent.expectedSteps.map((step, idx) => (
                            <ProcessStep
                                key={idx} step={step} index={idx}
                                isActive={status === 'working' && idx === currentStepIndex}
                                isComplete={status === 'complete' || (status === 'working' && idx < currentStepIndex)}
                                agentColor={agent.color}
                                total={agent.expectedSteps.length}
                            />
                        ))}
                    </VStack>
                </Box>

                {/* System Logs */}
                <Box flex={1}>
                    <HStack mb={4} spacing={2}>
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">{'>'}_</Text>
                        <Heading size="sm" color={T.white}>System Logs</Heading>
                        {status === 'working' && (
                            <MotionBox w="6px" h="6px" rounded="full" bg={agent.color}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            />
                        )}
                    </HStack>
                    <Box
                        bg={T.bgDeep} rounded="xl" p={4}
                        minH="300px" maxH="500px" overflowY="auto" ref={logRef}
                        border="1px solid" borderColor="rgba(255,255,255,0.06)"
                        fontFamily="mono" fontSize="sm"
                        sx={{
                            '&::-webkit-scrollbar': { width: '3px' },
                            '&::-webkit-scrollbar-thumb': { bg: `${agent.color}60`, rounded: 'full' },
                        }}
                    >
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <MotionBox
                                    key={i} initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                                    color={agent.color} mb={1} lineHeight="1.8"
                                >
                                    <Text as="span" color="gray.700" mr={2}>{'>'}</Text>{log}
                                </MotionBox>
                            ))}
                        </AnimatePresence>
                        {status === 'working' && (
                            <HStack mt={2} spacing={1}>
                                <Text color="gray.700" fontSize="sm">{'>'}</Text>
                                <MotionBox
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.7 }}
                                    w={2} h={4} bg={agent.color} rounded="sm"
                                />
                            </HStack>
                        )}
                        {logs.length === 0 && (
                            <Text color="gray.700" fontSize="sm">Awaiting agent activation...</Text>
                        )}
                    </Box>

                    {/* Reviewer-specific: Scoring weights */}
                    {agent.scoringWeights && status === 'complete' && (
                        <MotionBox
                            mt={4} bg="rgba(255,255,255,0.02)" rounded="xl" p={4}
                            border="1px solid" borderColor="whiteAlpha.100"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <Text fontSize="xs" fontWeight="700" color="gray.400" mb={3} textTransform="uppercase">Scoring Criteria</Text>
                            <VStack spacing={2}>
                                {agent.scoringWeights.map((w, idx) => (
                                    <Box key={idx} w="full">
                                        <Flex justify="space-between" mb={1}>
                                            <Text fontSize="xs" color="gray.400">{w.label}</Text>
                                            <Text fontSize="xs" color={w.color} fontWeight="700">{w.weight}%</Text>
                                        </Flex>
                                        <Box h="4px" bg="whiteAlpha.100" rounded="full" overflow="hidden">
                                            <MotionBox
                                                h="100%" bg={w.color} rounded="full"
                                                initial={{ width: '0%' }} animate={{ width: `${w.weight}%` }}
                                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </VStack>
                        </MotionBox>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};

// ─── COMPLETION PAGE ───
const CompletionPage = ({ onViewOutputs }) => {
    const storedName = getUsername();
    return (
        <Flex w="full" minH="calc(100vh - 200px)" align="center" justify="center">
            <VStack spacing={6} textAlign="center">
                <MotionBox initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 150 }}>
                    <Box w={28} h={28} rounded="full" bg="rgba(74,222,128,0.1)" border="3px solid" borderColor="#4ADE80" display="flex" alignItems="center" justifyContent="center" boxShadow="0 0 60px rgba(74,222,128,0.3)">
                        <Icon as={FiCheckCircle} boxSize={14} color="#4ADE80" />
                    </Box>
                </MotionBox>
                <VStack spacing={2}>
                    <Heading size="2xl" color="#4ADE80">
                        {storedName ? `Great work, ${storedName}!` : 'Mission Complete'}
                    </Heading>
                    <Text color="gray.400" fontSize="lg">All 5 agents finished successfully — your content is ready!</Text>
                </VStack>
                <HStack spacing={4} mt={4}>
                    <Button size="lg" bg={T.primary} color={T.white} leftIcon={<FiSend />} rounded="full" px={10} boxShadow={`0 0 25px ${T.primaryGlow}`} _hover={{ bg: T.primaryHover, transform: 'translateY(-2px)' }} transition="all 0.2s" onClick={onViewOutputs}>
                        View Generated Content
                    </Button>
                </HStack>
            </VStack>
        </Flex>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AgentWorkflowPage() {
    const navigate = useNavigate();
    const { contentId } = useParams();

    const [agentProgress, setAgentProgress] = useState(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {}));
    const [agentStatus, setAgentStatus] = useState(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: 'idle' }), {}));
    const [agentLogs, setAgentLogs] = useState(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: [] }), {}));
    const [agentElapsed, setAgentElapsed] = useState(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {}));
    const [agentStepIndex, setAgentStepIndex] = useState(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {}));

    const [activePageIndex, setActivePageIndex] = useState(0); // 0-4 = agents, 5 = completion
    const [slideDirection, setSlideDirection] = useState(1); // 1 = forward, -1 = backward
    const [masterProgress, setMasterProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    const intervalsRef = useRef({});
    const elapsedRef = useRef({});

    useEffect(() => {
        const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            Object.values(intervalsRef.current).forEach(clearInterval);
            Object.values(elapsedRef.current).forEach(clearInterval);
        };
    }, []);

    // Auto-start
    useEffect(() => {
        const timer = setTimeout(() => startSimulation(), 800);
        return () => clearTimeout(timer);
    }, []);

    // Auto-advance to next page when current agent completes
    useEffect(() => {
        if (activePageIndex < AGENTS.length) {
            const currentAgent = AGENTS[activePageIndex];
            if (agentStatus[currentAgent.id] === 'complete') {
                const timer = setTimeout(() => {
                    setSlideDirection(1);
                    if (activePageIndex < AGENTS.length - 1) {
                        setActivePageIndex(prev => prev + 1);
                    } else {
                        // Last agent done → show completion
                        setActivePageIndex(AGENTS.length);
                    }
                }, 900); // shift to next agent promptly after completion
                return () => clearTimeout(timer);
            }
        }
    }, [agentStatus, activePageIndex]);

    const startSimulation = useCallback(() => {
        if (isStarted) return;
        setIsStarted(true);
        setIsComplete(false);
        setShowConfetti(false);
        setActivePageIndex(0);

        const reset = (val) => AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: val }), {});
        setAgentProgress(reset(0));
        setAgentStatus(reset('idle'));
        setAgentLogs(AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: [] }), {}));
        setAgentElapsed(reset(0));
        setAgentStepIndex(reset(0));

        AGENTS.forEach((agent, agentIdx) => {
            const startDelay = agentIdx * 3500; // staggered start for cinematic pacing
            setTimeout(() => {
                setAgentStatus(prev => ({ ...prev, [agent.id]: 'working' }));
                const startTime = Date.now();
                elapsedRef.current[agent.id] = setInterval(() => {
                    setAgentElapsed(prev => ({ ...prev, [agent.id]: Math.floor((Date.now() - startTime) / 1000) }));
                }, 1000);

                let logIdx = 0;
                let stepIdx = 0;
                let prog = 0;
                const totalLogs = agent.logs.length;
                const totalSteps = agent.expectedSteps.length;
                intervalsRef.current[agent.id] = setInterval(() => {
                    if (logIdx < totalLogs) {
                        setAgentLogs(prev => ({ ...prev, [agent.id]: [...prev[agent.id], agent.logs[logIdx]] }));
                        logIdx++;
                    }
                    const newStepIdx = Math.min(totalSteps - 1, Math.floor((prog / 100) * totalSteps));
                    if (newStepIdx !== stepIdx) {
                        stepIdx = newStepIdx;
                        setAgentStepIndex(prev => ({ ...prev, [agent.id]: stepIdx }));
                    }
                    prog = Math.min(100, prog + (100 / totalLogs) + Math.random() * 2);
                    setAgentProgress(prev => ({ ...prev, [agent.id]: Math.min(100, prog) }));
                    if (logIdx >= totalLogs && prog >= 95) {
                        // Hold at 100% briefly before marking complete
                        setAgentProgress(prev => ({ ...prev, [agent.id]: 100 }));
                        setTimeout(() => {
                            setAgentStatus(prev => ({ ...prev, [agent.id]: 'complete' }));
                            setAgentStepIndex(prev => ({ ...prev, [agent.id]: totalSteps }));
                        }, 500); // brief completion flash before auto-advance
                        clearInterval(intervalsRef.current[agent.id]);
                        clearInterval(elapsedRef.current[agent.id]);
                    }
                }, 900); // slower step interval for visibility
            }, startDelay);
        });
    }, [isStarted]);

    // Master progress & completion
    useEffect(() => {
        const vals = Object.values(agentProgress);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        setMasterProgress(avg);
        const allDone = Object.values(agentStatus).every(s => s === 'complete');
        if (allDone && isStarted && !isComplete && avg >= 100) {
            setIsComplete(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000);
        }
    }, [agentProgress, agentStatus, isStarted, isComplete]);

    const handleRestart = (agentId) => {
        const agent = AGENTS.find(a => a.id === agentId);
        if (!agent) return;
        setAgentProgress(prev => ({ ...prev, [agentId]: 0 }));
        setAgentStatus(prev => ({ ...prev, [agentId]: 'working' }));
        setAgentLogs(prev => ({ ...prev, [agentId]: [] }));
        setAgentStepIndex(prev => ({ ...prev, [agentId]: 0 }));
        setIsComplete(false);

        const startTime = Date.now();
        elapsedRef.current[agentId] = setInterval(() => {
            setAgentElapsed(prev => ({ ...prev, [agentId]: Math.floor((Date.now() - startTime) / 1000) }));
        }, 1000);

        let logIdx = 0;
        let stepIdx = 0;
        let prog = 0;
        const totalLogs = agent.logs.length;
        const totalSteps = agent.expectedSteps.length;
        intervalsRef.current[agentId] = setInterval(() => {
            if (logIdx < totalLogs) {
                setAgentLogs(prev => ({ ...prev, [agentId]: [...prev[agentId], agent.logs[logIdx]] }));
                logIdx++;
            }
            const newStepIdx = Math.min(totalSteps - 1, Math.floor((prog / 100) * totalSteps));
            if (newStepIdx !== stepIdx) {
                stepIdx = newStepIdx;
                setAgentStepIndex(prev => ({ ...prev, [agentId]: stepIdx }));
            }
            prog = Math.min(100, prog + (100 / totalLogs) + Math.random() * 2);
            setAgentProgress(prev => ({ ...prev, [agentId]: Math.min(100, prog) }));
            if (logIdx >= totalLogs && prog >= 95) {
                setAgentProgress(prev => ({ ...prev, [agentId]: 100 }));
                setTimeout(() => {
                    setAgentStatus(prev => ({ ...prev, [agentId]: 'complete' }));
                    setAgentStepIndex(prev => ({ ...prev, [agentId]: totalSteps }));
                }, 500);
                clearInterval(intervalsRef.current[agentId]);
                clearInterval(elapsedRef.current[agentId]);
            }
        }, 900);
    };

    const goBack = () => navigate('/');
    const viewOutputs = () => navigate(`/content/${contentId}`);

    // Manual navigation
    const goToPage = (idx) => {
        if (idx === activePageIndex) return;
        setSlideDirection(idx > activePageIndex ? 1 : -1);
        setActivePageIndex(idx);
    };

    return (
        <Box minH="100vh" bg={T.bg} color={T.white} position="relative" overflow="hidden">
            {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={300} colors={[T.primary, '#4ADE80', '#FBBF24', '#A78BFA', '#60A5FA', T.white]} gravity={0.15} />}

            <Box position="fixed" top="-20%" left="-10%" w="50vw" h="50vw" bg={T.primary} filter="blur(200px)" opacity={0.05} pointerEvents="none" />
            <Box position="fixed" bottom="-20%" right="-10%" w="45vw" h="45vw" bg="#A78BFA" filter="blur(200px)" opacity={0.04} pointerEvents="none" />

            <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, xl: 8 }} position="relative" zIndex={1}>

                {/* ── TOP BAR ── */}
                <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                    <HStack spacing={4}>
                        <Button leftIcon={<FiArrowLeft />} variant="ghost" color="gray.400" _hover={{ color: T.white, bg: 'whiteAlpha.100' }} onClick={goBack} size="sm">
                            Back to Dashboard
                        </Button>
                        <Divider orientation="vertical" h={5} borderColor="whiteAlpha.200" />
                        <HStack spacing={2}>
                            <Box bg={T.primary} p={1.5} rounded="lg" boxShadow={`0 0 15px ${T.primaryGlow}`}>
                                <Icon as={FiCpu} boxSize={4} color={T.white} />
                            </Box>
                            <Heading size="md" color={T.white} letterSpacing="tight">Live Agent Workspace</Heading>
                        </HStack>
                    </HStack>
                    <HStack spacing={3}>
                        {isComplete && (
                            <MotionBox initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                <Button size="sm" bg={T.primary} color={T.white} leftIcon={<FiSend />} boxShadow={`0 0 20px ${T.primaryGlow}`} _hover={{ bg: T.primaryHover }} onClick={viewOutputs} rounded="full" px={5}>
                                    View Outputs
                                </Button>
                            </MotionBox>
                        )}
                        <Badge bg={isComplete ? 'rgba(74,222,128,0.15)' : T.primaryFaint} color={isComplete ? '#4ADE80' : T.primary} px={3} py={1} rounded="full" fontSize="xs" border="1px solid" borderColor={isComplete ? '#4ADE80' : T.primary}>
                            {isComplete ? '✅ All Agents Complete' : isStarted ? '⚡ Orchestrating...' : '🔄 Initializing...'}
                        </Badge>
                    </HStack>
                </Flex>

                {/* ── AGENT NAVIGATION DOTS ── */}
                <Flex align="center" justify="center" gap={0} mb={6} bg="rgba(53,53,53,0.4)" backdropFilter="blur(12px)" rounded="2xl" p={3} border="1px solid" borderColor="rgba(255,255,255,0.08)">
                    {AGENTS.map((agent, idx) => {
                        const st = agentStatus[agent.id];
                        const isActivePage = activePageIndex === idx;
                        return (
                            <React.Fragment key={agent.id}>
                                <Tooltip label={`${agent.name} — ${st === 'complete' ? 'Complete' : st === 'working' ? 'Working' : 'Idle'}`} hasArrow>
                                    <Flex
                                        direction="column" align="center" gap={1.5}
                                        cursor="pointer" onClick={() => goToPage(idx)}
                                        opacity={isActivePage ? 1 : 0.6}
                                        _hover={{ opacity: 1 }}
                                        transition="all 0.2s"
                                        px={4}
                                    >
                                        <MotionBox
                                            w={isActivePage ? 10 : 8} h={isActivePage ? 10 : 8}
                                            rounded="full"
                                            bg={st === 'complete' ? 'rgba(74,222,128,0.15)' : st === 'working' ? `${agent.color}15` : isActivePage ? 'whiteAlpha.100' : 'whiteAlpha.50'}
                                            border="2px solid"
                                            borderColor={isActivePage ? (st === 'complete' ? '#4ADE80' : agent.color) : (st === 'complete' ? '#4ADE80' : st === 'working' ? agent.color : 'whiteAlpha.200')}
                                            display="flex" alignItems="center" justifyContent="center"
                                            animate={st === 'working' && isActivePage ? { boxShadow: [`0 0 0px ${agent.color}`, `0 0 20px ${agent.color}`, `0 0 0px ${agent.color}`] } : {}}
                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                        >
                                            <Icon as={st === 'complete' ? FiCheckCircle : agent.icon} boxSize={isActivePage ? 4.5 : 3.5} color={st === 'complete' ? '#4ADE80' : st === 'working' ? agent.color : 'gray.600'} />
                                        </MotionBox>
                                        <Text fontSize="2xs" fontWeight={isActivePage ? '700' : '500'} color={isActivePage ? T.white : 'gray.500'}>
                                            {agent.name}
                                        </Text>
                                    </Flex>
                                </Tooltip>
                                {idx < AGENTS.length - 1 && (
                                    <Box w="40px" h="2px" bg="whiteAlpha.100" rounded="full" position="relative" mx={-1} mt={-3}>
                                        <Box
                                            h="100%" rounded="full"
                                            bg={agentStatus[AGENTS[idx].id] === 'complete' ? '#4ADE80' : agentStatus[AGENTS[idx].id] === 'working' ? agent.color : 'transparent'}
                                            w={agentStatus[AGENTS[idx].id] === 'complete' ? '100%' : agentStatus[AGENTS[idx].id] === 'working' ? `${agentProgress[AGENTS[idx].id]}%` : '0%'}
                                            transition="all 0.3s"
                                        />
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Flex>

                {/* ── FULL-SCREEN AGENT PAGE (SLIDESHOW) ── */}
                <Box position="relative" overflow="hidden" minH="calc(100vh - 220px)">
                    <AnimatePresence mode="wait" custom={slideDirection}>
                        {activePageIndex < AGENTS.length ? (
                            <MotionBox
                                key={AGENTS[activePageIndex].id}
                                custom={slideDirection}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 60, damping: 16 },
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.5 },
                                }}
                                position="absolute"
                                w="full"
                            >
                                <AgentPage
                                    agent={AGENTS[activePageIndex]}
                                    progress={agentProgress[AGENTS[activePageIndex].id]}
                                    status={agentStatus[AGENTS[activePageIndex].id]}
                                    currentStepIndex={agentStepIndex[AGENTS[activePageIndex].id]}
                                    logs={agentLogs[AGENTS[activePageIndex].id]}
                                    elapsed={agentElapsed[AGENTS[activePageIndex].id]}
                                    onRestart={handleRestart}
                                />
                            </MotionBox>
                        ) : (
                            <MotionBox
                                key="completion"
                                custom={slideDirection}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 80, damping: 18 },
                                    opacity: { duration: 0.3 },
                                }}
                                position="absolute"
                                w="full"
                            >
                                <CompletionPage onViewOutputs={viewOutputs} />
                            </MotionBox>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
}
