/**
 * Performance Analytics Page
 * Engagement metrics, platform comparison, post performance, growth trends.
 * Only accessible from navigation bar — never inside platform grids.
 * Uses recharts + Chakra UI + Framer Motion | Dark Glassmorphism
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Flex, VStack, HStack, Text, Heading, Icon, SimpleGrid, Badge,
    Select, Table, Thead, Tbody, Tr, Th, Td,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiTrendingUp, FiBarChart2, FiUsers, FiEye, FiHeart, FiShare2,
    FiArrowUp, FiArrowDown,
} from 'react-icons/fi';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const MotionBox = motion(Box);

const T = {
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.35)',
    primaryFaint: 'rgba(255,107,1,0.1)',
    white: '#FFFFFF',
    surface: '#353535',
    bg: '#1A1A1A',
};

const glass = {
    bg: 'rgba(53,53,53,0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.08)',
    rounded: '2xl',
};

// ─── Mock Data ───
const ENGAGEMENT_DATA = [
    { month: 'Sep', likes: 1200, comments: 340, shares: 180 },
    { month: 'Oct', likes: 1800, comments: 520, shares: 290 },
    { month: 'Nov', likes: 1500, comments: 410, shares: 220 },
    { month: 'Dec', likes: 2200, comments: 680, shares: 410 },
    { month: 'Jan', likes: 2800, comments: 750, shares: 520 },
    { month: 'Feb', likes: 3200, comments: 920, shares: 610 },
    { month: 'Mar', likes: 3800, comments: 1100, shares: 780 },
];

const PLATFORM_COMPARISON = [
    { platform: 'Instagram', engagement: 4200, reach: 12000, posts: 45 },
    { platform: 'LinkedIn', engagement: 2800, reach: 8500, posts: 32 },
    { platform: 'Twitter', engagement: 3100, reach: 15000, posts: 78 },
    { platform: 'Blog', engagement: 1200, reach: 5600, posts: 12 },
    { platform: 'Email', engagement: 1800, reach: 4200, posts: 24 },
];

const GROWTH_DATA = [
    { month: 'Sep', followers: 2400, impressions: 18000 },
    { month: 'Oct', followers: 3100, impressions: 24000 },
    { month: 'Nov', followers: 3800, impressions: 28000 },
    { month: 'Dec', followers: 4200, impressions: 32000 },
    { month: 'Jan', followers: 5100, impressions: 41000 },
    { month: 'Feb', followers: 6200, impressions: 52000 },
    { month: 'Mar', followers: 7800, impressions: 64000 },
];

const AUDIENCE_DATA = [
    { name: '18–24', value: 22, color: '#FF6B01' },
    { name: '25–34', value: 38, color: '#F59E0B' },
    { name: '35–44', value: 24, color: '#22C55E' },
    { name: '45–54', value: 11, color: '#3B82F6' },
    { name: '55+', value: 5, color: '#8B5CF6' },
];

const TOP_POSTS = [
    { title: 'Product Launch Announcement', platform: 'Instagram', engagement: 4520, change: 12.3 },
    { title: 'Industry Insights Thread', platform: 'Twitter', engagement: 3890, change: 8.7 },
    { title: 'Q1 Results Deep Dive', platform: 'LinkedIn', engagement: 2940, change: -2.1 },
    { title: 'Behind the Scenes Newsletter', platform: 'Email', engagement: 2100, change: 15.4 },
    { title: 'How We Built Our Stack', platform: 'Blog', engagement: 1850, change: 6.2 },
];

const chartTooltipStyle = {
    contentStyle: { backgroundColor: T.bg, borderColor: '#444', borderRadius: '12px', padding: '10px 14px' },
    itemStyle: { color: T.white, fontSize: '12px' },
    labelStyle: { color: 'gray', fontSize: '11px' },
};

// ─── Stat Card ───
const StatCard = ({ icon, label, value, change, index }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        {...glass} p={5} position="relative" overflow="hidden"
    >
        <Box position="absolute" top={-6} right={-6} w={20} h={20}
            bg={T.primary} rounded="full" filter="blur(40px)" opacity={0.15} />
        <HStack mb={2} spacing={2}>
            <Icon as={icon} color={T.primary} boxSize={4} />
            <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                {label}
            </Text>
        </HStack>
        <Heading size="lg" color={T.white} letterSpacing="tight">{value}</Heading>
        {change !== undefined && (
            <HStack mt={2} spacing={1}>
                <Icon as={change >= 0 ? FiArrowUp : FiArrowDown}
                    color={change >= 0 ? '#22C55E' : '#EF4444'} boxSize={3} />
                <Text fontSize="xs" color={change >= 0 ? '#22C55E' : '#EF4444'} fontWeight="600">
                    {Math.abs(change)}%
                </Text>
                <Text fontSize="xs" color="gray.600">vs last month</Text>
            </HStack>
        )}
    </MotionBox>
);

// ─── Chart Container ───
const ChartBox = ({ title, icon, children, delay = 0 }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        {...glass} p={6} position="relative" overflow="hidden"
    >
        <Box position="absolute" top={-8} right={-8} w={24} h={24}
            bg={T.primary} filter="blur(50px)" opacity={0.1} />
        <HStack mb={5} spacing={2}>
            <Icon as={icon} color={T.primary} boxSize={4} />
            <Text fontSize="xs" fontWeight="800" color="gray.500"
                textTransform="uppercase" letterSpacing="wider">{title}</Text>
        </HStack>
        {children}
    </MotionBox>
);

// ─── Main ───
export default function PerformanceAnalytics() {
    const [timeRange, setTimeRange] = useState('7d');

    return (
        <Box minH="100vh" bg={T.bg} color={T.white} position="relative" overflow="hidden">
            {/* Ambient glows */}
            <Box position="fixed" top="-15%" left="-10%" w="55vw" h="55vw"
                bg={T.primary} filter="blur(180px)" opacity={0.06} pointerEvents="none" />
            <Box position="fixed" bottom="-15%" right="-10%" w="50vw" h="50vw"
                bg="#A78BFA" filter="blur(200px)" opacity={0.04} pointerEvents="none" />

            <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, xl: 8 }} pb={20} position="relative" zIndex={1}>

                {/* ── Header ── */}
                <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} mb={8}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <HStack spacing={4}>
                            <Box bg={T.primary} p={2.5} rounded="xl" boxShadow={`0 0 25px ${T.primaryGlow}`}>
                                <Icon as={FiBarChart2} boxSize={6} color={T.white} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" color={T.white} letterSpacing="tight">
                                    Performance Analytics
                                </Heading>
                                <Text color="gray.500" fontSize="xs" fontFamily="mono" letterSpacing="wide">
                                    Cross-Platform Performance Dashboard
                                </Text>
                            </VStack>
                        </HStack>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            w="150px" size="sm" rounded="lg"
                            bg={T.surface} border="1px solid" borderColor="rgba(255,255,255,0.1)"
                            color={T.white} fontSize="xs"
                        >
                            <option value="7d" style={{ background: T.surface }}>Last 7 days</option>
                            <option value="30d" style={{ background: T.surface }}>Last 30 days</option>
                            <option value="90d" style={{ background: T.surface }}>Last 90 days</option>
                            <option value="1y" style={{ background: T.surface }}>Last year</option>
                        </Select>
                    </Flex>
                </MotionBox>

                {/* ── KPI Cards ── */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
                    <StatCard icon={FiEye} label="Total Reach" value="64K" change={23.5} index={0} />
                    <StatCard icon={FiHeart} label="Engagements" value="3.8K" change={12.1} index={1} />
                    <StatCard icon={FiUsers} label="Followers" value="7.8K" change={18.2} index={2} />
                    <StatCard icon={FiShare2} label="Shares" value="780" change={-3.4} index={3} />
                </SimpleGrid>

                {/* ── Charts Row 1 ── */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                    {/* Engagement Over Time */}
                    <ChartBox title="Engagement Metrics" icon={FiTrendingUp} delay={0.2}>
                        <Box h="280px">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ENGAGEMENT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                                    <Tooltip {...chartTooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Line type="monotone" dataKey="likes" stroke="#FF6B01" strokeWidth={2.5}
                                        dot={{ fill: '#FF6B01', r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="comments" stroke="#22C55E" strokeWidth={2}
                                        dot={{ fill: '#22C55E', r: 3 }} />
                                    <Line type="monotone" dataKey="shares" stroke="#3B82F6" strokeWidth={2}
                                        dot={{ fill: '#3B82F6', r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </ChartBox>

                    {/* Platform Comparison */}
                    <ChartBox title="Platform Comparison" icon={FiBarChart2} delay={0.3}>
                        <Box h="280px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PLATFORM_COMPARISON}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="platform" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                                    <Tooltip {...chartTooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="engagement" fill="#FF6B01" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="reach" fill="#3B82F6" radius={[6, 6, 0, 0]} opacity={0.7} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </ChartBox>
                </SimpleGrid>

                {/* ── Charts Row 2 ── */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                    {/* Growth Trends */}
                    <ChartBox title="Growth Trends" icon={FiTrendingUp} delay={0.4}>
                        <Box h="280px">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={GROWTH_DATA}>
                                    <defs>
                                        <linearGradient id="gradFollowers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6B01" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FF6B01" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                                    <Tooltip {...chartTooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="followers" stroke="#FF6B01" strokeWidth={2}
                                        fillOpacity={1} fill="url(#gradFollowers)" />
                                    <Area type="monotone" dataKey="impressions" stroke="#A78BFA" strokeWidth={2}
                                        fillOpacity={1} fill="url(#gradImpressions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </ChartBox>

                    {/* Audience Breakdown */}
                    <ChartBox title="Audience Engagement" icon={FiUsers} delay={0.5}>
                        <Flex h="280px" align="center" justify="center" gap={6}>
                            <Box w="55%" h="100%">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={AUDIENCE_DATA}
                                            cx="50%" cy="50%"
                                            innerRadius={55} outerRadius={90}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {AUDIENCE_DATA.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip {...chartTooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <VStack spacing={2} align="stretch" w="40%">
                                {AUDIENCE_DATA.map((item) => (
                                    <HStack key={item.name} spacing={2}>
                                        <Box w="8px" h="8px" rounded="sm" bg={item.color} flexShrink={0} />
                                        <Text fontSize="xs" color="gray.400" flex={1}>{item.name}</Text>
                                        <Text fontSize="xs" color={T.white} fontWeight="700">{item.value}%</Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Flex>
                    </ChartBox>
                </SimpleGrid>

                {/* ── Top Posts Table ── */}
                <ChartBox title="Post Performance" icon={FiBarChart2} delay={0.6}>
                    <Box overflowX="auto">
                        <Table variant="unstyled" size="sm">
                            <Thead>
                                <Tr>
                                    <Th color="gray.600" fontSize="2xs" textTransform="uppercase" letterSpacing="wider"
                                        borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={3}>
                                        Post Title
                                    </Th>
                                    <Th color="gray.600" fontSize="2xs" textTransform="uppercase" letterSpacing="wider"
                                        borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={3}>
                                        Platform
                                    </Th>
                                    <Th color="gray.600" fontSize="2xs" textTransform="uppercase" letterSpacing="wider"
                                        borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={3} isNumeric>
                                        Engagement
                                    </Th>
                                    <Th color="gray.600" fontSize="2xs" textTransform="uppercase" letterSpacing="wider"
                                        borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={3} isNumeric>
                                        Change
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {TOP_POSTS.map((post, i) => (
                                    <Tr key={i} _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.15s">
                                        <Td borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)" py={3}>
                                            <Text fontSize="sm" color={T.white} fontWeight="500">{post.title}</Text>
                                        </Td>
                                        <Td borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)" py={3}>
                                            <Badge bg="rgba(255,255,255,0.05)" color="gray.400" rounded="full"
                                                px={2} fontSize="2xs">{post.platform}</Badge>
                                        </Td>
                                        <Td borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)" py={3} isNumeric>
                                            <Text fontSize="sm" color={T.white} fontWeight="600">
                                                {post.engagement.toLocaleString()}
                                            </Text>
                                        </Td>
                                        <Td borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)" py={3} isNumeric>
                                            <HStack justify="flex-end" spacing={1}>
                                                <Icon as={post.change >= 0 ? FiArrowUp : FiArrowDown}
                                                    color={post.change >= 0 ? '#22C55E' : '#EF4444'} boxSize={3} />
                                                <Text fontSize="xs" color={post.change >= 0 ? '#22C55E' : '#EF4444'}
                                                    fontWeight="600">{Math.abs(post.change)}%</Text>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </ChartBox>
            </Box>
        </Box>
    );
}
