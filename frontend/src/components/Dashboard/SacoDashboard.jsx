/**
 * Platform Grid Dashboard
 * Clean modern dashboard with platform cards for Instagram, Blogs, LinkedIn, Email, Twitter (X)
 * Chakra UI + Framer Motion | Dark Glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Flex, VStack, HStack, Text, Heading, Icon, SimpleGrid, Badge, Image,
    useColorMode,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiZap, FiGrid, FiArrowRight, FiTarget, FiLayers, FiClock,
} from 'react-icons/fi';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { FiMail, FiBookOpen } from 'react-icons/fi';
import { useBrandDNA } from '../../context/BrandDNAContext';
import api from '../../services/api';

const MotionBox = motion(Box);

// ─── Theme ───
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
    bgDeep: '#111111',
};

const glass = {
    bg: 'rgba(53,53,53,0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.08)',
    rounded: '2xl',
};

// ─── Platform Data ───
const PLATFORMS = [
    {
        id: 'instagram',
        name: 'Instagram',
        description: 'Visual content, stories, and reels',
        icon: SiInstagram,
        color: '#E4405F',
        gradient: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
        stats: { posts: 0, drafts: 0, scheduled: 0 },
    },
    {
        id: 'blogs',
        name: 'Blogs',
        description: 'Articles, long-form, and thought leadership',
        icon: FiBookOpen,
        color: '#22C55E',
        gradient: 'linear-gradient(135deg, #16A34A, #22C55E)',
        stats: { articles: 0, published: 0, archived: 0 },
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Professional posts and networking',
        icon: SiLinkedin,
        color: '#0A66C2',
        gradient: 'linear-gradient(135deg, #0A66C2, #0077B5)',
        stats: { posts: 0, published: 0 },
    },
    {
        id: 'email',
        name: 'Emails',
        description: 'Campaigns, newsletters, and outreach',
        icon: FiMail,
        color: '#EF4444',
        gradient: 'linear-gradient(135deg, #DC2626, #F87171)',
        stats: { campaigns: 0, sent: 0 },
    },
    {
        id: 'twitter',
        name: 'Twitter (X)',
        description: 'Tweets, threads, and real-time engagement',
        icon: FaXTwitter,
        color: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #1A1A2E, #353535)',
        stats: { tweets: 0, threads: 0, drafts: 0 },
    },
];

// ─── Platform Card ───
const PlatformCard = ({ platform, index, onClick, dark }) => (
    <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.25 } }}
        onClick={onClick}
        cursor="pointer"
        role="group"
    >
        <Box
            bg={dark ? 'rgba(53,53,53,0.5)' : 'rgba(255,255,255,0.7)'}
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            rounded="2xl"
            p={6}
            position="relative"
            overflow="hidden"
            _hover={{
                borderColor: `${platform.color}40`,
                boxShadow: `0 8px 40px ${platform.color}15`,
            }}
            transition="all 0.3s"
        >
            {/* Glow accent */}
            <Box
                position="absolute" top={-8} right={-8}
                w="80px" h="80px"
                bg={platform.color}
                filter="blur(50px)" opacity={0.15}
                _groupHover={{ opacity: 0.3 }}
                transition="opacity 0.3s"
            />

            {/* Platform icon with gradient bg */}
            <Flex
                w="56px" h="56px"
                rounded="xl"
                bg={platform.gradient}
                align="center" justify="center"
                mb={4}
                boxShadow={`0 4px 20px ${platform.color}30`}
                _groupHover={{ transform: 'scale(1.05)' }}
                transition="transform 0.25s"
            >
                <Icon as={platform.icon} boxSize={6} color={T.white} />
            </Flex>

            {/* Name & Description */}
            <Heading size="md" color={dark ? T.white : '#1A1A1A'} mb={1} letterSpacing="tight">
                {platform.name}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4} lineHeight="1.5">
                {platform.description}
            </Text>

            {/* Stats badges */}
            <HStack spacing={2} flexWrap="wrap">
                {Object.entries(platform.stats).map(([key, val]) => (
                    <Badge
                        key={key}
                        bg={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                        color={dark ? 'gray.400' : 'gray.600'}
                        rounded="full"
                        px={2.5} py={0.5}
                        fontSize="2xs"
                        fontWeight="600"
                        textTransform="capitalize"
                        border="1px solid"
                        borderColor={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    >
                        {val} {key}
                    </Badge>
                ))}
            </HStack>

            {/* Arrow indicator */}
            <Box
                position="absolute" bottom={4} right={4}
                opacity={0}
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.25s"
            >
                <Icon as={FiArrowRight} boxSize={4} color={platform.color} />
            </Box>
        </Box>
    </MotionBox>
);

// ─── Main Dashboard ───
export default function SacoDashboard() {
    const navigate = useNavigate();
    const { brandDNA } = useBrandDNA();
    const { colorMode } = useColorMode();
    const dark = colorMode === 'dark';

    // Theme-aware values
    const bg = dark ? T.bg : '#F7F7F8';
    const textColor = dark ? T.white : '#1A1A1A';
    const glassStyles = dark ? glass : {
        bg: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        rounded: '2xl',
    };

    // Initialize from cache for instant display, then refresh from API
    const [platformStats, setPlatformStats] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('dash_platformStats')) || {}; } catch { return {}; }
    });
    const [kpis, setKpis] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('dash_kpis')) || { hitRate: 0, automationRate: 0, totalContent: 0, totalVariants: 0 }; } catch { return { hitRate: 0, automationRate: 0, totalContent: 0, totalVariants: 0 }; }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/content/stats/platforms');
                if (data.platforms) {
                    setPlatformStats(data.platforms);
                    sessionStorage.setItem('dash_platformStats', JSON.stringify(data.platforms));
                }
            } catch (err) { console.error('[Dashboard] platform stats error:', err); }
            try {
                const { data } = await api.get('/auth/stats');
                if (data.kpis) {
                    setKpis(data.kpis);
                    sessionStorage.setItem('dash_kpis', JSON.stringify(data.kpis));
                }
            } catch (err) { console.error('[Dashboard] auth/stats error:', err); }
        };
        fetchStats();
    }, []);

    // Merge live counts into platform data
    const platforms = PLATFORMS.map(p => ({
        ...p,
        stats: { variants: platformStats[p.id] || 0 },
    }));

    return (
        <Box minH="100vh" bg={bg} color={textColor} position="relative" overflow="hidden">
            {/* Ambient background glows */}
            <Box position="fixed" top="-15%" left="-10%" w="55vw" h="55vw"
                bg={T.primary} filter="blur(180px)" opacity={dark ? 0.06 : 0.03} pointerEvents="none" />
            <Box position="fixed" bottom="-15%" right="-10%" w="50vw" h="50vw"
                bg={T.primary} filter="blur(200px)" opacity={dark ? 0.04 : 0.02} pointerEvents="none" />

            <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, xl: 8 }} pb={20} position="relative" zIndex={1}>

                {/* ── Header ── */}
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    mb={10}
                >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <HStack spacing={4}>
                            <Box
                                bg={brandDNA.colorPalette?.primary || T.primary}
                                p={2.5} rounded="xl"
                                boxShadow={`0 0 25px ${T.primaryGlow}`}
                            >
                                <Icon as={FiZap} boxSize={6} color={T.white} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" letterSpacing="tight" color={textColor}>
                                    {brandDNA.brandName ? `Welcome, ${brandDNA.brandName}` : 'Dashboard'}
                                </Heading>
                                <Text color="gray.500" fontSize="xs" fontFamily="mono" letterSpacing="wide">
                                    Content Command Center • {PLATFORMS.length} Platforms
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Brand logo if available */}
                        {brandDNA.logoDataUrl && (
                            <Image
                                src={brandDNA.logoDataUrl}
                                alt="Brand Logo"
                                maxH="40px" maxW="120px"
                                rounded="lg"
                                opacity={0.9}
                            />
                        )}
                    </Flex>
                </MotionBox>

                {/* ── Quick Stats Bar ── */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    mb={10}
                    {...glassStyles}
                    p={6}
                >
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                        {[
                            { label: 'Hit Rate', value: kpis.hitRate || 0, unit: '%', icon: FiTarget, sub: 'Target: 85%' },
                            { label: 'Automation Rate', value: kpis.automationRate || 0, unit: '%', icon: FiZap, sub: 'Autonomous' },
                            { label: 'Total Content', value: kpis.totalContent || 0, unit: '', icon: FiLayers, sub: 'Pieces created' },
                            { label: 'Variants Generated', value: kpis.totalVariants || 0, unit: '', icon: FiClock, sub: 'Via COPE pipeline' },
                        ].map((stat, i) => (
                            <VStack key={i} spacing={1}>
                                <Icon as={stat.icon} boxSize={5} color={T.primary} />
                                <HStack spacing={1} align="baseline">
                                    <Heading size="lg" color={textColor}>
                                        {stat.value.toLocaleString()}
                                    </Heading>
                                    {stat.unit && <Text fontSize="sm" color={dark ? 'gray.400' : 'gray.500'}>{stat.unit}</Text>}
                                </HStack>
                                <Text fontSize="xs" color="gray.500" fontWeight="600"
                                    textTransform="uppercase" letterSpacing="wider">
                                    {stat.label}
                                </Text>
                                <Text fontSize="2xs" color="gray.600">{stat.sub}</Text>
                            </VStack>
                        ))}
                    </SimpleGrid>
                </MotionBox>

                {/* ── Section Title ── */}
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    mb={6}
                >
                    <HStack spacing={2} mb={2}>
                        <Icon as={FiGrid} color={T.primary} boxSize={4} />
                        <Text fontSize="xs" fontWeight="800" color="gray.500"
                            textTransform="uppercase" letterSpacing="wider">
                            Your Platforms
                        </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                        Select a platform to access its content library
                    </Text>
                </MotionBox>

                {/* ── Platform Grid ── */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                    {platforms.map((platform, index) => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            index={index}
                            dark={dark}
                            onClick={() => navigate(`/library/${platform.id}`)}
                        />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
}
