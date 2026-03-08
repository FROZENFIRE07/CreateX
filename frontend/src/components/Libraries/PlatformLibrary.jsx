/**
 * Platform Content Library
 * Shared library page for all platforms — reads :platform from URL.
 * Each platform has specific tabs (drafts, published, scheduled, etc.)
 * Supports adding/managing content per tab.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Flex, VStack, HStack, Text, Heading, Icon, Button, SimpleGrid,
    Badge, Tabs, TabList, TabPanels, TabPanel, Tab, Textarea,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    ModalFooter, useDisclosure, Input, Select, Divider, IconButton, Tooltip,
    useColorMode,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiClock, FiCheck,
    FiBookOpen, FiMail, FiSend, FiFileText, FiEye, FiExternalLink,
    FiCopy, FiX, FiMonitor, FiSmartphone, FiSun, FiMoon, FiDownload,
} from 'react-icons/fi';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import api from '../../services/api';
import PlatformPreview from '../PlatformPreviews';

const MotionBox = motion(Box);

// Helper to resolve image URLs
const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${API_BASE.replace('/api', '')}${url}`;
};

const T = {
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.35)',
    primaryGlowStrong: 'rgba(255,107,1,0.55)',
    primaryFaint: 'rgba(255,107,1,0.1)',
    white: '#FFFFFF',
    surface: '#353535',
    surfaceLight: '#444444',
    bg: '#1A1A1A',
};

const glass = {
    bg: 'rgba(53,53,53,0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.08)',
    rounded: '2xl',
};

// ─── Platform Configurations ───
const PLATFORM_CONFIG = {
    instagram: {
        name: 'Instagram',
        icon: SiInstagram,
        color: '#E4405F',
        gradient: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
        tabs: [
            { key: 'stored', label: 'All Posts', icon: FiFileText },
            { key: 'drafts', label: 'Pending Review', icon: FiEdit2 },
            { key: 'scheduled', label: 'Scheduled', icon: FiClock },
        ],
    },
    blogs: {
        name: 'Blogs',
        icon: FiBookOpen,
        color: '#22C55E',
        gradient: 'linear-gradient(135deg, #16A34A, #22C55E)',
        tabs: [
            { key: 'drafts', label: 'Article Drafts', icon: FiEdit2 },
            { key: 'published', label: 'Published Blogs', icon: FiCheck },
            { key: 'archived', label: 'Archived Blogs', icon: FiFileText },
        ],
    },
    linkedin: {
        name: 'LinkedIn',
        icon: SiLinkedin,
        color: '#0A66C2',
        gradient: 'linear-gradient(135deg, #0A66C2, #0077B5)',
        tabs: [
            { key: 'drafts', label: 'Post Drafts', icon: FiEdit2 },
            { key: 'published', label: 'Published Posts', icon: FiCheck },
        ],
    },
    email: {
        name: 'Emails',
        icon: FiMail,
        color: '#EF4444',
        gradient: 'linear-gradient(135deg, #DC2626, #F87171)',
        tabs: [
            { key: 'drafts', label: 'Campaign Drafts', icon: FiEdit2 },
            { key: 'sent', label: 'Sent Campaigns', icon: FiSend },
        ],
    },
    twitter: {
        name: 'Twitter (X)',
        icon: FaXTwitter,
        color: '#A0A0A0',
        gradient: 'linear-gradient(135deg, #1A1A2E, #353535)',
        tabs: [
            { key: 'tweets', label: 'All Tweets', icon: FiFileText },
            { key: 'drafts', label: 'Pending Review', icon: FiEdit2 },
        ],
    },
};

// Tab key → API status mapping
// 'stored' and 'tweets' are catch-all tabs (show everything)
const TAB_STATUS_MAP = {
    stored: '*', tweets: '*', threads: '*',
    drafts: 'draft',
    published: 'published', sent: 'published',
    scheduled: 'scheduled',
    archived: 'archived',
};

// ─── Content Card ───
const ContentCard = ({ item, onPreview, onEdit, onDelete }) => (
    <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...glass}
        p={5}
        position="relative"
        overflow="hidden"
        cursor="pointer"
        onClick={() => onPreview(item)}
        role="group"
    >
        <Box position="absolute" top={0} left={0} w="100%" h="2px"
            bg={T.primary} opacity={0.4} />

        <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="700" color={T.white} noOfLines={1}>
                    {item.title || item.sourceTitle || 'Untitled'}
                </Text>
                <HStack spacing={1}>
                    <Tooltip label="Preview" hasArrow>
                        <IconButton size="xs" variant="ghost" color="gray.500" icon={<FiEye size={12} />}
                            _hover={{ color: T.primary }} onClick={(e) => { e.stopPropagation(); onPreview(item); }}
                            aria-label="Preview" />
                    </Tooltip>
                    {item.source === 'library' && (
                        <>
                            <IconButton size="xs" variant="ghost" color="gray.500" icon={<FiEdit2 size={12} />}
                                _hover={{ color: T.white }} onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                aria-label="Edit" />
                            <IconButton size="xs" variant="ghost" color="gray.500" icon={<FiTrash2 size={12} />}
                                _hover={{ color: 'red.400' }} onClick={(e) => { e.stopPropagation(); onDelete(item._id || item.id); }}
                                aria-label="Delete" />
                        </>
                    )}
                    {item.contentId && (
                        <Tooltip label="View full content" hasArrow>
                            <IconButton size="xs" variant="ghost" color="gray.500" icon={<FiExternalLink size={12} />}
                                _hover={{ color: T.primary }}
                                onClick={(e) => { e.stopPropagation(); window.location.href = `/content/${item.contentId}?platform=${item.platform}`; }}
                                aria-label="View source" />
                        </Tooltip>
                    )}
                </HStack>
            </HStack>

            <Text fontSize="xs" color="gray.400" noOfLines={3} lineHeight="1.6">
                {item.content || 'No content yet...'}
            </Text>

            <HStack justify="space-between" pt={1}>
                <HStack spacing={2}>
                    <Text fontSize="2xs" color="gray.600" fontFamily="mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </Text>
                    {item.consistencyScore > 0 && (
                        <Badge bg="rgba(255,107,1,0.1)" color={T.primary} rounded="full" px={1.5} fontSize="2xs">
                            {item.consistencyScore}%
                        </Badge>
                    )}
                </HStack>
                <Badge
                    bg={item.status === 'published' || item.status === 'approved' ? 'rgba(34,197,94,0.15)' :
                        item.status === 'scheduled' ? 'rgba(59,130,246,0.15)' :
                            'rgba(255,255,255,0.05)'}
                    color={item.status === 'published' || item.status === 'approved' ? '#22C55E' :
                        item.status === 'scheduled' ? '#3B82F6' : 'gray.400'}
                    rounded="full" px={2} fontSize="2xs" textTransform="capitalize"
                >
                    {item.status || 'draft'}
                </Badge>
            </HStack>
        </VStack>
    </MotionBox>
);

// ─── Empty State ───
const EmptyState = ({ tabLabel, onAdd }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        {...glass}
        py={16} px={8}
        textAlign="center"
    >
        <VStack spacing={4}>
            <Box fontSize="4xl" opacity={0.5}>📄</Box>
            <Heading size="sm" color="gray.400">No {tabLabel} Yet</Heading>
            <Text fontSize="sm" color="gray.600" maxW="300px">
                Start creating content for this platform. Click the button below to add your first item.
            </Text>
            <Button
                leftIcon={<FiPlus />}
                bg={T.primary} color={T.white}
                rounded="full" px={6} size="sm"
                boxShadow={`0 0 15px ${T.primaryGlow}`}
                _hover={{ bg: T.primaryHover, transform: 'translateY(-1px)' }}
                onClick={onAdd}
            >
                Create New
            </Button>
        </VStack>
    </MotionBox>
);

// ─── Main Component ───
export default function PlatformLibrary() {
    const { platform } = useParams();
    const navigate = useNavigate();
    const config = PLATFORM_CONFIG[platform];
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode } = useColorMode();
    const dark = colorMode === 'dark';
    const [libraryData, setLibraryData] = useState({});
    const [editItem, setEditItem] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formStatus, setFormStatus] = useState('draft');
    const [activeTabKey, setActiveTabKey] = useState('');
    const [previewItem, setPreviewItem] = useState(null);
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [loading, setLoading] = useState(true);

    const fetchLibrary = useCallback(async () => {
        if (!config) return;
        setLoading(true);
        try {
            const apiPlatform = platform === 'blogs' ? 'blog' : platform;

            // Fetch both in parallel for speed
            const [variantsRes, libraryRes] = await Promise.allSettled([
                api.get(`/content/variants/${platform}`),
                api.get(`/library/${apiPlatform}?limit=200`),
            ]);

            const variants = variantsRes.status === 'fulfilled'
                ? (variantsRes.value.data.items || []).map((v, i) => ({ ...v, _uid: v.variantId || `v-${i}` }))
                : [];
            const libraryItems = libraryRes.status === 'fulfilled'
                ? (libraryRes.value.data.items || []).map(li => ({ ...li, _uid: li._id, source: 'library' }))
                : [];

            const allItems = [...variants, ...libraryItems];

            const grouped = {};
            for (const tab of config.tabs) {
                const status = TAB_STATUS_MAP[tab.key] || tab.key;
                grouped[tab.key] = allItems.filter(it => {
                    if (status === '*') return true; // catch-all tab
                    const itemStatus = it.status || 'pending';
                    if (status === 'draft') return ['draft', 'pending', 'flagged', 'approved'].includes(itemStatus);
                    if (status === 'published') return ['published', 'approved', 'sent'].includes(itemStatus);
                    return itemStatus === status;
                });
            }
            setLibraryData(grouped);
        } catch {
            setLibraryData({});
        } finally {
            setLoading(false);
        }
    }, [platform, config]);

    useEffect(() => {
        if (config) {
            setActiveTabKey(config.tabs[0]?.key || '');
            fetchLibrary();
        }
    }, [platform, config, fetchLibrary]);

    if (!config) {
        return (
            <Box minH="100vh" bg={T.bg} color={T.white} display="flex"
                alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Text fontSize="6xl">🔍</Text>
                    <Heading size="md" color="gray.400">Platform Not Found</Heading>
                    <Button onClick={() => navigate('/')} variant="ghost" color={T.primary}>
                        Back to Dashboard
                    </Button>
                </VStack>
            </Box>
        );
    }

    const getTabItems = (tabKey) => {
        const items = libraryData[tabKey] || [];
        return Array.isArray(items) ? items : [];
    };

    const handleAdd = (tabKey) => {
        setEditItem(null);
        setFormTitle('');
        setFormContent('');
        setFormStatus(tabKey === 'published' || tabKey === 'sent' ? 'published' : 'draft');
        setActiveTabKey(tabKey);
        onOpen();
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setFormTitle(item.title || '');
        setFormContent(item.content || '');
        setFormStatus(item.status || 'draft');
        onOpen();
    };

    const handleSave = async () => {
        const status = TAB_STATUS_MAP[activeTabKey] || formStatus;
        try {
            if (editItem) {
                await api.put(`/library/${editItem._id || editItem.id}`, {
                    title: formTitle, content: formContent, status,
                });
            } else {
                await api.post('/library', {
                    platform, title: formTitle, content: formContent, status,
                });
            }
            await fetchLibrary();
        } catch { /* silent */ }
        onClose();
    };

    const handleDelete = async (tabKey, id) => {
        try {
            await api.delete(`/library/${id}`);
            await fetchLibrary();
        } catch { /* silent */ }
    };

    return (
        <Box minH="100vh" bg={dark ? T.bg : '#F7F7F8'} color={dark ? T.white : '#1A1A1A'} position="relative" overflow="hidden">
            {/* Ambient glow */}
            <Box position="fixed" top="-15%" left="-10%" w="55vw" h="55vw"
                bg={config.color} filter="blur(200px)" opacity={dark ? 0.05 : 0.03} pointerEvents="none" />

            <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, xl: 8 }} pb={20} position="relative" zIndex={1}>

                {/* ── Header ── */}
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    mb={8}
                >
                    <HStack spacing={4} mb={6}>
                        <Button
                            variant="ghost" color="gray.400"
                            _hover={{ color: T.white, bg: 'whiteAlpha.100' }}
                            onClick={() => navigate('/')}
                            leftIcon={<FiArrowLeft />}
                            size="sm"
                        >
                            Dashboard
                        </Button>
                    </HStack>

                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <HStack spacing={4}>
                            <Flex
                                w="56px" h="56px" rounded="xl"
                                bg={config.gradient} align="center" justify="center"
                                boxShadow={`0 4px 20px ${config.color}30`}
                            >
                                <Icon as={config.icon} boxSize={6} color={T.white} />
                            </Flex>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" color={dark ? T.white : '#1A1A1A'} letterSpacing="tight">
                                    {config.name} Library
                                </Heading>
                                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                    {Object.values(libraryData).flat().length} total items
                                </Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </MotionBox>

                {/* ── Tabs ── */}
                <Tabs
                    variant="unstyled"
                    onChange={(index) => setActiveTabKey(config.tabs[index]?.key || '')}
                >
                    <TabList
                        bg="rgba(53,53,53,0.3)"
                        rounded="xl" p={1}
                        border="1px solid" borderColor="rgba(255,255,255,0.06)"
                        mb={6}
                        overflowX="auto"
                    >
                        {config.tabs.map((tab) => (
                            <Tab
                                key={tab.key}
                                rounded="lg" px={4} py={2}
                                fontSize="sm" fontWeight="600"
                                color="gray.500"
                                _selected={{
                                    bg: T.primary,
                                    color: T.white,
                                    boxShadow: `0 0 15px ${T.primaryGlow}`,
                                }}
                                _hover={{ color: T.white }}
                                transition="all 0.2s"
                                whiteSpace="nowrap"
                            >
                                <HStack spacing={2}>
                                    <Icon as={tab.icon} boxSize={3.5} />
                                    <Text>{tab.label}</Text>
                                    <Badge
                                        bg="rgba(255,255,255,0.1)" color="gray.400"
                                        rounded="full" fontSize="2xs" px={1.5}
                                    >
                                        {getTabItems(tab.key).length}
                                    </Badge>
                                </HStack>
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {config.tabs.map((tab) => {
                            const items = getTabItems(tab.key);
                            return (
                                <TabPanel key={tab.key} px={0}>
                                    {/* Add button */}
                                    <HStack justify="flex-end" mb={4}>
                                        <Button
                                            leftIcon={<FiPlus />}
                                            bg={T.primary} color={T.white}
                                            rounded="full" px={6} size="sm"
                                            boxShadow={`0 0 15px ${T.primaryGlow}`}
                                            _hover={{ bg: T.primaryHover, transform: 'translateY(-1px)' }}
                                            onClick={() => handleAdd(tab.key)}
                                        >
                                            Add {tab.label.split(' ').pop()}
                                        </Button>
                                    </HStack>

                                    {loading ? (
                                        <VStack py={12} spacing={3}>
                                            <Box className="spinner" w={8} h={8} border="3px solid" borderColor="gray.700"
                                                borderTopColor={T.primary} rounded="full"
                                                animation="spin 0.8s linear infinite" />
                                            <Text fontSize="sm" color="gray.500">Loading content...</Text>
                                        </VStack>
                                    ) : items.length === 0 ? (
                                        <EmptyState tabLabel={tab.label} onAdd={() => handleAdd(tab.key)} />
                                    ) : (
                                        <AnimatePresence>
                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                {items.map((item, idx) => (
                                                    <ContentCard
                                                        key={item._uid || item._id || `item-${idx}`}
                                                        item={item}
                                                        onPreview={(it) => setPreviewItem(it)}
                                                        onEdit={(it) => { setActiveTabKey(tab.key); handleEdit(it); }}
                                                        onDelete={(id) => handleDelete(tab.key, id)}
                                                    />
                                                ))}
                                            </SimpleGrid>
                                        </AnimatePresence>
                                    )}
                                </TabPanel>
                            );
                        })}
                    </TabPanels>
                </Tabs>
            </Box>

            {/* ── Add/Edit Modal ── */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
                <ModalContent bg={T.surface} border="1px solid" borderColor="rgba(255,255,255,0.1)" rounded="2xl">
                    <ModalHeader color={T.white} fontSize="md">
                        {editItem ? 'Edit Content' : 'New Content'}
                    </ModalHeader>
                    <ModalCloseButton color="gray.500" />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box w="100%">
                                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="600">Title</Text>
                                <Input
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Content title..."
                                    bg="rgba(26,26,26,0.6)"
                                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                                    rounded="xl" color={T.white} fontSize="sm"
                                    _placeholder={{ color: 'gray.600' }}
                                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                                />
                            </Box>
                            <Box w="100%">
                                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="600">Content</Text>
                                <Textarea
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Write your content here..."
                                    bg="rgba(26,26,26,0.6)"
                                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                                    rounded="xl" color={T.white} fontSize="sm"
                                    minH="150px" resize="vertical"
                                    _placeholder={{ color: 'gray.600' }}
                                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                                />
                            </Box>
                            <Box w="100%">
                                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="600">Status</Text>
                                <Select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                    bg="rgba(26,26,26,0.6)"
                                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                                    rounded="xl" color={T.white} fontSize="sm"
                                >
                                    <option value="draft" style={{ background: T.surface }}>Draft</option>
                                    <option value="published" style={{ background: T.surface }}>Published</option>
                                    <option value="scheduled" style={{ background: T.surface }}>Scheduled</option>
                                    <option value="archived" style={{ background: T.surface }}>Archived</option>
                                </Select>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" color="gray.400" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            bg={T.primary} color={T.white}
                            rounded="full" px={6}
                            boxShadow={`0 0 15px ${T.primaryGlow}`}
                            _hover={{ bg: T.primaryHover }}
                            onClick={handleSave}
                            isDisabled={!formTitle.trim()}
                        >
                            {editItem ? 'Save Changes' : 'Create'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Preview Modal with Platform Preview ── */}
            <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} isCentered size="2xl" scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(12px)" />
                <ModalContent bg={dark ? T.surface : '#FFFFFF'} border="1px solid" borderColor={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} rounded="2xl" maxH="85vh">
                    <ModalHeader pb={2}>
                        <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                                <Text fontSize="lg" fontWeight="700" color={dark ? T.white : '#1A1A1A'} noOfLines={2}>
                                    {previewItem?.title || previewItem?.sourceTitle || 'Untitled'}
                                </Text>
                                <HStack spacing={1}>
                                    {/* Device toggle */}
                                    <Tooltip label="Desktop" hasArrow>
                                        <IconButton
                                            icon={<FiMonitor size={14} />} size="xs"
                                            variant={previewDevice === 'desktop' ? 'solid' : 'ghost'}
                                            colorScheme={previewDevice === 'desktop' ? 'orange' : 'gray'}
                                            onClick={() => setPreviewDevice('desktop')}
                                            aria-label="Desktop"
                                        />
                                    </Tooltip>
                                    <Tooltip label="Mobile" hasArrow>
                                        <IconButton
                                            icon={<FiSmartphone size={14} />} size="xs"
                                            variant={previewDevice === 'mobile' ? 'solid' : 'ghost'}
                                            colorScheme={previewDevice === 'mobile' ? 'orange' : 'gray'}
                                            onClick={() => setPreviewDevice('mobile')}
                                            aria-label="Mobile"
                                        />
                                    </Tooltip>
                                    <IconButton
                                        icon={<FiX />} size="sm" variant="ghost" color="gray.400"
                                        _hover={{ color: dark ? T.white : '#1A1A1A' }}
                                        onClick={() => setPreviewItem(null)}
                                        aria-label="Close" />
                                </HStack>
                            </HStack>
                            <HStack spacing={2} flexWrap="wrap">
                                <Badge bg={`${config?.color}20`} color={config?.color} rounded="full" px={2} fontSize="2xs">
                                    {config?.name}
                                </Badge>
                                <Badge
                                    bg={previewItem?.status === 'published' || previewItem?.status === 'approved'
                                        ? 'rgba(34,197,94,0.15)' : dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                                    color={previewItem?.status === 'published' || previewItem?.status === 'approved'
                                        ? '#22C55E' : 'gray.400'}
                                    rounded="full" px={2} fontSize="2xs" textTransform="capitalize"
                                >
                                    {previewItem?.status || 'pending'}
                                </Badge>
                                {previewItem?.consistencyScore > 0 && (
                                    <Badge bg="rgba(255,107,1,0.1)" color={T.primary} rounded="full" px={2} fontSize="2xs">
                                        Score: {previewItem.consistencyScore}%
                                    </Badge>
                                )}
                            </HStack>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton display="none" />
                    <Divider borderColor={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <ModalBody py={5}>
                        {/* Platform Preview */}
                        <Box
                            maxW={previewDevice === 'mobile' ? '320px' : '100%'}
                            mx="auto"
                            bg={previewDevice === 'mobile' ? '#1a1a1a' : 'transparent'}
                            borderRadius={previewDevice === 'mobile' ? '3xl' : 'none'}
                            p={previewDevice === 'mobile' ? '3px' : 0}
                            boxShadow={previewDevice === 'mobile' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'}
                        >
                            <Box
                                borderRadius={previewDevice === 'mobile' ? '2xl' : 'xl'}
                                overflow="hidden"
                                position="relative"
                            >
                                {previewDevice === 'mobile' && (
                                    <Box
                                        position="absolute" top={0} left="50%" transform="translateX(-50%)"
                                        w="120px" h="25px" bg="#1a1a1a" borderBottomRadius="xl" zIndex={10}
                                    />
                                )}
                                <Box pt={previewDevice === 'mobile' ? '30px' : 0} pb={previewDevice === 'mobile' ? 4 : 0}>
                                    <PlatformPreview
                                        platform={platform === 'blogs' ? 'blog' : platform}
                                        content={previewItem?.content || ''}
                                        image={resolveImageUrl(previewItem?.image?.url)}
                                        score={previewItem?.consistencyScore}
                                        title={previewItem?.title || previewItem?.sourceTitle}
                                        authorName="Your Brand"
                                    />
                                </Box>
                                {previewDevice === 'mobile' && (
                                    <Box
                                        position="absolute" bottom="8px" left="50%" transform="translateX(-50%)"
                                        w="100px" h="4px" bg="gray.300" borderRadius="full"
                                    />
                                )}
                            </Box>
                        </Box>
                    </ModalBody>
                    <Divider borderColor={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <ModalFooter>
                        <HStack spacing={2}>
                            <Button
                                size="sm" variant="ghost" color={dark ? 'gray.400' : 'gray.600'} leftIcon={<FiCopy size={14} />}
                                _hover={{ color: dark ? T.white : '#1A1A1A', bg: dark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
                                onClick={() => { navigator.clipboard.writeText(previewItem?.content || ''); }}
                            >
                                Copy
                            </Button>
                            <Button
                                size="sm" variant="ghost" color={dark ? 'gray.400' : 'gray.600'} leftIcon={<FiDownload size={14} />}
                                _hover={{ color: dark ? T.white : '#1A1A1A', bg: dark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
                                onClick={() => {
                                    const blob = new Blob([previewItem?.content || ''], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${previewItem?.title || 'content'}_${platform}.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Download
                            </Button>
                            {previewItem?.contentId && (
                                <Button
                                    size="sm" bg={T.primary} color={T.white} leftIcon={<FiExternalLink size={14} />}
                                    rounded="full"
                                    _hover={{ bg: T.primaryHover }}
                                    onClick={() => navigate(`/content/${previewItem.contentId}?platform=${previewItem.platform}`)}
                                >
                                    View Full Content
                                </Button>
                            )}
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
