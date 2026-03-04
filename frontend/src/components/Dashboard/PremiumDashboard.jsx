import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Button, Badge,
    IconButton, Select, Divider, Avatar, Progress,
    Grid, GridItem, Tooltip, Icon, Center, Textarea, useToast,
    SimpleGrid, SkeletonText
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiActivity, FiTerminal, FiSettings, FiZap, FiCheckCircle,
    FiCopy, FiDownload, FiCpu, FiTrendingUp, FiArrowRight,
    FiEdit3, FiPlay, FiServer, FiShield, FiSend, FiStar, FiRefreshCw
} from 'react-icons/fi';
import { SiLinkedin, SiX } from 'react-icons/si';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// --- DEMO DATA ---
const ACCOUNTS = {
    perfect: {
        id: 'perfect',
        name: 'GrowthOS (PerfectBrand)',
        consistency: 98,
        dollarsSaved: 12450,
        timeSaved: 142,
        originalText: "We are announcing our new software. It is very good. Buy it now.",
        aiVariant: "Introducing our next-generation software platform—engineered to accelerate your workflow and scale your growth. Transform the way you work today. 🚀",
        keywords: ["next-generation", "accelerate", "scale", "transform"],
        theme: 'green'
    },
    messy: {
        id: 'messy',
        name: 'ChaosCorp (MessyBrand)',
        consistency: 43,
        dollarsSaved: 120,
        timeSaved: 4,
        originalText: "yo we got new stuff, check it",
        aiVariant: "Hey everyone! We just dropped some amazing new features. You definitely want to check this out! 🔥",
        keywords: ["amazing", "features", "dropped"],
        theme: 'red'
    }
};

const COMMANDS = [
    { label: 'Make trendier', icon: '🔥', color: 'orange.400' },
    { label: 'More corporate', icon: '💼', color: 'blue.400' },
    { label: 'Shorten 20%', icon: '✂️', color: 'pink.400' },
    { label: 'Add statistics', icon: '📊', color: 'green.400' }
];

// --- COMPONENTS ---

// 1. Live Node Map
const LiveNodeMap = ({ isRunning }) => {
    const nodes = [
        { id: 'manager', label: 'Manager', icon: FiServer },
        { id: 'ingest', label: 'Ingest', icon: FiActivity },
        { id: 'reviewer', label: 'Reviewer', icon: FiShield },
        { id: 'publisher', label: 'Publisher', icon: FiSend }
    ];

    return (
        <Box bg="whiteAlpha.50" rounded="2xl" p={5} border="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
            <Box position="absolute" top={-10} right={-10} bg="brand.500" w={32} h={32} rounded="full" filter="blur(60px)" opacity={0.3} />
            <HStack justify="space-between" mb={6}>
                <Heading size="sm" color="white" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiCpu} color="cyan.400" /> Agent Cluster
                </Heading>
                {isRunning && <Badge colorScheme="cyan" variant="subtle" animation="pulse 2s infinite">Processing</Badge>}
            </HStack>

            <Flex justify="space-between" align="center" position="relative">
                <Box position="absolute" top="16px" left="20px" right="20px" h="2px" bg="whiteAlpha.100" zIndex={0}>
                    {isRunning && (
                        <MotionBox
                            h="100%"
                            bgGradient="linear(to-r, transparent, cyan.400, transparent)"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    )}
                </Box>

                {nodes.map((node, i) => (
                    <VStack key={node.id} zIndex={1} spacing={2}>
                        <MotionBox
                            w={8} h={8}
                            rounded="full"
                            bg="surface.card"
                            border="2px solid"
                            borderColor={isRunning ? "cyan.400" : "whiteAlpha.300"}
                            display="flex" alignItems="center" justify="center"
                            animate={isRunning ? { boxShadow: ['0 0 0px #22d3ee', '0 0 15px #22d3ee', '0 0 0px #22d3ee'] } : {}}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        >
                            <Icon as={node.icon} color={isRunning ? "cyan.300" : "gray.500"} boxSize={4} />
                        </MotionBox>
                        <Text fontSize="xs" color="gray.400" fontWeight="500">{node.label}</Text>
                    </VStack>
                ))}
            </Flex>
        </Box>
    );
};

