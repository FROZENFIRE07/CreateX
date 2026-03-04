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
    ModalFooter, useDisclosure, Input, Select,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiClock, FiCheck,
    FiBookOpen, FiMail, FiSend, FiFileText,
} from 'react-icons/fi';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';

const MotionBox = motion(Box);

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
            { key: 'stored', label: 'Stored Posts', icon: FiFileText },
            { key: 'drafts', label: 'Draft Posts', icon: FiEdit2 },
            { key: 'scheduled', label: 'Scheduled Posts', icon: FiClock },
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
            { key: 'tweets', label: 'Tweets', icon: FiFileText },
            { key: 'threads', label: 'Threads', icon: FiFileText },
            { key: 'drafts', label: 'Drafts', icon: FiEdit2 },
        ],
    },
};

const STORAGE_PREFIX = 'saco_library_';

function getLibraryData(platform) {
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${platform}`);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveLibraryData(platform, data) {
    localStorage.setItem(`${STORAGE_PREFIX}${platform}`, JSON.stringify(data));
}

// ─── Content Card ───
const ContentCard = ({ item, onEdit, onDelete }) => (
    <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...glass}
        p={5}
        position="relative"
        overflow="hidden"
    >
        <Box position="absolute" top={0} left={0} w="100%" h="2px"
            bg={T.primary} opacity={0.4} />

        <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="700" color={T.white} noOfLines={1}>
                    {item.title || 'Untitled'}
                </Text>
                <HStack spacing={1}>
                    <Button size="xs" variant="ghost" color="gray.500"
                        _hover={{ color: T.white }} onClick={() => onEdit(item)}>
                        <FiEdit2 size={12} />
                    </Button>
                    <Button size="xs" variant="ghost" color="gray.500"
                        _hover={{ color: 'red.400' }} onClick={() => onDelete(item.id)}>
                        <FiTrash2 size={12} />
                    </Button>
                </HStack>
            </HStack>

            <Text fontSize="xs" color="gray.400" noOfLines={3} lineHeight="1.6">
                {item.content || 'No content yet...'}
            </Text>

            <HStack justify="space-between" pt={1}>
                <Text fontSize="2xs" color="gray.600" fontFamily="mono">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
                <Badge
                    bg={item.status === 'published' ? 'rgba(34,197,94,0.15)' :
                        item.status === 'scheduled' ? 'rgba(59,130,246,0.15)' :
                            'rgba(255,255,255,0.05)'}
                    color={item.status === 'published' ? '#22C55E' :
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
    const [libraryData, setLibraryData] = useState({});
    const [editItem, setEditItem] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formStatus, setFormStatus] = useState('draft');
    const [activeTabKey, setActiveTabKey] = useState('');

    useEffect(() => {
        if (config) {
            setLibraryData(getLibraryData(platform));
            setActiveTabKey(config.tabs[0]?.key || '');
        }
    }, [platform, config]);

    const refreshData = useCallback(() => {
        setLibraryData(getLibraryData(platform));
    }, [platform]);

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

    const handleSave = () => {
        const data = { ...libraryData };
        const tabKey = activeTabKey;
        if (!data[tabKey]) data[tabKey] = [];

        if (editItem) {
            data[tabKey] = data[tabKey].map((item) =>
                item.id === editItem.id
                    ? { ...item, title: formTitle, content: formContent, status: formStatus, updatedAt: new Date().toISOString() }
                    : item
            );
        } else {
            data[tabKey].push({
                id: Date.now().toString(),
                title: formTitle,
                content: formContent,
                status: formStatus,
                createdAt: new Date().toISOString(),
            });
        }

        saveLibraryData(platform, data);
        refreshData();
        onClose();
    };

    const handleDelete = (tabKey, id) => {
        const data = { ...libraryData };
        if (data[tabKey]) {
            data[tabKey] = data[tabKey].filter((item) => item.id !== id);
            saveLibraryData(platform, data);
            refreshData();
        }
    };

    return (
        <Box minH="100vh" bg={T.bg} color={T.white} position="relative" overflow="hidden">
            {/* Ambient glow */}
            <Box position="fixed" top="-15%" left="-10%" w="55vw" h="55vw"
                bg={config.color} filter="blur(200px)" opacity={0.05} pointerEvents="none" />

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
                                <Heading size="lg" color={T.white} letterSpacing="tight">
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

                                    {items.length === 0 ? (
                                        <EmptyState tabLabel={tab.label} onAdd={() => handleAdd(tab.key)} />
                                    ) : (
                                        <AnimatePresence>
                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                {items.map((item) => (
                                                    <ContentCard
                                                        key={item.id}
                                                        item={item}
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
        </Box>
    );
}
