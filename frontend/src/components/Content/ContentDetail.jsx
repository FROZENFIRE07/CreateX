/**
 * Content Detail Component - Redesigned
 * Modern content viewer with animated KPIs and platform previews
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Badge,
    SimpleGrid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Icon,
    Spinner,
    Center,
    IconButton,
    Tooltip,
    Textarea,
    useColorMode,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
    FiArrowLeft,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiZap,
    FiPercent,
    FiTrendingUp,
    FiActivity,
    FiSun,
    FiMoon,
    FiSmartphone,
    FiMonitor,
    FiTwitter,
    FiLinkedin,
    FiMail,
    FiInstagram,
    FiFileText,
    FiCopy,
    FiDownload,
    FiEdit3,
    FiSave,
    FiX,
} from 'react-icons/fi';
import api from '../../services/api';
import PlatformPreview from '../PlatformPreviews';
import ManagerPanel from '../ManagerPanel/ManagerPanel';
import { showToast } from '../common';

const MotionBox = motion(Box);

const POLL_INTERVAL = 3000;

// Platform icons mapping
const platformConfig = {
    twitter: { icon: FiTwitter, color: '#1DA1F2', label: 'Twitter/X' },
    linkedin: { icon: FiLinkedin, color: '#0A66C2', label: 'LinkedIn' },
    email: { icon: FiMail, color: '#EA4335', label: 'Email' },
    instagram: { icon: FiInstagram, color: '#E4405F', label: 'Instagram' },
    blog: { icon: FiFileText, color: '#10B981', label: 'Blog' },
};

// Helper to convert relative image URLs to absolute backend URLs
const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${url}`;
};

// KPI Card Component
const KPICard = ({ icon: IconComponent, label, value, unit, color, delay }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        bg="surface.card"
        borderRadius="xl"
        border="1px solid"
        borderColor="surface.border"
        p={5}
        position="relative"
        overflow="hidden"
    >
        <Box
            position="absolute"
            top={-4}
            right={-4}
            w={24}
            h={24}
            bg={`${color}15`}
            borderRadius="full"
            filter="blur(20px)"
        />
        <HStack spacing={4}>
            <Box
                bg={`${color}20`}
                borderRadius="lg"
                p={3}
            >
                <Icon as={IconComponent} color={color} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="500">
                    {label}
                </Text>
                <HStack spacing={1} align="baseline">
                    <Text fontSize="2xl" fontWeight="700" color="white">
                        <CountUp end={value || 0} duration={1.5} decimals={0} />
                    </Text>
                    {unit && <Text fontSize="sm" color="gray.500">{unit}</Text>}
                </HStack>
            </VStack>
        </HStack>
    </MotionBox>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
    const badges = {
        pending: { colorScheme: 'blue', icon: FiClock, label: 'Pending' },
        processing: { colorScheme: 'purple', icon: FiActivity, label: 'Processing' },
        completed: { colorScheme: 'green', icon: FiCheckCircle, label: 'Completed' },
        failed: { colorScheme: 'red', icon: FiAlertCircle, label: 'Failed' },
        approved: { colorScheme: 'green', icon: FiCheckCircle, label: 'Approved' },
        flagged: { colorScheme: 'orange', icon: FiAlertCircle, label: 'Flagged' },
    };

    const config = badges[status] || { colorScheme: 'gray', label: status };

    return (
        <Badge
            colorScheme={config.colorScheme}
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
        >
            {config.icon && <Icon as={config.icon} boxSize={3} />}
            {config.label}
        </Badge>
    );
};

// Device Frame Component
const DeviceFrame = ({ children, mode }) => {
    if (mode === 'mobile') {
        return (
            <Box
                bg="#1a1a1a"
                borderRadius="3xl"
                p="3px"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                maxW="320px"
                mx="auto"
            >
                <Box
                    position="relative"
                    borderRadius="2xl"
                    overflow="hidden"
                    bg="white"
                >
                    {/* Notch */}
                    <Box
                        position="absolute"
                        top={0}
                        left="50%"
                        transform="translateX(-50%)"
                        w="120px"
                        h="25px"
                        bg="#1a1a1a"
                        borderBottomRadius="xl"
                        zIndex={10}
                    />
                    {/* Content */}
                    <Box pt="30px" pb={4}>
                        {children}
                    </Box>
                    {/* Home Indicator */}
                    <Box
                        position="absolute"
                        bottom="8px"
                        left="50%"
                        transform="translateX(-50%)"
                        w="100px"
                        h="4px"
                        bg="gray.300"
                        borderRadius="full"
                    />
                </Box>
            </Box>
        );
    }

    // Desktop mode - no frame
    return <Box maxW="500px" mx="auto">{children}</Box>;
};