// 2. Brand Health
const BrandHealth = ({ account }) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
            <Box p={5} bg="whiteAlpha.50" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
                <HStack mb={2}><Icon as={FiTrendingUp} color="green.400" /><Text fontSize="sm" color="gray.400">Total Savings</Text></HStack>
                <Heading size="lg" color="white">${account.dollarsSaved.toLocaleString()}</Heading>
            </Box>
            <Box p={5} bg="whiteAlpha.50" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
                <HStack mb={2}><Icon as={FiZap} color="purple.400" /><Text fontSize="sm" color="gray.400">Hours Saved</Text></HStack>
                <Heading size="lg" color="white">{account.timeSaved}h</Heading>
            </Box>
            <Box p={5} bg="whiteAlpha.50" rounded="2xl" border="1px solid" borderColor={account.consistency > 80 ? "green.500" : "red.500"} position="relative" overflow="hidden">
                <Box position="absolute" bottom={0} left={0} h="4px" w={`${account.consistency}%`} bg={account.consistency > 80 ? "green.400" : "red.400"} />
                <HStack justify="space-between" mb={2}>
                    <HStack><Icon as={FiCheckCircle} color={account.consistency > 80 ? "green.400" : "red.400"} /><Text fontSize="sm" color="gray.400">Consistency</Text></HStack>
                </HStack>
                <Heading size="lg" color={account.consistency > 80 ? "green.300" : "red.300"}>{account.consistency}%</Heading>
            </Box>
        </SimpleGrid>
    );
};

