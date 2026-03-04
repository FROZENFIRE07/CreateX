/**
 * Agent Detail Page - Dedicated Individual Agent Views
 * Each of the 5 agents gets its own rich, unique page with:
 * - Detailed role description & capabilities
 * - Pre-defined expected process flow
 * - Live activity overlay from API
 * - Agent-specific metrics & output
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
    Icon,
    Progress,
    SimpleGrid,
    Divider,
    Collapse,
    useDisclosure,
    Tooltip,
    Tag,
    TagLabel,
    TagLeftIcon,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiZap,
    FiCpu,
    FiLayers,
    FiEye,
    FiSend,
    FiCheckCircle,
    FiClock,
    FiTarget,
    FiList,
    FiActivity,
    FiDatabase,
    FiGlobe,
    FiShield,
    FiTrendingUp,
    FiAlertCircle,
    FiBox,
    FiFeather,
    FiBarChart2,
    FiSearch,
    FiStar,
    FiHash,
    FiMessageSquare,
} from 'react-icons/fi';
import api from '../../services/api';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEDICATED AGENT CONFIGURATIONS - Each agent is unique
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AGENT_CONFIGS = {
    manager: {
        name: 'Manager Agent',
        icon: FiZap,
        color: '#8b5cf6',
        bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
        avatar: '🎯',
        role: 'Chief Orchestrator',
        description: 'The Manager Agent is the brain of the operation — it orchestrates the entire multi-agent pipeline, delegates tasks to specialized worker agents, monitors progress, and ensures quality standards are met before output is finalized.',
        capabilities: [
            { icon: FiActivity, label: 'Pipeline Orchestration', desc: 'Coordinates the full content transformation pipeline' },
            { icon: FiDatabase, label: 'Memory System Access', desc: 'Queries vector store and episodic memory for context' },
            { icon: FiTarget, label: 'Task Delegation', desc: 'Routes work to the right specialized agent' },
            { icon: FiTrendingUp, label: 'KPI Calculation', desc: 'Computes quality metrics and performance scores' },
            { icon: FiShield, label: 'Authority Enforcement', desc: 'Ensures all generation passes through approval gates' },
        ],
        expectedSteps: [
            { title: 'Creating Execution Plan', desc: 'Analyzing input and building the optimal pipeline strategy', icon: FiList },
            { title: 'Querying Memory Systems', desc: 'Retrieving brand DNA, past performance data, and user preferences', icon: FiDatabase },
            { title: 'Delegating to Worker Agents', desc: 'Dispatching tasks to Ingest, Generator, Reviewer, and Publisher', icon: FiSend },
            { title: 'Monitoring Progress', desc: 'Tracking each agent\'s status and handling errors or retries', icon: FiActivity },
            { title: 'Calculating KPIs', desc: 'Computing final quality scores, timing metrics, and success rates', icon: FiBarChart2 },
        ],
        funFacts: [
            'Processes all requests through a single authority point for consistency',
            'Maintains a memory of past orchestrations to improve future runs',
            'Can recover from individual agent failures without restarting the pipeline',
        ],
    },
    ingest: {
        name: 'Ingest Agent',
        icon: FiCpu,
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
        avatar: '🧠',
        role: 'Content Analyst',
        description: 'The Ingest Agent is the analytical powerhouse — it deeply analyzes your content to extract themes, keywords, sentiment, and context. It generates vector embeddings and retrieves relevant past content via RAG to enrich the transformation pipeline.',
        capabilities: [
            { icon: FiSearch, label: 'Content Analysis', desc: 'Deep structural analysis of input content' },
            { icon: FiHash, label: 'Theme Extraction', desc: 'Identifies core topics, themes, and subject matter' },
            { icon: FiFeather, label: 'Sentiment Analysis', desc: 'Determines tone, emotion, and writing style' },
            { icon: FiBox, label: 'Vector Embeddings', desc: 'Creates numerical representations for similarity search' },
            { icon: FiDatabase, label: 'RAG Retrieval', desc: 'Finds similar past content to inform generation' },
        ],
        expectedSteps: [
            { title: 'Analyzing Content Structure', desc: 'Parsing input format, length, structure, and readability level', icon: FiSearch },
            { title: 'Extracting Themes & Keywords', desc: 'Identifying core topics, entities, and important phrases', icon: FiHash },
            { title: 'Determining Sentiment', desc: 'Analyzing overall tone, emotion, and persuasion style', icon: FiFeather },
            { title: 'Generating Embeddings', desc: 'Creating vector representations for semantic similarity matching', icon: FiBox },
            { title: 'Retrieving Context via RAG', desc: 'Querying vector store for relevant historical content and brand context', icon: FiDatabase },
            { title: 'Creating Enriched Payload', desc: 'Combining all analysis into a rich context package for generation', icon: FiLayers },
        ],
        funFacts: [
            'Can process text, URLs, and file uploads in multiple formats',
            'Embeddings enable finding content similar to yours from past runs',
            'RAG retrieval improves variant quality by up to 40% with relevant context',
        ],
    },
    generator: {
        name: 'Generator Agent',
        icon: FiLayers,
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
        avatar: '✨',
        role: 'Content Creator',
        description: 'The Generator Agent is the creative engine — it takes the enriched analysis and produces platform-specific content variants for Twitter, LinkedIn, Email, and more. Each variant is tailored to the platform\'s format, audience expectations, and your brand voice.',
        capabilities: [
            { icon: FiGlobe, label: 'Multi-Platform Output', desc: 'Creates variants for Twitter, LinkedIn, Email, and more' },
            { icon: FiFeather, label: 'Brand Voice Adaptation', desc: 'Matches your unique tone and communication style' },
            { icon: FiShield, label: 'Fact Grounding', desc: 'Ensures generated content stays faithful to source material' },
            { icon: FiStar, label: 'Creative Optimization', desc: 'Optimizes hooks, CTAs, and engagement elements per platform' },
            { icon: FiMessageSquare, label: 'Format Compliance', desc: 'Respects character limits, hashtag norms, and platform rules' },
        ],
        expectedSteps: [
            { title: 'Receiving Enriched Content', desc: 'Accepting the analysis payload with themes, sentiment, and RAG context', icon: FiCpu },
            { title: 'Generating Twitter Variant', desc: 'Crafting concise, engaging tweets with hooks, hashtags, and CTAs', icon: FiGlobe },
            { title: 'Generating LinkedIn Variant', desc: 'Creating professional long-form posts with thought leadership angle', icon: FiGlobe },
            { title: 'Generating Email Variant', desc: 'Building compelling email copy with subject line, body, and CTA', icon: FiGlobe },
            { title: 'Applying Brand Voice', desc: 'Fine-tuning all variants to match your Brand DNA settings', icon: FiFeather },
            { title: 'Ensuring Fact Grounding', desc: 'Verifying all claims and facts trace back to original content', icon: FiShield },
        ],
        funFacts: [
            'Each platform variant is generated independently for maximum quality',
            'Brand voice matching uses your Brand DNA profile for consistency',
            'Can generate up to 5 platform variants in a single pipeline run',
        ],
    },
    reviewer: {
        name: 'Reviewer Agent',
        icon: FiEye,
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
        avatar: '🔍',
        role: 'Quality Inspector',
        description: 'The Reviewer Agent is the quality gatekeeper — it scores each generated variant against your Brand DNA using a weighted multi-criteria evaluation. Variants must pass a minimum quality threshold to be approved for publishing.',
        capabilities: [
            { icon: FiBarChart2, label: 'Multi-Criteria Scoring', desc: 'Evaluates tone, values, keywords, audience fit, and more' },
            { icon: FiShield, label: 'Brand Consistency', desc: 'Ensures all content aligns with your Brand DNA profile' },
            { icon: FiAlertCircle, label: 'Prohibited Word Check', desc: 'Flags and blocks restricted terminology' },
            { icon: FiTarget, label: 'Audience Fit Analysis', desc: 'Validates content resonates with target demographic' },
            { icon: FiTrendingUp, label: 'Quality Threshold', desc: 'Enforces minimum scores before approval' },
        ],
        expectedSteps: [
            { title: 'Receiving Variant for Review', desc: 'Accepting the generated content variant for quality evaluation', icon: FiLayers },
            { title: 'Scoring Tone Match (30%)', desc: 'Evaluating how well the variant matches your brand\'s communication tone', icon: FiFeather },
            { title: 'Scoring Value Alignment (25%)', desc: 'Checking alignment with your stated brand values and principles', icon: FiShield },
            { title: 'Checking Keyword Usage (15%)', desc: 'Verifying strategic keywords are naturally incorporated', icon: FiHash },
            { title: 'Verifying Prohibited Words (15%)', desc: 'Scanning for blacklisted terms and inappropriate language', icon: FiAlertCircle },
            { title: 'Scoring Audience Fit (15%)', desc: 'Assessing relevance and appeal to your target audience', icon: FiTarget },
            { title: 'Calculating Weighted Score', desc: 'Computing final brand consistency score from all criteria', icon: FiBarChart2 },
        ],
        funFacts: [
            'Uses a weighted scoring system: Tone 30%, Values 25%, Keywords 15%, Prohibited 15%, Audience 15%',
            'Variants scoring below 70% are flagged for regeneration',
            'Review criteria are derived from your Brand DNA settings',
        ],
        scoringBreakdown: [
            { label: 'Tone Match', weight: 30, color: '#f59e0b' },
            { label: 'Value Alignment', weight: 25, color: '#10b981' },
            { label: 'Keyword Usage', weight: 15, color: '#3b82f6' },
            { label: 'Prohibited Words', weight: 15, color: '#ef4444' },
            { label: 'Audience Fit', weight: 15, color: '#8b5cf6' },
        ],
    },
    publisher: {
        name: 'Publisher Agent',
        icon: FiSend,
        color: '#ec4899',
        bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.05) 100%)',
        avatar: '🚀',
        role: 'Distribution Specialist',
        description: 'The Publisher Agent is the final mile — it takes approved variants and formats them into platform-ready API payloads. It generates metadata, applies platform-specific formatting rules, and prepares everything for seamless publishing.',
        capabilities: [
            { icon: FiGlobe, label: 'Platform Formatting', desc: 'Formats content to each platform\'s exact API specifications' },
            { icon: FiBox, label: 'Metadata Generation', desc: 'Creates SEO tags, alt text, and rich preview data' },
            { icon: FiSend, label: 'API Payload Creation', desc: 'Builds ready-to-send payloads for each platform' },
            { icon: FiDatabase, label: 'Asset Management', desc: 'Attaches images, links, and media to each variant' },
            { icon: FiCheckCircle, label: 'Delivery Validation', desc: 'Verifies payloads meet platform requirements' },
        ],
        expectedSteps: [
            { title: 'Receiving Approved Variant', desc: 'Accepting reviewed and approved content from the Reviewer Agent', icon: FiCheckCircle },
            { title: 'Formatting for Twitter API', desc: 'Applying character limits, thread structure, and hashtag rules', icon: FiGlobe },
            { title: 'Formatting for LinkedIn API', desc: 'Structuring for rich text, mentions, and company tags', icon: FiGlobe },
            { title: 'Formatting for Email API', desc: 'Building HTML template with subject, preview text, and body', icon: FiGlobe },
            { title: 'Generating Metadata', desc: 'Creating SEO descriptions, preview cards, and tracking parameters', icon: FiBox },
            { title: 'Creating API Payloads', desc: 'Assembling final JSON payloads ready for platform APIs', icon: FiSend },
        ],
        funFacts: [
            'Supports Twitter, LinkedIn, Email, Instagram, and Blog formats',
            'Auto-generates platform-specific metadata for rich link previews',
            'Validates payload size and format before marking as ready',
        ],
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Animated Process Step (for expected steps)
const ExpectedStep = ({ step, index, isLive, liveStatus, liveDuration, agentColor }) => (
    <MotionBox
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        bg={isLive && liveStatus === 'active' ? `${agentColor}15` : 'rgba(255, 255, 255, 0.02)'}
        border="1px solid"
        borderColor={isLive && liveStatus === 'active' ? agentColor : 'whiteAlpha.100'}
        borderRadius="xl"
        p={4}
        position="relative"
        overflow="hidden"
        _hover={{ borderColor: `${agentColor}80`, bg: 'rgba(255, 255, 255, 0.04)' }}
        transition="all 0.2s"
    >
        {/* Active pulse animation */}
        {isLive && liveStatus === 'active' && (
            <MotionBox
                position="absolute"
                top={0} left={0} right={0} bottom={0}
                bg={agentColor}
                opacity={0.05}
                animate={{ opacity: [0.03, 0.08, 0.03] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        )}

        <HStack spacing={4} position="relative" zIndex={1}>
            {/* Step number / status icon */}
            <Box
                w="44px" h="44px"
                borderRadius="xl"
                bg={
                    isLive && liveStatus === 'completed' ? 'green.500' :
                        isLive && liveStatus === 'active' ? agentColor :
                            'whiteAlpha.100'
                }
                display="flex" alignItems="center" justifyContent="center"
                flexShrink={0}
                boxShadow={isLive && liveStatus === 'active' ? `0 0 20px ${agentColor}60` : 'none'}
            >
                {isLive && liveStatus === 'completed' ? (
                    <Icon as={FiCheckCircle} color="white" boxSize={5} />
                ) : (
                    <Icon
                        as={step.icon}
                        color={isLive ? 'white' : 'gray.500'}
                        boxSize={5}
                    />
                )}
            </Box>

            <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="600" color="white" fontSize="md">
                    {step.title}
                </Text>
                <Text fontSize="sm" color="gray.400">
                    {step.desc}
                </Text>
            </VStack>

            {/* Duration badge */}
            {liveDuration && (
                <Badge colorScheme="purple" variant="subtle" fontSize="xs" borderRadius="full" px={3}>
                    <HStack spacing={1}>
                        <Icon as={FiClock} boxSize={3} />
                        <Text>{liveDuration}</Text>
                    </HStack>
                </Badge>
            )}

            {/* Status indicator */}
            {isLive && liveStatus === 'active' && (
                <MotionBox
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Box w="10px" h="10px" borderRadius="full" bg={agentColor} />
                </MotionBox>
            )}
            {isLive && liveStatus === 'completed' && (
                <Badge colorScheme="green" variant="subtle" fontSize="xs">Done</Badge>
            )}
        </HStack>
    </MotionBox>
);

// Capability Card
const CapabilityCard = ({ cap, index, agentColor }) => (
    <MotionBox
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.08 }}
        bg="rgba(255, 255, 255, 0.02)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={4}
        _hover={{
            borderColor: `${agentColor}60`,
            bg: 'rgba(255, 255, 255, 0.04)',
            transform: 'translateY(-2px)',
        }}
        transition="all 0.2s"
    >
        <HStack spacing={3} align="start">
            <Box
                w="36px" h="36px"
                borderRadius="lg"
                bg={`${agentColor}20`}
                display="flex" alignItems="center" justifyContent="center"
                flexShrink={0}
            >
                <Icon as={cap.icon} color={agentColor} boxSize={4} />
            </Box>
            <VStack align="start" spacing={0}>
                <Text fontWeight="600" color="white" fontSize="sm">
                    {cap.label}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {cap.desc}
                </Text>
            </VStack>
        </HStack>
    </MotionBox>
);

