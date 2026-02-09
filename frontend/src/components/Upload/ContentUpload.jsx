/**
 * Content Upload Component - Redesigned
 * Modern drag-drop upload with animated orchestration pipeline
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    Textarea,
    Button,
    Badge,
    SimpleGrid,
    Progress,
    Icon,
    Tooltip,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Confetti from 'react-confetti';
import {
    FiUploadCloud,
    FiFile,
    FiCheck,
    FiX,
    FiZap,
    FiLayers,
    FiCpu,
    FiCheckCircle,
    FiAlertCircle,
    FiArrowRight,
    FiTwitter,
    FiLinkedin,
    FiMail,
    FiInstagram,
    FiFileText,
} from 'react-icons/fi';
import api from '../../services/api';
import { showToast } from '../common';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Platform configuration with icons
const PLATFORMS = [
    { id: 'twitter', name: 'Twitter/X', icon: FiTwitter, color: '#1DA1F2', desc: '280 char tweets' },
    { id: 'linkedin', name: 'LinkedIn', icon: FiLinkedin, color: '#0A66C2', desc: 'Professional posts' },
    { id: 'email', name: 'Email', icon: FiMail, color: '#EA4335', desc: 'Newsletter format' },
    { id: 'instagram', name: 'Instagram', icon: FiInstagram, color: '#E4405F', desc: 'Caption style' },
    { id: 'blog', name: 'Blog', icon: FiFileText, color: '#10B981', desc: 'Full article' },
];

// Pipeline steps for visualization
const PIPELINE_STEPS = [
    { id: 'init', label: 'Initialize', icon: FiZap },
    { id: 'analyze', label: 'Analyze', icon: FiCpu },
    { id: 'generate', label: 'Generate', icon: FiLayers },
    { id: 'review', label: 'Review', icon: FiCheck },
    { id: 'complete', label: 'Complete', icon: FiCheckCircle },
];

// Platform Card Component
const PlatformCard = ({ platform, selected, onToggle, disabled }) => (
    <MotionBox
        as="button"
        type="button"
        onClick={() => !disabled && onToggle(platform.id)}
        disabled={disabled}
        bg={selected ? 'rgba(99, 102, 241, 0.15)' : 'surface.card'}
        border="2px solid"
        borderColor={selected ? 'brand.500' : 'surface.border'}
        borderRadius="xl"
        p={4}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.6 : 1}
        whileHover={!disabled ? { scale: 1.02, borderColor: 'brand.400' } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        textAlign="left"
        w="full"
    >
        <HStack spacing={3}>
            <Box
                bg={selected ? platform.color : 'gray.700'}
                borderRadius="lg"
                p={2}
                transition="all 0.2s"
            >
                <Icon as={platform.icon} color="white" boxSize={5} />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="600" fontSize="sm" color="white">{platform.name}</Text>
                <Text fontSize="xs" color="gray.500">{platform.desc}</Text>
            </VStack>
            {selected && (
                <Icon as={FiCheck} color="brand.400" boxSize={5} />
            )}
        </HStack>
    </MotionBox>
);

// Pipeline Step Component
const PipelineStep = ({ step, status, isLast }) => {
    const getColor = () => {
        if (status === 'completed') return 'success.500';
        if (status === 'active') return 'brand.500';
        if (status === 'error') return 'error.500';
        return 'gray.600';
    };

    return (
        <HStack spacing={3} flex={1}>
            <MotionBox
                bg={status === 'completed' || status === 'active' ? getColor() : 'transparent'}
                border="2px solid"
                borderColor={getColor()}
                borderRadius="full"
                p={2}
                animate={status === 'active' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <Icon as={step.icon} color={status === 'completed' || status === 'active' ? 'white' : getColor()} boxSize={4} />
            </MotionBox>
            {!isLast && (
                <Box
                    flex={1}
                    h="2px"
                    bg={status === 'completed' ? 'success.500' : 'gray.700'}
                    borderRadius="full"
                />
            )}
        </HStack>
    );
};

// Log Message Component
const LogMessage = ({ message, index }) => (
    <MotionBox
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        py={2}
        borderBottom="1px solid"
        borderColor="surface.border"
        _last={{ border: 'none' }}
    >
        <Text fontSize="sm" color="gray.300" lineHeight="1.6">
            {message}
        </Text>
    </MotionBox>
);

function ContentUpload() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin', 'email']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orchestrating, setOrchestrating] = useState(false);
    const [contentId, setContentId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [variants, setVariants] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const logsEndRef = useRef(null);
    const navigate = useNavigate();
    const isMobile = useBreakpointValue({ base: true, md: false });

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setContent(e.target.result);
                if (!title) {
                    setTitle(file.name.replace(/\.[^/.]+$/, ''));
                }
                showToast.success(`File "${file.name}" loaded successfully`);
            };
            reader.readAsText(file);
        }
    }, [title]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
        disabled: orchestrating,
    });

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // SSE for real-time log streaming
    useEffect(() => {
        if (!orchestrating || !contentId) return;

        const token = localStorage.getItem('saco_token');
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const baseUrl = API_BASE_URL.replace('/api', '');

        const eventSource = new EventSource(
            `${baseUrl}/api/content/${contentId}/stream?token=${token}`
        );

        const getPhaseFromMessage = (message) => {
            if (message.includes('Starting orchestration') || message.includes('workspace memory')) {
                setCurrentStep(1);
                return { text: 'Analyzing your content and gathering context...' };
            }
            if (message.includes('Execution plan ready')) {
                setCurrentStep(2);
                return { text: 'Created execution plan - ready to transform content.' };
            }
            if (message.includes('Content analysis complete')) {
                return { text: 'Content analysis complete. Extracted key themes.' };
            }
            if (message.includes('Generating') && message.includes('variant')) {
                setCurrentStep(3);
                const platform = message.match(/(TWITTER|LINKEDIN|EMAIL|INSTAGRAM)/i)?.[0];
                return { text: `Generating ${platform ? platform.toLowerCase() : 'platform'} variant...` };
            }
            if (message.includes('Review PASSED')) {
                setCurrentStep(4);
                return { text: 'Content passes brand consistency checks.' };
            }
            if (message.includes('published successfully')) {
                const platform = message.match(/(TWITTER|LINKEDIN|EMAIL)/i)?.[0];
                return { text: `✓ ${platform} variant ready` };
            }
            return null;
        };

        let lastMessage = '';

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'log') {
                    const phaseInfo = getPhaseFromMessage(data.message);
                    if (phaseInfo && phaseInfo.text !== lastMessage) {
                        lastMessage = phaseInfo.text;
                        setLogs(prev => [...prev, { message: phaseInfo.text }]);
                    }
                } else if (data.type === 'complete') {
                    setCurrentStep(5);
                    setLogs(prev => [...prev, { message: '🎉 All done! Content transformed successfully.' }]);
                    setStatus('completed');
                    setOrchestrating(false);
                    setKpis(data.kpis);
                    setVariants(data.variants || []);
                    setShowConfetti(true);
                    showToast.celebrate('Content orchestration complete! 🎉');
                    // Auto-hide confetti after 5 seconds
                    setTimeout(() => setShowConfetti(false), 5000);
                    eventSource.close();
                } else if (data.type === 'error') {
                    setStatus('failed');
                    setOrchestrating(false);
                    setError(data.error);
                    showToast.error(data.error);
                    eventSource.close();
                }
            } catch (err) {
                console.error('[SSE] Parse error:', err);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();
    }, [orchestrating, contentId]);

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedPlatforms.length === 0) {
            setError('Select at least one target platform');
            showToast.warning('Please select at least one platform');
            return;
        }

        if (content.length < 50) {
            setError('Content must be at least 50 characters');
            showToast.warning('Content is too short (min 50 characters)');
            return;
        }

        setLoading(true);
        setError('');
        setCurrentStep(0);
        setLogs([{ message: 'Initializing orchestration pipeline...' }]);

        try {
            const createRes = await api.post('/content', {
                title,
                data: content,
                type: 'text'
            });

            const newContentId = createRes.data.content.id;
            setContentId(newContentId);

            await api.post(`/content/${newContentId}/orchestrate`, {
                platforms: selectedPlatforms
            });

            setLoading(false);
            setOrchestrating(true);
            setStatus('processing');
            setCurrentStep(1);

        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
            showToast.error(err.response?.data?.error || 'Upload failed');
            setLoading(false);
        }
    };

    const getPipelineStepStatus = (stepIndex) => {
        if (status === 'failed') return stepIndex === currentStep ? 'error' : stepIndex < currentStep ? 'completed' : 'pending';
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep && (orchestrating || status === 'completed')) return 'active';
        if (status === 'completed' && stepIndex <= 4) return 'completed';
        return 'pending';
    };

    return (
        <>
            {/* Confetti celebration effect */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.3}
                    colors={['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#14b8a6']}
                />
            )}
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Heading size="lg" color="white">Upload Content</Heading>
                    <Text color="gray.400" mt={1}>Transform your content for multiple platforms with AI</Text>
                </MotionBox>

                {/* Progress Pipeline */}
                {(orchestrating || status === 'completed' || status === 'failed') && (
                    <MotionBox
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        bg="surface.card"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="surface.border"
                        p={6}
                    >
                        <HStack spacing={0} justify="space-between">
                            {PIPELINE_STEPS.map((step, idx) => (
                                <PipelineStep
                                    key={step.id}
                                    step={step}
                                    status={getPipelineStepStatus(idx)}
                                    isLast={idx === PIPELINE_STEPS.length - 1}
                                />
                            ))}
                        </HStack>
                        <HStack justify="space-between" mt={3}>
                            {PIPELINE_STEPS.map((step) => (
                                <Text key={step.id} fontSize="xs" color="gray.500" flex={1} textAlign="center">
                                    {step.label}
                                </Text>
                            ))}
                        </HStack>
                    </MotionBox>
                )}

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {/* Left - Form */}
                    <VStack spacing={6} align="stretch">
                        {/* Drag & Drop Zone */}
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Box
                                {...getRootProps()}
                                bg={isDragActive ? 'rgba(99, 102, 241, 0.1)' : 'surface.card'}
                                border="2px dashed"
                                borderColor={isDragActive ? 'brand.500' : 'surface.border'}
                                borderRadius="xl"
                                p={8}
                                textAlign="center"
                                cursor={orchestrating ? 'not-allowed' : 'pointer'}
                                transition="all 0.2s"
                                _hover={!orchestrating ? { borderColor: 'brand.400', bg: 'rgba(99, 102, 241, 0.05)' } : {}}
                            >
                                <input {...getInputProps()} />
                                <Icon as={FiUploadCloud} boxSize={12} color={isDragActive ? 'brand.400' : 'gray.500'} mb={4} />
                                <Text fontWeight="600" color="white" mb={1}>
                                    {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    or click to browse • .txt, .md, .json supported
                                </Text>
                            </Box>
                        </MotionBox>

                        {/* Form Card */}
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            bg="surface.card"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="surface.border"
                            p={6}
                        >
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={5} align="stretch">
                                    {/* Title */}
                                    <Box>
                                        <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Content Title</Text>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Product Launch Announcement"
                                            required
                                            maxLength={200}
                                            disabled={orchestrating}
                                            bg="surface.bg"
                                            border="1px solid"
                                            borderColor="surface.border"
                                            _hover={{ borderColor: 'surface.borderHover' }}
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                                        />
                                    </Box>

                                    {/* Content */}
                                    <Box>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm">Original Content</Text>
                                            <Text fontSize="xs" color="gray.500">{content.length} characters</Text>
                                        </HStack>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste your article, blog post, or any text content here..."
                                            required
                                            minH="150px"
                                            disabled={orchestrating}
                                            bg="surface.bg"
                                            border="1px solid"
                                            borderColor="surface.border"
                                            _hover={{ borderColor: 'surface.borderHover' }}
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                                        />
                                    </Box>

                                    {/* Platforms */}
                                    <Box>
                                        <Text fontWeight="500" color="gray.300" fontSize="sm" mb={3}>Target Platforms</Text>
                                        <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                                            {PLATFORMS.map(platform => (
                                                <PlatformCard
                                                    key={platform.id}
                                                    platform={platform}
                                                    selected={selectedPlatforms.includes(platform.id)}
                                                    onToggle={togglePlatform}
                                                    disabled={orchestrating}
                                                />
                                            ))}
                                        </SimpleGrid>
                                    </Box>

                                    {/* Error */}
                                    {error && (
                                        <HStack bg="rgba(239, 68, 68, 0.1)" p={3} borderRadius="lg" border="1px solid" borderColor="error.500">
                                            <Icon as={FiAlertCircle} color="error.400" />
                                            <Text color="error.400" fontSize="sm">{error}</Text>
                                        </HStack>
                                    )}

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        bg="brand.500"
                                        color="white"
                                        isLoading={loading || orchestrating}
                                        loadingText={loading ? 'Creating...' : 'Orchestrating...'}
                                        rightIcon={<FiArrowRight />}
                                        _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'glow' }}
                                        _active={{ transform: 'translateY(0)' }}
                                    >
                                        🚀 Start Orchestration
                                    </Button>
                                </VStack>
                            </form>
                        </MotionBox>
                    </VStack>

                    {/* Right - Logs & Results */}
                    <VStack spacing={6} align="stretch">
                        {/* Workflow Log */}
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            bg="surface.card"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="surface.border"
                            overflow="hidden"
                            position="sticky"
                            top="80px"
                        >
                            <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="surface.border">
                                <Heading size="sm" color="white">Workflow Log</Heading>
                                {orchestrating && status !== 'completed' && (
                                    <Badge colorScheme="purple" variant="subtle">
                                        Processing...
                                    </Badge>
                                )}
                                {status === 'completed' && (
                                    <Badge colorScheme="green">Complete</Badge>
                                )}
                            </HStack>

                            <Box maxH="300px" overflowY="auto" p={4}>
                                {logs.length === 0 ? (
                                    <Text color="gray.500" textAlign="center" py={8}>
                                        Logs will appear here when you start orchestration
                                    </Text>
                                ) : (
                                    <VStack align="stretch" spacing={0}>
                                        {logs.map((log, idx) => (
                                            <LogMessage key={idx} message={log.message} index={idx} />
                                        ))}
                                        <div ref={logsEndRef} />
                                    </VStack>
                                )}
                            </Box>

                            {/* KPIs */}
                            {kpis && (
                                <SimpleGrid columns={3} gap={4} p={4} borderTop="1px solid" borderColor="surface.border" bg="surface.bg">
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="700" color="success.400">{kpis.hitRate}%</Text>
                                        <Text fontSize="xs" color="gray.500">Hit Rate</Text>
                                    </VStack>
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="700" color="white">{kpis.publishedCount}</Text>
                                        <Text fontSize="xs" color="gray.500">Published</Text>
                                    </VStack>
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="700" color="white">{kpis.processingTime}s</Text>
                                        <Text fontSize="xs" color="gray.500">Time</Text>
                                    </VStack>
                                </SimpleGrid>
                            )}
                        </MotionBox>

                        {/* Generated Variants Preview */}
                        {status === 'completed' && variants.length > 0 && (
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                bg="surface.card"
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="surface.border"
                                overflow="hidden"
                            >
                                <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="surface.border">
                                    <Heading size="sm" color="white">Generated Variants</Heading>
                                    <Button
                                        size="sm"
                                        bg="brand.500"
                                        color="white"
                                        rightIcon={<FiArrowRight />}
                                        onClick={() => navigate(`/content/${contentId}`)}
                                        _hover={{ bg: 'brand.600' }}
                                    >
                                        View All
                                    </Button>
                                </HStack>

                                <VStack p={4} spacing={3} align="stretch">
                                    {variants.slice(0, 2).map((variant, idx) => {
                                        const platform = PLATFORMS.find(p => p.id === variant.platform);
                                        return (
                                            <Box
                                                key={idx}
                                                bg="surface.bg"
                                                borderRadius="lg"
                                                p={4}
                                                border="1px solid"
                                                borderColor="surface.border"
                                            >
                                                <HStack mb={2}>
                                                    <Icon as={platform?.icon || FiFileText} color={platform?.color} />
                                                    <Text fontWeight="600" color="white" textTransform="capitalize">
                                                        {variant.platform}
                                                    </Text>
                                                    <Badge colorScheme="green" ml="auto">{variant.consistencyScore}%</Badge>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.400" noOfLines={2}>
                                                    {variant.content}
                                                </Text>
                                            </Box>
                                        );
                                    })}
                                    {variants.length > 2 && (
                                        <Text color="gray.500" fontSize="sm" textAlign="center">
                                            +{variants.length - 2} more variants
                                        </Text>
                                    )}
                                </VStack>
                            </MotionBox>
                        )}
                    </VStack>
                </SimpleGrid>
            </VStack>
        </>
    );
}

export default ContentUpload;