export default function PremiumDashboard() {
    const [activeAccount, setActiveAccount] = useState(ACCOUNTS.perfect);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const logsRef = useRef(null);
    const toast = useToast();

    const handleRun = () => {
        setIsRunning(true);
        setLogs([]);
        let c = 0;
        const interval = setInterval(() => {
            if (c < activeAccount.logs.length) {
                setLogs(prev => [...prev, activeAccount.logs[c]]);
                c++;
            } else {
                clearInterval(interval);
                setIsRunning(false);
                toast({
                    title: 'Orchestration Complete',
                    description: 'Multi-platform content generated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            }
        }, 800);
    };

    useEffect(() => {
        if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }, [logs]);

    // Magic Editor Highlight
    const renderHighlighted = (text, keywords) => {
        let res = text;
        keywords.forEach(kw => {
            const regex = new RegExp(`(${kw})`, 'gi');
            res = res.replace(regex, `<span style="color: #22d3ee; font-weight: bold; text-shadow: 0 0 10px rgba(34, 211, 238, 0.4)">$1</span>`);
        });
        return <div dangerouslySetInnerHTML={{ __html: res }} />;
    };

    return (
        <Box minH="100vh" bg="#0A0F1C" color="white" p={{ base: 4, xl: 8 }} pb={20} position="relative" overflow="hidden">
            {/* Background Gradients */}
            <Box position="fixed" top="-10%" left="-10%" w="50vw" h="50vw" bg="brand.500" filter="blur(150px)" opacity={0.1} zIndex={0} pointerEvents="none" />
            <Box position="fixed" bottom="-10%" right="-10%" w="50vw" h="50vw" bg="cyan.500" filter="blur(150px)" opacity={0.05} zIndex={0} pointerEvents="none" />

            <Flex maxW="1600px" mx="auto" direction="column" zIndex={1} position="relative">

                {/* HEADER */}
                <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
                    <HStack spacing={4}>
                        <Box bgGradient="linear(to-br, brand.400, cyan.400)" p={3} rounded="xl" shadow="0 0 20px rgba(99,102,241,0.4)">
                            <Icon as={FiZap} boxSize={6} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Heading size="lg" letterSpacing="tight">SACO Command Center</Heading>
                            <Text color="gray.400" fontSize="sm">Systemic AI Content Orchestrator</Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={4} bg="whiteAlpha.50" p={2} rounded="xl" border="1px solid" borderColor="whiteAlpha.200">
                        <Text fontSize="sm" color="gray.400" ml={2} fontWeight="600">WORKSPACE:</Text>
                        <Select
                            value={activeAccount.id}
                            onChange={(e) => setActiveAccount(ACCOUNTS[e.target.value])}
                            variant="unstyled"
                            fontWeight="bold"
                            color="white"
                            w="220px"
                            cursor="pointer"
                            _hover={{ color: 'cyan.300' }}
                        >
                            <option value="perfect" style={{ background: '#0F172A', color: 'white' }}>GrowthOS (PerfectBrand)</option>
                            <option value="messy" style={{ background: '#0F172A', color: 'white' }}>ChaosCorp (MessyBrand)</option>
                        </Select>
                    </HStack>
                </Flex>

                <Grid templateColumns={{ base: '1fr', lg: '7fr 3fr' }} gap={8}>

                    {/* L E F T   P A N E L */}
                    <GridItem display="flex" flexDirection="column" gap={8}>

                        {/* Brand Health */}
                        <BrandHealth account={activeAccount} />

                        {/* Magic Editor */}
                        <Box bg="whiteAlpha.50" rounded="3xl" border="1px solid" borderColor="whiteAlpha.100" p={6} position="relative" overflow="hidden">
                            <Box position="absolute" top={0} left={0} w="100%" h="1px" bgGradient="linear(to-r, transparent, brand.400, transparent)" />

                            <Flex justify="space-between" align="center" mb={6}>
                                <HStack>
                                    <Icon as={FiEdit3} color="cyan.400" />
                                    <Heading size="md">Magic Split Editor</Heading>
                                </HStack>
                                <Button
                                    size="sm"
                                    leftIcon={<FiPlay />}
                                    colorScheme="brand"
                                    bgGradient="linear(to-r, brand.500, cyan.500)"
                                    onClick={handleRun}
                                    isLoading={isRunning}
                                    loadingText="Orchestrating..."
                                    shadow="0 0 15px rgba(34,211,238,0.4)"
                                    _hover={{ shadow: "0 0 25px rgba(34,211,238,0.6)" }}
                                    rounded="full" px={6}
                                >
                                    Generate Content
                                </Button>
                            </Flex>

                            <Grid templateColumns="1fr 1fr" gap={6}>
                                <Box>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} pl={1}>RAW INPUT</Text>
                                    <Box bg="blackAlpha.400" p={5} rounded="2xl" border="1px solid" borderColor="whiteAlpha.50" minH="200px" color="gray.300" fontSize="md">
                                        {activeAccount.originalText}
                                    </Box>
                                </Box>

                                <Box position="relative">
                                    <Text fontSize="xs" fontWeight="bold" color="cyan.400" mb={2} pl={1}>AI ORCHESTRATED OUTPUT</Text>

                                    {isRunning ? (
                                        <Box bg="blackAlpha.400" p={5} rounded="2xl" border="1px solid" borderColor="cyan.500" minH="200px" position="relative" overflow="hidden">
                                            <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" startColor="cyan.900" endColor="cyan.600" />
                                            <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="cyan.500" opacity={0.05} animation="pulse 1.5s infinite" />
                                        </Box>
                                    ) : (
                                        <MotionBox
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            bg="blackAlpha.400" p={5} rounded="2xl" border="1px solid" borderColor="whiteAlpha.100" minH="200px" color="white" fontSize="md"
                                            boxShadow="inset 0 0 20px rgba(0,0,0,0.5)"
                                        >
                                            {logs.length > 0 || !isRunning ? renderHighlighted(activeAccount.aiVariant, activeAccount.keywords) : null}
                                        </MotionBox>
                                    )}

                                    {/* Quick Commands */}
                                    <HStack spacing={2} mt={4} overflowX="auto" pb={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                                        {COMMANDS.map((cmd, i) => (
                                            <Button key={i} size="xs" variant="outline" rounded="full" borderColor="whiteAlpha.200" color="gray.300" bg="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.200', borderColor: cmd.color, color: 'white' }}>
                                                <span style={{ marginRight: '6px' }}>{cmd.icon}</span> {cmd.label}
                                            </Button>
                                        ))}
                                    </HStack>
                                </Box>
                            </Grid>
                        </Box>

                        {/* A/B Previews */}
                        <Box>
                            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                                <Icon as={FiStar} color="yellow.400" /> Multi-Platform Mockups
                            </Heading>

                            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={6}>
                                {/* Twitter Mockup */}
                                <MotionBox whileHover={{ y: -5 }} bg="surface.card" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100" p={6} shadow="xl">
                                    <HStack justify="space-between" mb={4}>
                                        <HStack><Icon as={SiX} /><Text fontWeight="bold">X (Twitter)</Text></HStack>
                                        <Badge colorScheme="green" variant="subtle" rounded="full" px={3} py={1}>Optimal Length</Badge>
                                    </HStack>
                                    <HStack mb={4}>
                                        <Avatar size="sm" src="https://bit.ly/dan-abramov" />
                                        <VStack spacing={0} align="start">
                                            <Text fontWeight="bold" fontSize="sm">{activeAccount.name}</Text>
                                            <Text color="gray.500" fontSize="xs">@brand_handle</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.200" mb={4}>
                                        {activeAccount.aiVariant}
                                    </Text>
                                    <Box w="100%" h="120px" rounded="xl" bgGradient="linear(to-br, brand.800, cyan.800)" mb={4}></Box>
                                    <HStack color="gray.500" fontSize="sm" spacing={6}>
                                        <HStack><Icon as={FiActivity} /><Text>1.2k</Text></HStack>
                                        <HStack><Icon as={FiRefreshCw} /><Text>342</Text></HStack>
                                    </HStack>
                                </MotionBox>

                                {/* LinkedIn Mockup */}
                                <MotionBox whileHover={{ y: -5 }} bg="surface.card" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100" p={6} shadow="xl">
                                    <HStack justify="space-between" mb={4}>
                                        <HStack><Icon as={SiLinkedin} color="#0A66C2" /><Text fontWeight="bold">LinkedIn</Text></HStack>
                                        <Badge colorScheme="blue" variant="subtle" rounded="full" px={3} py={1}>Professional Tone</Badge>
                                    </HStack>
                                    <HStack mb={4}>
                                        <Avatar size="sm" src="https://bit.ly/kent-c-dodds" />
                                        <VStack spacing={0} align="start">
                                            <Text fontWeight="bold" fontSize="sm">{activeAccount.name}</Text>
                                            <Text color="gray.500" fontSize="xs">1.5M Followers • Promoted</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.200" mb={4} noOfLines={3}>
                                        {activeAccount.aiVariant}
                                    </Text>
                                    <Box w="100%" h="120px" rounded="xl" bgGradient="linear(to-tr, blue.800, purple.800)" display="flex" alignItems="center" justifyContent="center">
                                        <Button size="sm" colorScheme="blue">Learn More</Button>
                                    </Box>
                                </MotionBox>
                            </Grid>
                        </Box>
                    </GridItem>

                    {/* R I G H T   P A N E L */}
                    <GridItem display="flex" flexDirection="column" gap={6}>

                        <LiveNodeMap isRunning={isRunning} />

                        {/* System Logs (Terminal) */}
                        <Box flex={1} bg="black" rounded="2xl" border="1px solid" borderColor="whiteAlpha.200" p={5} display="flex" flexDirection="column" minH="400px" shadow="inset 0 0 30px rgba(0,0,0,0.8)">
                            <HStack mb={4} justify="space-between">
                                <HStack>
                                    <Icon as={FiTerminal} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="bold" color="gray.400" letterSpacing="widest">SYSTEM_LOGS</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={2} h={2} rounded="full" bg="red.500" />
                                    <Box w={2} h={2} rounded="full" bg="yellow.500" />
                                    <Box w={2} h={2} rounded="full" bg="green.500" />
                                </HStack>
                            </HStack>

                            <Divider borderColor="whiteAlpha.200" mb={4} />

                            <Box flex={1} overflowY="auto" ref={logsRef} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bg: 'whiteAlpha.300', rounded: 'full' } }}>
                                <AnimatePresence>
                                    {logs.map((log, index) => {
                                        const isWarning = log.includes('mismatch') || log.includes('Flagged');
                                        const isSuccess = log.includes('Approved');
                                        const color = isWarning ? 'yellow.400' : isSuccess ? 'green.400' : 'cyan.300';
                                        return (
                                            <MotionBox
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                fontFamily="monospace"
                                                fontSize="xs"
                                                color={color}
                                                mb={2}
                                                lineHeight="1.5"
                                            >
                                                <Text as="span" color="gray.500">[{new Date().toLocaleTimeString().split(' ')[0]}]</Text> {log}
                                            </MotionBox>
                                        );
                                    })}
                                </AnimatePresence>
                                {isRunning && (
                                    <HStack mt={2}>
                                        <Text fontFamily="monospace" fontSize="xs" color="gray.500">_</Text>
                                        <MotionBox animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} w={2} h={3} bg="cyan.400" />
                                    </HStack>
                                )}
                                {!isRunning && logs.length === 0 && (
                                    <Text fontFamily="monospace" fontSize="xs" color="gray.600">Waiting for orchestration payload...</Text>
                                )}
                            </Box>
                        </Box>

                        {/* Export Actions */}
                        <VStack spacing={3}>
                            <Button w="100%" size="lg" leftIcon={<FiCopy />} bg="whiteAlpha.100" color="white" _hover={{ bg: 'whiteAlpha.200' }} border="1px solid" borderColor="whiteAlpha.200">
                                Copy All Variants
                            </Button>
                            <Button w="100%" size="lg" leftIcon={<FiSend />} colorScheme="brand" bgGradient="linear(to-r, brand.500, cyan.500)">
                                Deploy to Integrations
                            </Button>
                        </VStack>

                    </GridItem>

                </Grid>
            </Flex>
        </Box>
    );
}
