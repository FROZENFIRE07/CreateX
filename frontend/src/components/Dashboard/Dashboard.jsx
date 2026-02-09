/**
 * Dashboard Component - Redesigned
 * Modern dashboard with animated KPIs, charts, and activity timeline
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Icon,
    Tooltip,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    FiPlus,
    FiTrendingUp,
    FiTrendingDown,
    FiTarget,
    FiZap,
    FiLayers,
    FiClock,
    FiArrowRight,
    FiTwitter,
    FiLinkedin,
    FiMail,
    FiInstagram,
    FiFileText,
    FiSearch,
    FiFilter,
} from 'react-icons/fi';
import api from '../../services/api';
import {
    DashboardSkeleton,
    ContentItemSkeleton,
    StaggerContainer,
    StaggerItem,
    showToast
} from '../common';

const MotionBox = motion(Box);

// Platform icons mapping
const platformIcons = {
    twitter: FiTwitter,
    linkedin: FiLinkedin,
    email: FiMail,
    instagram: FiInstagram,
    blog: FiFileText
};

// Get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

// Animated KPI Card
const KPICard = ({ label, value, unit, change, positive, icon, delay = 0 }) => (
    <MotionBox
        bg="surface.card"
        borderRadius="xl"
        border="1px solid"
        borderColor="surface.border"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{
            y: -4,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
    >
        <HStack justify="space-between" mb={3}>
            <Text color="gray.400" fontSize="sm" fontWeight="500">{label}</Text>
            <Icon as={icon} color="brand.400" boxSize={5} />
        </HStack>
        <HStack align="baseline" spacing={1}>
            <Text fontSize="3xl" fontWeight="700" color="white" letterSpacing="-0.02em">
                <CountUp end={value} duration={2} separator="," />
            </Text>
            {unit && <Text fontSize="lg" color="gray.400">{unit}</Text>}
        </HStack>
        {change && (
            <HStack mt={2} spacing={1}>
                <Icon
                    as={positive ? FiTrendingUp : FiTrendingDown}
                    color={positive ? 'success.400' : 'error.400'}
                    boxSize={4}
                />
                <Text fontSize="sm" color={positive ? 'success.400' : 'error.400'}>
                    {change}
                </Text>
            </HStack>
        )}
    </MotionBox>
);

// Status badge component
const StatusBadge = ({ status }) => {
    const colors = {
        pending: { bg: 'brand.500', label: 'Pending' },
        processing: { bg: 'accent.500', label: 'Processing' },
        completed: { bg: 'success.500', label: 'Completed' },
        failed: { bg: 'error.500', label: 'Failed' }
    };

    const config = colors[status] || colors.pending;

    return (
        <Badge bg={config.bg} color="white" borderRadius="full" px={3} py={1} fontSize="xs">
            {config.label}
        </Badge>
    );
};

// Activity item
const ActivityItem = ({ icon: IconComponent, title, time, platform, delay = 0 }) => (
    <MotionBox
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
    >
        <HStack
            spacing={4}
            py={3}
            borderBottom="1px solid"
            borderColor="surface.border"
            _last={{ border: 'none' }}
        >
            <Box
                bg="brand.500"
                borderRadius="lg"
                p={2}
                opacity={0.8}
            >
                <Icon as={IconComponent} color="white" boxSize={4} />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
                <Text color="white" fontSize="sm" fontWeight="500">{title}</Text>
                <Text color="gray.500" fontSize="xs">{time}</Text>
            </VStack>
            {platform && (
                <Icon as={platformIcons[platform] || FiFileText} color="gray.400" boxSize={4} />
            )}
        </HStack>
    </MotionBox>
);

// Mock chart data
const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        name: day,
        content: Math.floor(Math.random() * 10) + 2,
        variants: Math.floor(Math.random() * 30) + 10,
    }));
};

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                bg="surface.card"
                border="1px solid"
                borderColor="surface.border"
                borderRadius="lg"
                p={3}
                boxShadow="xl"
            >
                <Text color="white" fontWeight="600" mb={1}>{label}</Text>
                {payload.map((item, i) => (
                    <Text key={i} color={item.color} fontSize="sm">
                        {item.name}: {item.value}
                    </Text>
                ))}
            </Box>
        );
    }
    return null;
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData] = useState(generateChartData);
    const [timeRange, setTimeRange] = useState('7d');
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('all');

    const isMobile = useBreakpointValue({ base: true, md: false });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, contentsRes] = await Promise.all([
                api.get('/auth/stats'),
                api.get('/content?limit=5')
            ]);
            setStats(statsRes.data);
            setContents(contentsRes.data.contents);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            showToast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    const kpis = [
        {
            label: 'Hit Rate',
            value: stats?.kpis?.hitRate || 85,
            unit: '%',
            change: 'Target: 85%',
            positive: true,
            icon: FiTarget
        },
        {
            label: 'Automation Rate',
            value: stats?.kpis?.automationRate || 0,
            unit: '%',
            change: 'Autonomous',
            positive: true,
            icon: FiZap
        },
        {
            label: 'Total Content',
            value: stats?.kpis?.totalContent || 0,
            change: 'Pieces created',
            icon: FiLayers
        },
        {
            label: 'Variants Generated',
            value: stats?.kpis?.totalVariants || 0,
            change: 'Via COPE pipeline',
            icon: FiClock
        },
    ];

    // Generate activity items from recent content
    const activities = contents.slice(0, 4).map((content, i) => ({
        icon: platformIcons[content.variants?.[0]?.platform] || FiFileText,
        title: `Generated "${content.title}"`,
        time: new Date(content.createdAt).toLocaleDateString(),
        platform: content.variants?.[0]?.platform
    }));

    // Filter contents based on search and platform
    const filteredContents = contents.filter(content => {
        const matchesSearch = content.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = platformFilter === 'all' ||
            content.variants?.some(v => v.platform === platformFilter);
        return matchesSearch && matchesPlatform;
    });

    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Flex
                    justify="space-between"
                    align={{ base: 'start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap={4}
                >
                    <VStack align="start" spacing={1}>
                        <Heading size="lg" color="white">
                            {getGreeting()}! 👋
                        </Heading>
                        <Text color="gray.400">
                            Your content orchestration at a glance
                        </Text>
                    </VStack>
                    <Link to="/upload">
                        <Button
                            leftIcon={<FiPlus />}
                            bg="brand.500"
                            color="white"
                            _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'glow' }}
                            size="lg"
                        >
                            New Content
                        </Button>
                    </Link>
                </Flex>
            </MotionBox>

            {/* KPI Grid */}
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
                {kpis.map((kpi, i) => (
                    <KPICard key={kpi.label} {...kpi} delay={0.1 * i} />
                ))}
            </SimpleGrid>

            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Performance Chart */}
                <MotionBox
                    bg="surface.card"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="surface.border"
                    p={6}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <HStack justify="space-between" mb={6}>
                        <Heading size="md" color="white">Content Performance</Heading>
                        <Select
                            size="sm"
                            w="100px"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            bg="surface.bg"
                            borderColor="surface.border"
                        >
                            <option value="7d">7 days</option>
                            <option value="30d">30 days</option>
                            <option value="90d">90 days</option>
                        </Select>
                    </HStack>
                    <Box h="250px">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVariants" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="variants"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorVariants)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </MotionBox>

                {/* Recent Activity */}
                <MotionBox
                    bg="surface.card"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="surface.border"
                    p={6}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Heading size="md" color="white" mb={4}>Recent Activity</Heading>
                    {activities.length > 0 ? (
                        <VStack align="stretch" spacing={0}>
                            {activities.map((activity, i) => (
                                <ActivityItem key={i} {...activity} delay={0.1 * i} />
                            ))}
                        </VStack>
                    ) : (
                        <VStack py={8} spacing={4}>
                            <Text color="gray.500">No recent activity</Text>
                            <Link to="/upload">
                                <Button size="sm" variant="outline" borderColor="surface.border" color="gray.300">
                                    Create your first content
                                </Button>
                            </Link>
                        </VStack>
                    )}
                </MotionBox>
            </SimpleGrid>

            {/* Content Table */}
            <MotionBox
                bg="surface.card"
                borderRadius="xl"
                border="1px solid"
                borderColor="surface.border"
                overflow="hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Flex
                    justify="space-between"
                    align={{ base: 'stretch', md: 'center' }}
                    p={6}
                    borderBottom="1px solid"
                    borderColor="surface.border"
                    direction={{ base: 'column', md: 'row' }}
                    gap={4}
                >
                    <Heading size="md" color="white">Recent Content</Heading>
                    <HStack spacing={3} flex={{ base: 1, md: 'none' }}>
                        <InputGroup size="sm" maxW={{ base: 'full', md: '200px' }}>
                            <InputLeftElement>
                                <Icon as={FiSearch} color="gray.500" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg="surface.bg"
                                border="1px solid"
                                borderColor="surface.border"
                                _focus={{ borderColor: 'brand.500' }}
                            />
                        </InputGroup>
                        <Select
                            size="sm"
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            bg="surface.bg"
                            borderColor="surface.border"
                            maxW="120px"
                        >
                            <option value="all">All</option>
                            <option value="twitter">Twitter</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="email">Email</option>
                            <option value="instagram">Instagram</option>
                            <option value="blog">Blog</option>
                        </Select>
                    </HStack>
                </Flex>

                {contents.length === 0 ? (
                    <VStack py={12} spacing={4}>
                        <MotionBox
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Icon as={FiLayers} boxSize={12} color="gray.600" />
                        </MotionBox>
                        <Text color="gray.500" fontSize="lg">No content yet</Text>
                        <Text color="gray.600" fontSize="sm">Create your first piece to get started!</Text>
                        <Link to="/upload">
                            <Button bg="brand.500" color="white" _hover={{ bg: 'brand.600' }}>
                                Upload Content
                            </Button>
                        </Link>
                    </VStack>
                ) : (
                    <>
                        {/* Desktop Table */}
                        {!isMobile && (
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th color="gray.500" borderColor="surface.border">Title</Th>
                                        <Th color="gray.500" borderColor="surface.border">Type</Th>
                                        <Th color="gray.500" borderColor="surface.border">Status</Th>
                                        <Th color="gray.500" borderColor="surface.border">Variants</Th>
                                        <Th color="gray.500" borderColor="surface.border">Created</Th>
                                        <Th color="gray.500" borderColor="surface.border"></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <AnimatePresence>
                                        {filteredContents.map((content, i) => (
                                            <MotionBox
                                                as={Tr}
                                                key={content._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * i }}
                                                _hover={{ bg: 'whiteAlpha.50' }}
                                            >
                                                <Td borderColor="surface.border" color="white" fontWeight="500">
                                                    {content.title}
                                                </Td>
                                                <Td borderColor="surface.border">
                                                    <Badge bg="brand.500" color="white" borderRadius="full" px={2}>
                                                        {content.type}
                                                    </Badge>
                                                </Td>
                                                <Td borderColor="surface.border">
                                                    <StatusBadge status={content.orchestrationStatus} />
                                                </Td>
                                                <Td borderColor="surface.border" color="gray.300">
                                                    {content.variants?.length || 0} variants
                                                </Td>
                                                <Td borderColor="surface.border" color="gray.400">
                                                    {new Date(content.createdAt).toLocaleDateString()}
                                                </Td>
                                                <Td borderColor="surface.border">
                                                    <Link to={`/content/${content._id}`}>
                                                        <Button size="sm" variant="ghost" color="brand.400">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </Td>
                                            </MotionBox>
                                        ))}
                                    </AnimatePresence>
                                </Tbody>
                            </Table>
                        )}

                        {/* Mobile Cards */}
                        {isMobile && (
                            <VStack p={4} spacing={3} align="stretch">
                                {filteredContents.map((content, i) => (
                                    <Link to={`/content/${content._id}`} key={content._id}>
                                        <MotionBox
                                            bg="surface.bg"
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor="surface.border"
                                            p={4}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            whileHover={{ borderColor: 'brand.500' }}
                                        >
                                            <Text color="white" fontWeight="500" mb={2}>{content.title}</Text>
                                            <HStack spacing={2} flexWrap="wrap">
                                                <Badge bg="brand.500" color="white" borderRadius="full" px={2}>
                                                    {content.type}
                                                </Badge>
                                                <StatusBadge status={content.orchestrationStatus} />
                                                <Text color="gray.500" fontSize="xs">
                                                    {content.variants?.length || 0} variants
                                                </Text>
                                            </HStack>
                                        </MotionBox>
                                    </Link>
                                ))}
                            </VStack>
                        )}
                    </>
                )}
            </MotionBox>
        </VStack>
    );
}

export default Dashboard;
