/**
 * Content Upload Component - Redesigned
 * Modern drag-drop upload with animated orchestration pipeline
 * Theme: Dark glassmorphism with orange accents (matches dashboard)
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
    Divider,
    Switch,
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
    FiEdit3,
    FiActivity,
} from 'react-icons/fi';
import api from '../../services/api';
import { showToast } from '../common';
import PreviewGrid from './PreviewGrid';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// ── Theme constants (matches dashboard) ──
const T = {
    primary: '#FF6B01', primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.25)', primaryGlowStrong: 'rgba(255,107,1,0.45)',
    primaryFaint: 'rgba(255,107,1,0.08)',
    bg: '#1A1A1A', bgDeep: '#111111',
    surface: '#353535', surfaceLight: '#444444',
    white: '#FFFFFF',
};

const glass = {
    bg: 'rgba(53,53,53,0.55)', backdropFilter: 'blur(24px)',
    border: '1px solid', borderColor: 'rgba(255,255,255,0.08)',
};
const glassCard = {
    ...glass, p: 6, rounded: '2xl', position: 'relative', overflow: 'hidden',
};

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
        bg={selected ? T.primaryFaint : T.surface}
        border="2px solid"
        borderColor={selected ? T.primary : 'rgba(255,255,255,0.08)'}
        borderRadius="xl"
        p={4}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.6 : 1}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        textAlign="left"
        w="full"
        boxShadow={selected ? `0 0 15px ${T.primaryGlow}` : 'none'}
    >
        <HStack spacing={3}>
            <Box
                bg={selected ? platform.color : 'gray.700'}
                borderRadius="lg"
                p={2}
                transition="all 0.2s"
                boxShadow={selected ? `0 0 12px ${platform.color}40` : 'none'}
            >
                <Icon as={platform.icon} color="white" boxSize={5} />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="600" fontSize="sm" color={T.white}>{platform.name}</Text>
                <Text fontSize="xs" color="gray.500">{platform.desc}</Text>
            </VStack>
            {selected && (
                <Icon as={FiCheckCircle} color={T.primary} boxSize={5} />
            )}
        </HStack>
    </MotionBox>
);

// Pipeline Step Component
const PipelineStep = ({ step, status, isLast }) => {
    const getColor = () => {
        if (status === 'completed') return '#4ADE80';
        if (status === 'active') return T.primary;
        if (status === 'error') return '#F87171';
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
                animate={status === 'active' ? { scale: [1, 1.15, 1], boxShadow: [`0 0 0px ${T.primaryGlow}`, `0 0 20px ${T.primaryGlow}`, `0 0 0px ${T.primaryGlow}`] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <Icon as={step.icon} color={status === 'completed' || status === 'active' ? 'white' : getColor()} boxSize={4} />
            </MotionBox>
            {!isLast && (
                <Box
                    flex={1}
                    h="2px"
                    bg={status === 'completed' ? '#4ADE80' : 'rgba(255,255,255,0.08)'}
                    borderRadius="full"
                    boxShadow={status === 'completed' ? '0 0 8px rgba(74,222,128,0.3)' : 'none'}
                />
            )}
        </HStack>
    );
};

// Log Message Component
const LogMessage = ({ message, index }) => {
    const getColor = (msg) => {
        if (msg.includes('✓') || msg.includes('✅') || msg.includes('done') || msg.includes('Complete')) return '#4ADE80';
        if (msg.includes('⚠') || msg.includes('Warning')) return 'yellow.400';
        if (msg.includes('Error') || msg.includes('fail')) return '#F87171';
        return T.primary;
    };
    return (
        <MotionBox
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: index * 0.05 }}
            py={2}
            borderBottom="1px solid"
            borderColor="rgba(255,255,255,0.04)"
            _last={{ border: 'none' }}
            fontFamily="mono"
        >
            <HStack spacing={2}>
                <Text as="span" color="gray.600" fontSize="xs">[{String(index + 1).padStart(2, '0')}]</Text>
                <Text fontSize="sm" color={getColor(message)} lineHeight="1.6">
                    {message}
                </Text>
            </HStack>
        </MotionBox>
    );
};

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
    const [uploadMode, setUploadMode] = useState('auto'); // 'auto' or 'manual'

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

    // Publish a single variant to its platform library in localStorage
    const publishToLibrary = (variant) => {
        const platformId = variant.platform?.toLowerCase();
        if (!platformId) return;
        const storageKey = `createx_library_${platformId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const tabKeys = Object.keys(existing);
        const targetTab = tabKeys.find((k) => k.toLowerCase().includes('draft')) || tabKeys[0] || 'Drafts';
        const items = existing[targetTab] || [];
        items.push({
            id: Date.now().toString() + '_' + platformId,
            title: title || 'Generated Content',
            content: variant.content,
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            consistencyScore: variant.consistencyScore,
        });
        existing[targetTab] = items;
        localStorage.setItem(storageKey, JSON.stringify(existing));
    };

    // Publish ALL variants at once (used by Auto mode)
    const publishAllToLibraries = (generatedVariants) => {
        generatedVariants.forEach(publishToLibrary);
        showToast.celebrate(`Published to ${generatedVariants.length} platform(s)! 🎉`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation (same for both modes)
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
        setStatus(null);
        setVariants([]);
        setKpis(null);
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

            // In Auto mode, redirect to workflow page (auto-publish handled on completion)
            // In Manual mode, stay on this page to show preview cards
            if (uploadMode === 'auto') {
                navigate(`/workflow/${newContentId}`);
            } else {
                setOrchestrating(true);
            }

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
                    colors={['#FF6B01', '#E85F00', '#fb923c', '#4ADE80', '#fbbf24']}
                />
            )}
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <HStack spacing={3}>
                        <Icon as={FiUploadCloud} color={T.primary} boxSize={6} />
                        <Heading size="lg" color={T.white}>Upload Content</Heading>
                    </HStack>
                    <Text color="gray.400" mt={1}>Transform your content for multiple platforms</Text>
                </MotionBox>

                {/* Progress Pipeline */}
                {(orchestrating || status === 'completed' || status === 'failed') && (
                    <MotionBox
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        {...glassCard}
                        rounded="3xl"
                    >
                        <Box position="absolute" top={0} left={0} w="100%" h="2px" bg={T.primary} opacity={0.6} />
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

                <SimpleGrid columns={1} spacing={6}>
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
                                bg={isDragActive ? T.primaryFaint : T.surface}
                                border="2px dashed"
                                borderColor={isDragActive ? T.primary : 'rgba(255,255,255,0.1)'}
                                borderRadius="2xl"
                                p={8}
                                textAlign="center"
                                cursor={orchestrating ? 'not-allowed' : 'pointer'}
                                transition="all 0.3s"
                                _hover={!orchestrating ? { borderColor: T.primary, bg: T.primaryFaint, boxShadow: `0 0 30px ${T.primaryGlow}` } : {}}
                                boxShadow={isDragActive ? `0 0 40px ${T.primaryGlow}` : 'none'}
                            >
                                <input {...getInputProps()} />
                                <MotionBox
                                    animate={isDragActive ? { y: [0, -8, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    <Icon as={FiUploadCloud} boxSize={12} color={isDragActive ? T.primary : 'gray.500'} mb={4} />
                                </MotionBox>
                                <Text fontWeight="600" color={T.white} mb={1}>
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
                            {...glassCard}
                            rounded="3xl"
                        >
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={5} align="stretch">
                                    {/* Title */}
                                    <Box>
                                        <Text fontSize="2xs" fontWeight="800" color="gray.500" mb={2} letterSpacing="wider" textTransform="uppercase">Content Title</Text>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Product Launch Announcement"
                                            required
                                            maxLength={200}
                                            disabled={orchestrating}
                                            bg="blackAlpha.400"
                                            border="1px solid"
                                            borderColor="rgba(255,255,255,0.08)"
                                            rounded="xl"
                                            color={T.white}
                                            _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                                            _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                                        />
                                    </Box>

                                    {/* Content */}
                                    <Box>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="2xs" fontWeight="800" color="gray.500" letterSpacing="wider" textTransform="uppercase">Original Content</Text>
                                            <Text fontSize="xs" color="gray.600">{content.length} characters</Text>
                                        </HStack>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste your article, blog post, or any text content here..."
                                            required
                                            minH="180px"
                                            disabled={orchestrating}
                                            bg="blackAlpha.400"
                                            border="1px solid"
                                            borderColor="rgba(255,255,255,0.08)"
                                            rounded="2xl"
                                            p={5}
                                            color={T.white}
                                            fontSize="sm"
                                            lineHeight="1.8"
                                            resize="vertical"
                                            _placeholder={{ color: 'gray.600' }}
                                            _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                                            _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                                        />
                                    </Box>

                                    {/* Platforms */}
                                    <Box>
                                        <Text fontSize="2xs" fontWeight="800" color="gray.500" mb={3} letterSpacing="wider" textTransform="uppercase">Target Platforms</Text>
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

                                    {/* Manual / Auto Toggle */}
                                    <HStack
                                        bg={T.surface}
                                        rounded="full" px={4} py={2}
                                        border="1px solid" borderColor="rgba(255,255,255,0.08)"
                                        spacing={3}
                                        justify="center"
                                    >
                                        <Text fontSize="sm" fontWeight={uploadMode === 'manual' ? '700' : '400'}
                                            color={uploadMode === 'manual' ? T.primary : 'gray.500'}>
                                            Manual
                                        </Text>
                                        <Switch
                                            colorScheme="orange"
                                            isChecked={uploadMode === 'auto'}
                                            onChange={() => setUploadMode(uploadMode === 'auto' ? 'manual' : 'auto')}
                                            size="md"
                                            isDisabled={orchestrating || status === 'completed'}
                                        />
                                        <Text fontSize="sm" fontWeight={uploadMode === 'auto' ? '700' : '400'}
                                            color={uploadMode === 'auto' ? T.primary : 'gray.500'}>
                                            Auto-Publish
                                        </Text>
                                    </HStack>

                                    {/* Mode hint */}
                                    <Box bg={T.primaryFaint} rounded="xl" p={3} border="1px solid" borderColor={`${T.primary}30`}>
                                        <HStack spacing={2}>
                                            <Icon as={FiZap} color={T.primary} boxSize={4} />
                                            <Text fontSize="xs" color="gray.400">
                                                {uploadMode === 'auto'
                                                    ? 'Auto-Publish: AI generates and automatically publishes content to all selected platforms.'
                                                    : 'Manual: AI generates content, then you review and choose which platforms to publish.'}
                                            </Text>
                                        </HStack>
                                    </Box>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        bg={T.primary}
                                        color={T.white}
                                        isLoading={loading || orchestrating}
                                        loadingText={loading ? 'Creating...' : 'Generating...'}
                                        rightIcon={<FiArrowRight />}
                                        rounded="full"
                                        fontWeight="700"
                                        isDisabled={status === 'completed'}
                                        boxShadow={`0 0 20px ${T.primaryGlow}`}
                                        _hover={{ bg: T.primaryHover, transform: 'translateY(-2px)', boxShadow: `0 0 35px ${T.primaryGlowStrong}` }}
                                        _active={{ transform: 'translateY(0)' }}
                                    >
                                        {uploadMode === 'auto' ? '🚀 Generate & Publish' : '✨ Generate Content'}
                                    </Button>
                                </VStack>
                            </form>
                        </MotionBox>
                    </VStack>
                </SimpleGrid>

                {/* Manual Mode: show PreviewGrid with publish toggles after generation */}
                {uploadMode === 'manual' && status === 'completed' && variants.length > 0 && (
                    <PreviewGrid
                        variants={variants}
                        onUpdateVariant={(platform, newContent) => {
                            setVariants(prev => prev.map(v =>
                                v.platform === platform ? { ...v, content: newContent } : v
                            ));
                        }}
                        onPublish={(variant) => {
                            publishToLibrary(variant);
                            showToast.success(`Published to ${variant.platform} library!`);
                        }}
                    />
                )}
            </VStack>
        </>
    );
}

export default ContentUpload;
