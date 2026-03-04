/**
 * Platform Grid Dashboard
 * Clean modern dashboard with platform cards for Instagram, Blogs, LinkedIn, Email, Twitter (X)
 * Chakra UI + Framer Motion | Dark Glassmorphism
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Flex, VStack, HStack, Text, Heading, Icon, SimpleGrid, Badge, Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiZap, FiGrid, FiArrowRight,
} from 'react-icons/fi';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { FiMail, FiBookOpen } from 'react-icons/fi';
import { useBrandDNA } from '../../context/BrandDNAContext';

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
const PlatformCard = ({ platform, index, onClick }) => (
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
            {...glass}
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
            <Heading size="md" color={T.white} mb={1} letterSpacing="tight">
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
                        bg="rgba(255,255,255,0.05)"
                        color="gray.400"
                        rounded="full"
                        px={2.5} py={0.5}
                        fontSize="2xs"
                        fontWeight="600"
                        textTransform="capitalize"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.06)"
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

    return (
        <Box minH="100vh" bg={T.bg} color={T.white} position="relative" overflow="hidden">
            {/* Ambient background glows */}
            <Box position="fixed" top="-15%" left="-10%" w="55vw" h="55vw"
                bg={T.primary} filter="blur(180px)" opacity={0.06} pointerEvents="none" />
            <Box position="fixed" bottom="-15%" right="-10%" w="50vw" h="50vw"
                bg={T.primary} filter="blur(200px)" opacity={0.04} pointerEvents="none" />

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
                                <Heading size="lg" letterSpacing="tight" color={T.white}>
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

                {/* ── Section Title ── */}
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
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
                    {PLATFORMS.map((platform, index) => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            index={index}
                            onClick={() => navigate(`/library/${platform.id}`)}
                        />
                    ))}
                </SimpleGrid>

                {/* ── Quick Stats Bar ── */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    mt={10}
                    {...glass}
                    p={6}
                >
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                        {[
                            { label: 'Total Posts', value: '0', icon: '📝' },
                            { label: 'Published', value: '0', icon: '🚀' },
                            { label: 'Drafts', value: '0', icon: '📋' },
                            { label: 'Scheduled', value: '0', icon: '📅' },
                        ].map((stat, i) => (
                            <VStack key={i} spacing={1}>
                                <Text fontSize="lg">{stat.icon}</Text>
                                <Heading size="lg" color={T.white}>{stat.value}</Heading>
                                <Text fontSize="xs" color="gray.500" fontWeight="600"
                                    textTransform="uppercase" letterSpacing="wider">
                                    {stat.label}
                                </Text>
                            </VStack>
                        ))}
                    </SimpleGrid>
                </MotionBox>
            </Box>
        </Box>
    );
}
