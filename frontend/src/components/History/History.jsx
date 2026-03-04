/**
 * History Page — Past user activities
 * Shows all content uploads, orchestrations, and their statuses
 * Theme: Dark glassmorphism with orange accents (matches dashboard)
 * Features: Real-time search bar with animated filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Flex, VStack, HStack, Text, Heading, Badge, Icon, Spinner,
    SimpleGrid, Tooltip, Avatar, Input, InputGroup, InputLeftElement, InputRightElement,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock, FiCheckCircle, FiAlertCircle, FiZap, FiArrowRight,
    FiTwitter, FiLinkedin, FiMail, FiInstagram, FiFileText, FiActivity,
    FiTrash2, FiRefreshCw, FiSearch, FiX,
} from 'react-icons/fi';
import api from '../../services/api';

const MotionBox = motion(Box);

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

const PLATFORM_ICONS = {
    twitter: FiTwitter, linkedin: FiLinkedin, email: FiMail, instagram: FiInstagram,
};
const PLATFORM_COLORS = {
    twitter: '#1DA1F2', linkedin: '#0A66C2', email: '#EA4335', instagram: '#E4405F',
};

const AGENT_NAMES = ['manager', 'ingest', 'generator', 'reviewer', 'publisher'];

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function getStatusStyle(status) {
    switch (status) {
        case 'completed': return { bg: 'rgba(74,222,128,0.12)', color: '#4ADE80', label: '✓ Completed', border: '#4ADE80' };
        case 'processing': return { bg: T.primaryFaint, color: T.primary, label: '⚡ Processing', border: T.primary };
        case 'failed': return { bg: 'rgba(248,113,113,0.12)', color: '#F87171', label: '✗ Failed', border: '#F87171' };
        default: return { bg: 'rgba(255,255,255,0.05)', color: 'gray.400', label: '○ Draft', border: 'gray.600' };
    }
}

// ── Item animation variants ──
const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 12 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.25 } },
};

export default function History() {
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/content');
            setContents(res.data.contents || res.data || []);
        } catch (err) {
            console.error('Failed to load history', err);
            // Use demo data if API fails
            setContents([
                {
                    _id: 'demo1', title: 'Product Launch Announcement', status: 'completed',
                    platforms: ['twitter', 'linkedin', 'email'], createdAt: new Date(Date.now() - 3600000).toISOString(),
                    variants: [{ platform: 'twitter' }, { platform: 'linkedin' }],
                    metadata: { keywords: ['product', 'launch', 'announcement'] },
                },
                {
                    _id: 'demo2', title: 'Weekly Newsletter Draft', status: 'completed',
                    platforms: ['email'], createdAt: new Date(Date.now() - 86400000).toISOString(),
                    variants: [{ platform: 'email' }],
                    metadata: { keywords: ['newsletter', 'weekly', 'update'] },
                },
                {
                    _id: 'demo3', title: 'Social Media Campaign', status: 'processing',
                    platforms: ['twitter', 'instagram'], createdAt: new Date(Date.now() - 7200000).toISOString(),
                    variants: [],
                    metadata: { keywords: ['social', 'campaign', 'instagram'] },
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ── Real-time search filtering ──
    const filteredContents = useMemo(() => {
        if (!searchQuery.trim()) return contents;

        const q = searchQuery.toLowerCase().trim();
        return contents.filter((item) => {
            // Match title
            if (item.title?.toLowerCase().includes(q)) return true;
            // Match platform names
            if ((item.platforms || []).some(p => p.toLowerCase().includes(q))) return true;
            if ((item.variants || []).some(v => v.platform?.toLowerCase().includes(q))) return true;
            // Match keywords (from metadata)
            if ((item.metadata?.keywords || []).some(k => k.toLowerCase().includes(q))) return true;
            if ((item.metadata?.themes || []).some(t => t.toLowerCase().includes(q))) return true;
            // Match agent names
            if (AGENT_NAMES.some(a => a.includes(q))) return true;
            // Match status
            if (item.status?.toLowerCase().includes(q)) return true;
            if (item.orchestrationStatus?.toLowerCase().includes(q)) return true;
            return false;
        });
    }, [contents, searchQuery]);

    const displayCount = searchQuery.trim() ? filteredContents.length : contents.length;

    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                    <HStack spacing={3}>
                        <Icon as={FiClock} color={T.primary} boxSize={6} />
                        <Heading size="lg" color={T.white}>Activity History</Heading>
                        <Badge bg={T.primaryFaint} color={T.primary} rounded="full" px={3} fontSize="xs" border="1px solid" borderColor={T.primary}>
                            {displayCount} {searchQuery.trim() ? `of ${contents.length}` : ''} items
                        </Badge>
                    </HStack>
                    <Tooltip label="Refresh" hasArrow>
                        <Box
                            as="button" onClick={fetchHistory}
                            p={2} rounded="xl" bg="whiteAlpha.50" color="gray.400"
                            _hover={{ bg: 'whiteAlpha.100', color: T.white }}
                            transition="all 0.2s"
                        >
                            <Icon as={FiRefreshCw} boxSize={4} />
                        </Box>
                    </Tooltip>
                </HStack>
                <Text color="gray.500" mt={1}>Your past content uploads, orchestrations, and generated outputs</Text>
            </MotionBox>

            {/* ── Search Bar ── */}
            <MotionBox
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={FiSearch} color={searchQuery ? T.primary : 'gray.500'} boxSize={5} transition="color 0.2s" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search by title, keywords, platform, or agent..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="rgba(53,53,53,0.55)"
                        backdropFilter="blur(24px)"
                        border="1px solid"
                        borderColor={searchQuery ? T.primary : 'rgba(255,255,255,0.08)'}
                        rounded="2xl"
                        color={T.white}
                        fontSize="sm"
                        _placeholder={{ color: 'gray.500' }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                        _focus={{
                            borderColor: T.primary,
                            boxShadow: `0 0 0 1px ${T.primaryGlow}, 0 0 20px ${T.primaryGlow}`,
                        }}
                        transition="all 0.3s"
                    />
                    {searchQuery && (
                        <InputRightElement h="full">
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                as="button"
                                onClick={() => setSearchQuery('')}
                                p={1.5}
                                rounded="full"
                                bg="whiteAlpha.100"
                                color="gray.400"
                                _hover={{ bg: 'whiteAlpha.200', color: T.white }}
                                transition="all 0.2s"
                                cursor="pointer"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={FiX} boxSize={3.5} />
                            </MotionBox>
                        </InputRightElement>
                    )}
                </InputGroup>
            </MotionBox>

            {/* Loading */}
            {loading && (
                <Flex justify="center" py={20}>
                    <VStack spacing={4}>
                        <Spinner size="xl" color={T.primary} thickness="3px" />
                        <Text color="gray.500" fontSize="sm">Loading history...</Text>
                    </VStack>
                </Flex>
            )}

            {/* Empty State — No items at all */}
            {!loading && contents.length === 0 && (
                <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} {...glassCard} rounded="3xl" py={16} textAlign="center">
                    <Icon as={FiClock} boxSize={14} color="gray.700" mb={4} />
                    <Heading size="md" color="gray.500">No activity yet</Heading>
                    <Text color="gray.600" mt={2}>Upload your first content to see it here</Text>
                    <Box
                        as="button" mt={6} px={6} py={3} rounded="full" bg={T.primary} color={T.white}
                        fontWeight="700" boxShadow={`0 0 20px ${T.primaryGlow}`}
                        _hover={{ bg: T.primaryHover, transform: 'translateY(-2px)' }}
                        transition="all 0.2s"
                        onClick={() => navigate('/upload')}
                    >
                        🚀 Start Creating
                    </Box>
                </MotionBox>
            )}

            {/* ── No Search Results ── */}
            {!loading && contents.length > 0 && filteredContents.length === 0 && searchQuery.trim() && (
                <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    {...glassCard}
                    rounded="3xl"
                    py={16}
                    textAlign="center"
                >
                    {/* Animated magnifying glass */}
                    <MotionBox
                        animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        display="inline-block"
                    >
                        <Icon as={FiSearch} boxSize={14} color="gray.600" />
                    </MotionBox>
                    <Heading size="md" color="gray.400" mt={4}>
                        No results found
                    </Heading>
                    <Text color="gray.600" mt={2} maxW="340px" mx="auto">
                        No items match "<Text as="span" color={T.primary} fontWeight="600">{searchQuery}</Text>".
                        Try searching by title, platform, or keyword.
                    </Text>
                    <Box
                        as="button"
                        mt={5}
                        px={5}
                        py={2}
                        rounded="full"
                        bg="whiteAlpha.100"
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="600"
                        _hover={{ bg: 'whiteAlpha.200', color: T.white }}
                        transition="all 0.2s"
                        onClick={() => setSearchQuery('')}
                    >
                        Clear Search
                    </Box>
                </MotionBox>
            )}

            {/* Content List */}
            {!loading && filteredContents.length > 0 && (
                <VStack spacing={4} align="stretch">
                    <AnimatePresence mode="popLayout">
                        {filteredContents.map((item, idx) => {
                            const st = getStatusStyle(item.status || item.orchestrationStatus);
                            return (
                                <MotionBox
                                    key={item._id}
                                    custom={idx}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                    {...glassCard}
                                    rounded="2xl"
                                    cursor="pointer"
                                    onClick={() => navigate(`/content/${item._id}`)}
                                    _hover={{ borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)', boxShadow: `0 4px 30px rgba(0,0,0,0.3)` }}
                                    role="group"
                                >
                                    {/* Top accent line */}
                                    <Box position="absolute" top={0} left={0} w="100%" h="2px" bg={st.border} opacity={0.5} />

                                    <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                                        {/* Left: Info */}
                                        <VStack align="start" spacing={2} flex={1}>
                                            <HStack spacing={3}>
                                                <Text fontWeight="700" fontSize="md" color={T.white} _groupHover={{ color: T.primary }} transition="all 0.2s">
                                                    {item.title || 'Untitled Content'}
                                                </Text>
                                                <Badge bg={st.bg} color={st.color} rounded="full" px={2.5} fontSize="2xs" border="1px solid" borderColor={st.border}>
                                                    {st.label}
                                                </Badge>
                                            </HStack>

                                            {/* Platforms */}
                                            <HStack spacing={2}>
                                                {(item.platforms || []).map(p => (
                                                    <HStack key={p} spacing={1} bg="whiteAlpha.50" rounded="full" px={2.5} py={1}>
                                                        <Icon as={PLATFORM_ICONS[p] || FiFileText} boxSize={3} color={PLATFORM_COLORS[p] || 'gray.400'} />
                                                        <Text fontSize="2xs" color="gray.400" textTransform="capitalize">{p}</Text>
                                                    </HStack>
                                                ))}
                                                {item.variants && item.variants.length > 0 && (
                                                    <Text fontSize="2xs" color="gray.600">• {item.variants.length} variant{item.variants.length > 1 ? 's' : ''} generated</Text>
                                                )}
                                            </HStack>
                                        </VStack>

                                        {/* Right: Time + Arrow */}
                                        <HStack spacing={3} align="center">
                                            <VStack spacing={0} align="end">
                                                <Text fontSize="xs" color="gray.500">{getTimeAgo(item.createdAt)}</Text>
                                                <Text fontSize="2xs" color="gray.700">{new Date(item.createdAt).toLocaleString()}</Text>
                                            </VStack>
                                            <Icon as={FiArrowRight} color="gray.600" boxSize={4} _groupHover={{ color: T.primary, transform: 'translateX(3px)' }} transition="all 0.2s" />
                                        </HStack>
                                    </Flex>
                                </MotionBox>
                            );
                        })}
                    </AnimatePresence>
                </VStack>
            )}
        </VStack>
    );
}