function ContentDetail() {
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deviceMode, setDeviceMode] = useState('desktop');
    const [previewTheme, setPreviewTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState(0);
    const [editingVariant, setEditingVariant] = useState(null); // Platform ID being edited
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        fetchContent();
    }, [id]);

    useEffect(() => {
        if (status?.status === 'processing') {
            const interval = setInterval(fetchStatus, POLL_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [status?.status]);

    const fetchContent = async () => {
        try {
            const res = await api.get(`/content/${id}`);
            setContent(res.data.content);
            setStatus({
                status: res.data.content.orchestrationStatus,
                log: res.data.content.orchestrationLog || [],
                kpis: res.data.content.kpis,
                variants: res.data.content.variants
            });
        } catch (err) {
            setError('Content not found');
            showToast.error('Content not found');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await api.get(`/content/${id}/status`);
            setStatus(res.data);
            if (res.data.status === 'completed' || res.data.status === 'failed') {
                fetchContent();
            }
        } catch (err) {
            console.error('Status poll error:', err);
        }
    };

    // Inline editing handlers
    const startEditing = (variant) => {
        setEditingVariant(variant.platform);
        setEditContent(variant.content);
    };

    const cancelEditing = () => {
        setEditingVariant(null);
        setEditContent('');
    };

    const saveEdit = async (variant) => {
        try {
            // Update variant content via API (or local state for now)
            const updatedVariants = status.variants.map(v =>
                v.platform === variant.platform
                    ? { ...v, content: editContent }
                    : v
            );
            setStatus(prev => ({ ...prev, variants: updatedVariants }));
            setEditingVariant(null);
            setEditContent('');
            showToast.success('Variant updated!');
        } catch (err) {
            showToast.error('Failed to save changes');
        }
    };

    if (loading) {
        return (
            <Center h="50vh">
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" thickness="3px" />
                    <Text color="gray.400">Loading content...</Text>
                </VStack>
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="50vh">
                <VStack spacing={4}>
                    <Icon as={FiAlertCircle} boxSize={12} color="error.400" />
                    <Heading size="md" color="white">Content Not Found</Heading>
                    <Text color="gray.400">{error}</Text>
                    <Link to="/">
                        <Button leftIcon={<FiArrowLeft />} colorScheme="purple">
                            Back to Dashboard
                        </Button>
                    </Link>
                </VStack>
            </Center>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/">
                    <Button variant="ghost" leftIcon={<FiArrowLeft />} color="gray.400" size="sm" mb={2}>
                        Back to Dashboard
                    </Button>
                </Link>
                <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" color="white">{content.title}</Heading>
                        <Text color="gray.500" mt={1}>
                            Created {new Date(content.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    </Box>
                    <StatusBadge status={status?.status} />
                </Flex>
            </MotionBox>

            {/* KPIs */}
            {status?.kpis && (
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <KPICard
                        icon={FiTrendingUp}
                        label="Hit Rate"
                        value={status.kpis.hitRate}
                        unit="%"
                        color="#10B981"
                        delay={0.1}
                    />
                    <KPICard
                        icon={FiClock}
                        label="Processing Time"
                        value={status.kpis.processingTime}
                        unit="s"
                        color="#6366f1"
                        delay={0.2}
                    />
                    <KPICard
                        icon={FiPercent}
                        label="Consistency"
                        value={status.kpis.avgConsistencyScore}
                        unit="%"
                        color="#F59E0B"
                        delay={0.3}
                    />
                    <KPICard
                        icon={FiZap}
                        label="Automation"
                        value={status.kpis.automationRate}
                        unit="%"
                        color="#EC4899"
                        delay={0.4}
                    />
                </SimpleGrid>
            )}

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                {/* Main Content Area */}
                <Box gridColumn={{ lg: 'span 2' }}>
                    <VStack spacing={6} align="stretch">
                        {/* Original Content */}
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            bg="surface.card"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="surface.border"
                            overflow="hidden"
                        >
                            <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="surface.border">
                                <Heading size="sm" color="white">Original Content</Heading>
                                <Badge colorScheme="blue">{content.type}</Badge>
                            </HStack>
                            <Box
                                p={4}
                                bg="surface.bg"
                                whiteSpace="pre-wrap"
                                maxH="200px"
                                overflowY="auto"
                                fontSize="sm"
                                color="gray.300"
                                lineHeight="1.7"
                            >
                                {content.data}
                            </Box>
                        </MotionBox>

                        {/* Generated Variants */}
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            bg="surface.card"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="surface.border"
                            overflow="hidden"
                        >
                            <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="surface.border">
                                <HStack spacing={3}>
                                    <Heading size="sm" color="white">Generated Variants</Heading>
                                    <Badge colorScheme="purple">{status?.variants?.length || 0} platforms</Badge>
                                </HStack>

                                {/* Device Mode Toggle */}
                                <HStack spacing={2}>
                                    <Tooltip label="Desktop view">
                                        <IconButton
                                            size="sm"
                                            variant={deviceMode === 'desktop' ? 'solid' : 'ghost'}
                                            colorScheme={deviceMode === 'desktop' ? 'purple' : 'gray'}
                                            icon={<FiMonitor />}
                                            onClick={() => setDeviceMode('desktop')}
                                            aria-label="Desktop view"
                                        />
                                    </Tooltip>
                                    <Tooltip label="Mobile view">
                                        <IconButton
                                            size="sm"
                                            variant={deviceMode === 'mobile' ? 'solid' : 'ghost'}
                                            colorScheme={deviceMode === 'mobile' ? 'purple' : 'gray'}
                                            icon={<FiSmartphone />}
                                            onClick={() => setDeviceMode('mobile')}
                                            aria-label="Mobile view"
                                        />
                                    </Tooltip>
                                    <Box w="1px" h={6} bg="surface.border" />
                                    <Tooltip label={previewTheme === 'dark' ? 'Light mode' : 'Dark mode'}>
                                        <IconButton
                                            size="sm"
                                            variant="ghost"
                                            icon={previewTheme === 'dark' ? <FiSun /> : <FiMoon />}
                                            onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                                            aria-label="Toggle theme"
                                        />
                                    </Tooltip>
                                </HStack>
                            </HStack>

                            {status?.status === 'processing' ? (
                                <Center py={12}>
                                    <VStack spacing={4}>
                                        <Spinner size="lg" color="brand.500" />
                                        <Text color="gray.400">Generating variants...</Text>
                                        <Text color="gray.600" fontSize="sm">
                                            AI agents are transforming your content for each platform
                                        </Text>
                                    </VStack>
                                </Center>
                            ) : status?.variants?.length > 0 ? (
                                <Box>
                                    <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="purple" p={4}>
                                        <TabList flexWrap="wrap" gap={2}>
                                            {status.variants.map((variant, idx) => {
                                                const config = platformConfig[variant.platform] || { icon: FiFileText, color: '#9CA3AF', label: variant.platform };
                                                return (
                                                    <Tab
                                                        key={idx}
                                                        _selected={{ bg: 'brand.500', color: 'white' }}
                                                        color="gray.400"
                                                        fontSize="sm"
                                                    >
                                                        <Icon as={config.icon} mr={2} />
                                                        {config.label}
                                                    </Tab>
                                                );
                                            })}
                                        </TabList>

                                        <TabPanels mt={4}>
                                            {status.variants.map((variant, idx) => (
                                                <TabPanel key={idx} p={0}>
                                                    <AnimatePresence mode="wait">
                                                        <MotionBox
                                                            key={`${idx}-${deviceMode}`}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                            py={4}
                                                        >
                                                            <DeviceFrame mode={deviceMode}>
                                                                <PlatformPreview
                                                                    platform={variant.platform}
                                                                    content={variant.content}
                                                                    image={resolveImageUrl(variant.image?.url)}
                                                                    score={variant.consistencyScore}
                                                                    title={content?.title}
                                                                    authorName="Your Brand"
                                                                />
                                                            </DeviceFrame>

                                                            {/* Consistency Score */}
                                                            <Flex justify="center" mt={4} flexWrap="wrap" gap={3}>
                                                                <HStack
                                                                    bg={variant.consistencyScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}
                                                                    border="1px solid"
                                                                    borderColor={variant.consistencyScore >= 80 ? 'success.500' : 'warning.500'}
                                                                    borderRadius="full"
                                                                    px={4}
                                                                    py={2}
                                                                >
                                                                    <Icon
                                                                        as={variant.consistencyScore >= 80 ? FiCheckCircle : FiAlertCircle}
                                                                        color={variant.consistencyScore >= 80 ? 'success.400' : 'warning.400'}
                                                                    />
                                                                    <Text color={variant.consistencyScore >= 80 ? 'success.400' : 'warning.400'} fontWeight="500">
                                                                        {variant.consistencyScore}% Consistency
                                                                    </Text>
                                                                </HStack>

                                                                {/* Edit/Copy/Export Buttons */}
                                                                <HStack spacing={2}>
                                                                    {editingVariant === variant.platform ? (
                                                                        <>
                                                                            <Tooltip label="Save changes">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    colorScheme="green"
                                                                                    icon={<FiSave />}
                                                                                    onClick={() => saveEdit(variant)}
                                                                                    aria-label="Save changes"
                                                                                />
                                                                            </Tooltip>
                                                                            <Tooltip label="Cancel edit">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    borderColor="surface.border"
                                                                                    color="gray.400"
                                                                                    icon={<FiX />}
                                                                                    onClick={cancelEditing}
                                                                                    aria-label="Cancel edit"
                                                                                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                                                                                />
                                                                            </Tooltip>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Tooltip label="Edit content">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    borderColor="surface.border"
                                                                                    color="gray.400"
                                                                                    icon={<FiEdit3 />}
                                                                                    onClick={() => startEditing(variant)}
                                                                                    aria-label="Edit content"
                                                                                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                                                                                />
                                                                            </Tooltip>
                                                                            <Tooltip label="Copy to clipboard">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    borderColor="surface.border"
                                                                                    color="gray.400"
                                                                                    icon={<FiCopy />}
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(variant.content);
                                                                                        showToast.success('Copied to clipboard!');
                                                                                    }}
                                                                                    aria-label="Copy content"
                                                                                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                                                                                />
                                                                            </Tooltip>
                                                                            <Tooltip label="Download as text">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    borderColor="surface.border"
                                                                                    color="gray.400"
                                                                                    icon={<FiDownload />}
                                                                                    onClick={() => {
                                                                                        const blob = new Blob([variant.content], { type: 'text/plain' });
                                                                                        const url = URL.createObjectURL(blob);
                                                                                        const a = document.createElement('a');
                                                                                        a.href = url;
                                                                                        a.download = `${content?.title || 'content'}_${variant.platform}.txt`;
                                                                                        a.click();
                                                                                        URL.revokeObjectURL(url);
                                                                                        showToast.success('Downloaded!');
                                                                                    }}
                                                                                    aria-label="Download content"
                                                                                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                                                                                />
                                                                            </Tooltip>
                                                                        </>
                                                                    )}
                                                                </HStack>
                                                            </Flex>

                                                            {/* Inline Edit Textarea */}
                                                            {editingVariant === variant.platform && (
                                                                <Box mt={4}>
                                                                    <Textarea
                                                                        value={editContent}
                                                                        onChange={(e) => setEditContent(e.target.value)}
                                                                        bg="surface.bg"
                                                                        border="1px solid"
                                                                        borderColor="brand.500"
                                                                        color="white"
                                                                        minH="150px"
                                                                        resize="vertical"
                                                                        _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
                                                                        placeholder="Edit your content..."
                                                                    />
                                                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                                                        {editContent.length} characters
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                        </MotionBox>
                                                    </AnimatePresence>
                                                </TabPanel>
                                            ))}
                                        </TabPanels>
                                    </Tabs>
                                </Box>
                            ) : (
                                <Center py={12}>
                                    <VStack spacing={2}>
                                        <Icon as={FiFileText} boxSize={8} color="gray.600" />
                                        <Text color="gray.500">No variants generated yet</Text>
                                    </VStack>
                                </Center>
                            )}
                        </MotionBox>
                    </VStack>
                </Box>

                {/* Sidebar - Manager Panel */}
                <Box>
                    <ManagerPanel
                        contentId={id}
                        onVariantsUpdated={fetchContent}
                    />
                </Box>
            </SimpleGrid>
        </VStack>
    );
}

export default ContentDetail;