// Scoring Breakdown Chart (Reviewer-specific)
const ScoringBreakdown = ({ breakdown }) => (
    <VStack spacing={3} align="stretch">
        {breakdown.map((item, idx) => (
            <Box key={idx}>
                <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.300" fontWeight="500">{item.label}</Text>
                    <Text fontSize="sm" color={item.color} fontWeight="700">{item.weight}%</Text>
                </Flex>
                <Progress
                    value={item.weight}
                    size="sm"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    sx={{ '& > div': { background: item.color } }}
                />
            </Box>
        ))}
    </VStack>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function AgentDetailPage() {
    const { contentId, agentId } = useParams();
    const navigate = useNavigate();
    const [agentData, setAgentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isOpen: isOutputOpen, onToggle: onOutputToggle } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: isFactsOpen, onToggle: onFactsToggle } = useDisclosure({ defaultIsOpen: false });
    const pollRef = useRef(null);

    const config = AGENT_CONFIGS[agentId];

    const fetchAgentData = useCallback(async () => {
        try {
            const res = await api.get(`/content/${contentId}/agent/${agentId}`);
            setAgentData(res.data);
            return res.data;
        } catch (err) {
            console.error('Error fetching agent data:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [contentId, agentId]);

    useEffect(() => {
        fetchAgentData();

        // Auto-poll every 2s for real-time updates
        pollRef.current = setInterval(async () => {
            const data = await fetchAgentData();
            if (data && data.totalTasks > 0 && data.tasksCompleted >= data.totalTasks) {
                clearInterval(pollRef.current);
            }
        }, 2000);

        return () => clearInterval(pollRef.current);
    }, [fetchAgentData]);

    // Derive overall agent status
    const getAgentStatus = () => {
        if (!agentData || agentData.totalTasks === 0) return 'idle';
        if (agentData.steps?.some(s => s.status === 'error')) return 'error';
        if (agentData.tasksCompleted >= agentData.totalTasks) return 'completed';
        return 'active';
    };

    const agentStatus = getAgentStatus();

    // Match expected steps to live data
    const getStepLiveStatus = (expectedTitle) => {
        if (!agentData?.steps) return { isLive: false };
        const match = agentData.steps.find(s =>
            s.title?.toLowerCase().includes(expectedTitle.toLowerCase().split(' ')[0])
        );
        if (match) {
            return { isLive: true, status: match.status, duration: match.duration };
        }
        return { isLive: false };
    };

    if (!config) {
        return (
            <Box minH="100vh" bg="surface.bg" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Text fontSize="6xl">🤷</Text>
                    <Text color="white" fontSize="xl" fontWeight="600">Agent not found</Text>
                    <Button onClick={() => navigate(`/workspace/${contentId}`)} colorScheme="purple">
                        Back to Workspace
                    </Button>
                </VStack>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box minH="100vh" bg="surface.bg" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <MotionBox
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        fontSize="5xl"
                    >
                        {config.avatar}
                    </MotionBox>
                    <Text color="white" fontWeight="500">Loading {config.name}...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            minH="100vh"
            bg="linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)"
            position="relative"
            overflow="hidden"
        >
            {/* Background pattern */}
            <Box
                position="absolute" top={0} left={0} right={0} bottom={0}
                opacity={0.05}
                backgroundImage={`radial-gradient(circle, ${config.color} 1px, transparent 1px)`}
                backgroundSize="40px 40px"
            />

            {/* Ambient glow */}
            <Box
                position="absolute"
                top="-200px" right="-200px"
                w="600px" h="600px"
                borderRadius="full"
                bg={config.color}
                opacity={0.03}
                filter="blur(100px)"
            />

            <Box position="relative" zIndex={1} py={6} px={{ base: 4, md: 8 }}>
                <VStack spacing={6} maxW="1200px" mx="auto">

                    {/* ── NAVIGATION ── */}
                    <MotionFlex
                        w="full" justify="space-between" align="center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button
                            leftIcon={<FiArrowLeft />}
                            variant="ghost"
                            color="white"
                            onClick={() => navigate(`/workspace/${contentId}`)}
                            _hover={{ bg: 'whiteAlpha.200' }}
                        >
                            Back to Workspace
                        </Button>
                        <HStack spacing={2}>
                            <Badge
                                colorScheme={
                                    agentStatus === 'completed' ? 'green' :
                                        agentStatus === 'error' ? 'red' :
                                            agentStatus === 'active' ? 'purple' : 'gray'
                                }
                                fontSize="sm" px={3} py={1} borderRadius="full"
                            >
                                {agentStatus === 'completed' ? '✓ Completed' :
                                    agentStatus === 'error' ? '✕ Error' :
                                        agentStatus === 'active' ? '● Working' : '○ Idle'}
                            </Badge>
                        </HStack>
                    </MotionFlex>

                    {/* ── HERO SECTION ── */}
                    <MotionBox
                        w="full"
                        bg={config.bgGradient}
                        borderRadius="2xl"
                        border="2px solid"
                        borderColor={`${config.color}60`}
                        p={{ base: 6, md: 10 }}
                        boxShadow={`0 0 60px ${config.color}20`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'start' }} gap={6}>
                            {/* Large avatar */}
                            <MotionBox
                                w="100px" h="100px"
                                borderRadius="2xl"
                                bg={config.color}
                                display="flex" alignItems="center" justifyContent="center"
                                fontSize="4xl"
                                boxShadow={`0 0 30px ${config.color}50`}
                                flexShrink={0}
                                animate={agentStatus === 'active' ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 3, -3, 0],
                                } : {}}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                {config.avatar}
                            </MotionBox>

                            <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex={1}>
                                <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                                    <Text fontSize="sm" color={config.color} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                                        {config.role}
                                    </Text>
                                    <Heading size="xl" color="white">
                                        {config.name}
                                    </Heading>
                                </VStack>
                                <Text color="gray.300" fontSize="md" lineHeight="tall" maxW="700px" textAlign={{ base: 'center', md: 'left' }}>
                                    {config.description}
                                </Text>
                            </VStack>
                        </Flex>
                    </MotionBox>

                    {/* ── STATS GRID ── */}
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} w="full">
                        {[
                            {
                                icon: FiClock,
                                label: 'Processing Time',
                                value: `${agentData?.processingTime || '0'}s`,
                                sub: agentStatus === 'active' ? 'Still running...' : 'Total duration',
                            },
                            {
                                icon: FiTarget,
                                label: 'Tasks Completed',
                                value: `${agentData?.tasksCompleted || '0'}/${agentData?.totalTasks || '0'}`,
                                sub: agentData?.totalTasks > 0 ? `${Math.round((agentData.tasksCompleted / agentData.totalTasks) * 100)}% done` : 'Waiting for data',
                            },
                            {
                                icon: FiBarChart2,
                                label: 'Success Rate',
                                value: `${agentData?.successRate ?? '100'}%`,
                                sub: agentData?.successRate >= 90 ? 'Excellent' : agentData?.successRate >= 70 ? 'Good' : 'Needs attention',
                            },
                        ].map((stat, idx) => (
                            <MotionBox
                                key={stat.label}
                                bg="rgba(255, 255, 255, 0.03)"
                                borderRadius="xl"
                                p={5}
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + idx * 0.08 }}
                                _hover={{ borderColor: `${config.color}40` }}
                            >
                                <HStack spacing={3} mb={2}>
                                    <Icon as={stat.icon} color={config.color} boxSize={5} />
                                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                                        {stat.label}
                                    </Text>
                                </HStack>
                                <Text fontSize="3xl" fontWeight="700" color="white">
                                    {stat.value}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {stat.sub}
                                </Text>
                            </MotionBox>
                        ))}
                    </SimpleGrid>

                    {/* ── CAPABILITIES ── */}
                    <MotionBox
                        w="full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <Heading size="md" color="white" mb={4}>
                            <HStack spacing={2}>
                                <Icon as={FiStar} color={config.color} />
                                <Text>Capabilities</Text>
                            </HStack>
                        </Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                            {config.capabilities.map((cap, idx) => (
                                <CapabilityCard key={idx} cap={cap} index={idx} agentColor={config.color} />
                            ))}
                        </SimpleGrid>
                    </MotionBox>

                    {/* ── REVIEWER-SPECIFIC: Scoring Breakdown ── */}
                    {config.scoringBreakdown && (
                        <MotionBox
                            w="full"
                            bg="rgba(255, 255, 255, 0.03)"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            p={6}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Heading size="md" color="white" mb={5}>
                                <HStack spacing={2}>
                                    <Icon as={FiBarChart2} color={config.color} />
                                    <Text>Scoring Criteria Weights</Text>
                                </HStack>
                            </Heading>
                            <ScoringBreakdown breakdown={config.scoringBreakdown} />
                        </MotionBox>
                    )}

                    {/* ── EXPECTED PROCESS FLOW ── */}
                    <MotionBox
                        w="full"
                        bg="rgba(255, 255, 255, 0.02)"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        p={6}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <Heading size="md" color="white" mb={2}>
                            <HStack spacing={2}>
                                <Icon as={FiActivity} color={config.color} />
                                <Text>Process Flow</Text>
                            </HStack>
                        </Heading>
                        <Text fontSize="sm" color="gray.500" mb={5}>
                            {config.expectedSteps.length} steps in this agent's pipeline
                            {agentData?.steps?.length > 0 && ' • Live data overlay active'}
                        </Text>

                        <VStack spacing={3} align="stretch">
                            {config.expectedSteps.map((step, index) => {
                                const live = getStepLiveStatus(step.title);
                                return (
                                    <ExpectedStep
                                        key={index}
                                        step={step}
                                        index={index}
                                        isLive={live.isLive}
                                        liveStatus={live.status}
                                        liveDuration={live.duration}
                                        agentColor={config.color}
                                    />
                                );
                            })}
                        </VStack>
                    </MotionBox>

                    {/* ── LIVE ACTIVITY LOG ── */}
                    {agentData?.steps?.length > 0 && (
                        <MotionBox
                            w="full"
                            bg="rgba(255, 255, 255, 0.02)"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            p={6}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Heading size="md" color="white" mb={4}>
                                <HStack spacing={2}>
                                    <MotionBox
                                        animate={agentStatus === 'active' ? { opacity: [1, 0.3, 1] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <Box w="8px" h="8px" borderRadius="full" bg={agentStatus === 'active' ? config.color : 'green.400'} />
                                    </MotionBox>
                                    <Text>Live Activity</Text>
                                </HStack>
                            </Heading>
                            <Box
                                bg="rgba(0, 0, 0, 0.3)"
                                borderRadius="lg"
                                p={4}
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                fontFamily="mono"
                                fontSize="sm"
                                maxH="250px"
                                overflowY="auto"
                                css={{
                                    '&::-webkit-scrollbar': { width: '4px' },
                                    '&::-webkit-scrollbar-thumb': { background: config.color, borderRadius: '2px' },
                                }}
                            >
                                <VStack align="stretch" spacing={2}>
                                    {agentData.steps.map((step, idx) => (
                                        <HStack key={idx} spacing={2}>
                                            <Icon
                                                as={step.status === 'completed' ? FiCheckCircle : step.status === 'error' ? FiAlertCircle : FiActivity}
                                                color={step.status === 'completed' ? 'green.400' : step.status === 'error' ? 'red.400' : config.color}
                                                boxSize={3}
                                                flexShrink={0}
                                            />
                                            <Text color="gray.400" flex={1}>
                                                <Text as="span" color="white" fontWeight="500">{step.title}</Text>
                                                {' — '}{step.description}
                                            </Text>
                                            {step.duration && (
                                                <Text color="gray.600" fontSize="xs">{step.duration}</Text>
                                            )}
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        </MotionBox>
                    )}

                    {/* ── OUTPUT ── */}
                    {agentData?.output && (
                        <MotionBox
                            w="full"
                            bg="rgba(255, 255, 255, 0.02)"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            p={6}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <Flex justify="space-between" align="center" mb={4} cursor="pointer" onClick={onOutputToggle}>
                                <Heading size="md" color="white">
                                    <HStack spacing={2}>
                                        <Icon as={FiBox} color={config.color} />
                                        <Text>Output</Text>
                                    </HStack>
                                </Heading>
                                <Text fontSize="sm" color="gray.400">
                                    {isOutputOpen ? '▾ Collapse' : '▸ Expand'}
                                </Text>
                            </Flex>
                            <Collapse in={isOutputOpen} animateOpacity>
                                <Box
                                    bg="rgba(0, 0, 0, 0.3)"
                                    borderRadius="lg"
                                    p={4}
                                    border="1px solid"
                                    borderColor="whiteAlpha.100"
                                    maxH="400px"
                                    overflowY="auto"
                                    css={{
                                        '&::-webkit-scrollbar': { width: '4px' },
                                        '&::-webkit-scrollbar-thumb': { background: config.color, borderRadius: '2px' },
                                    }}
                                >
                                    <Text color="gray.300" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm">
                                        {JSON.stringify(agentData.output, null, 2)}
                                    </Text>
                                </Box>
                            </Collapse>
                        </MotionBox>
                    )}

                    {/* ── FUN FACTS / INSIGHTS ── */}
                    <MotionBox
                        w="full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Flex
                            justify="space-between" align="center"
                            cursor="pointer" onClick={onFactsToggle}
                            mb={3}
                        >
                            <Heading size="sm" color="gray.400">
                                <HStack spacing={2}>
                                    <Text>💡</Text>
                                    <Text>Did you know?</Text>
                                </HStack>
                            </Heading>
                            <Text fontSize="sm" color="gray.600">
                                {isFactsOpen ? '▾' : '▸'}
                            </Text>
                        </Flex>
                        <Collapse in={isFactsOpen} animateOpacity>
                            <VStack spacing={2} align="stretch">
                                {config.funFacts.map((fact, idx) => (
                                    <HStack
                                        key={idx}
                                        bg="rgba(255, 255, 255, 0.02)"
                                        borderRadius="lg"
                                        p={3}
                                        border="1px solid"
                                        borderColor="whiteAlpha.50"
                                        spacing={3}
                                    >
                                        <Text color={config.color} fontSize="lg">•</Text>
                                        <Text color="gray.400" fontSize="sm">{fact}</Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Collapse>
                    </MotionBox>

                    {/* Bottom spacer */}
                    <Box h={8} />
                </VStack>
            </Box>
        </Box>
    );
}

export default AgentDetailPage;
