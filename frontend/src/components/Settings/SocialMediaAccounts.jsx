/**
 * Social Media Accounts Management
 * Manage connected social accounts, authentication status, permissions, and platform preferences.
 */

import React, { useState, useEffect } from 'react';
import {
    Box, VStack, HStack, Heading, Text, Button, Switch, Divider,
    Badge, Icon, SimpleGrid, Tooltip, Select, useDisclosure, useColorMode,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
    Tag, TagLabel, Wrap, WrapItem, Alert, AlertIcon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTwitter, FiLinkedin, FiMail, FiInstagram, FiFileText,
    FiShield, FiRefreshCw, FiTrash2, FiCheck, FiAlertTriangle,
    FiXCircle, FiSettings, FiLink, FiClock, FiZap, FiEye,
} from 'react-icons/fi';

const MotionBox = motion(Box);

const getT = (dark) => ({
    primary: '#FF6B01', primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.25)', primaryGlowStrong: 'rgba(255,107,1,0.45)',
    primaryFaint: 'rgba(255,107,1,0.08)',
    bg: dark ? '#1A1A1A' : '#F7F7F8', bgDeep: dark ? '#111111' : '#EEEEF0',
    surface: dark ? '#353535' : '#FFFFFF', surfaceLight: dark ? '#444444' : '#F0F0F2',
    white: dark ? '#FFFFFF' : '#1A1A1A',
});

const getGlass = (dark) => ({
    bg: dark ? 'rgba(53,53,53,0.55)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
    border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
});

// Platform configuration with full details
const SOCIAL_PLATFORMS = [
    {
        id: 'twitter',
        name: 'Twitter / X',
        icon: FiTwitter,
        color: '#1DA1F2',
        permissions: ['Read tweets', 'Post tweets', 'Direct messages', 'Profile info'],
        description: 'Post tweets, threads, and engage with audience',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: FiLinkedin,
        color: '#0A66C2',
        permissions: ['Share posts', 'Company page access', 'Analytics', 'Profile info'],
        description: 'Professional content and company page management',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: FiInstagram,
        color: '#E4405F',
        permissions: ['Post media', 'Stories', 'Insights', 'Profile info'],
        description: 'Photos, reels, stories, and visual content',
    },
    {
        id: 'email',
        name: 'Email (SMTP)',
        icon: FiMail,
        color: '#EA4335',
        permissions: ['Send emails', 'Newsletter distribution', 'Contact list'],
        description: 'Email campaigns and newsletter distribution',
    },
    {
        id: 'blog',
        name: 'Blog (CMS)',
        icon: FiFileText,
        color: '#10B981',
        permissions: ['Create posts', 'Edit posts', 'Media upload', 'SEO settings'],
        description: 'Blog articles via WordPress, Medium, or custom CMS',
    },
];

const STATUS_CONFIG = {
    connected: { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', label: 'Connected', icon: FiCheck },
    needs_reauth: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', label: 'Needs Re-auth', icon: FiAlertTriangle },
    disconnected: { color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Not Connected', icon: FiXCircle },
};

const STORAGE_KEY = 'createx_social_accounts';

function loadAccounts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    // Default state
    return SOCIAL_PLATFORMS.reduce((acc, p) => {
        acc[p.id] = {
            status: 'disconnected',
            connectedAt: null,
            lastRefresh: null,
            username: '',
            isDefault: p.id === 'twitter',
            autoPublish: false,
            schedulingEnabled: false,
            preferences: {},
        };
        return acc;
    }, {});
}

function saveAccounts(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Account Card ───
function AccountCard({ platform, account, onConnect, onDisconnect, onReauth, onViewPerms, onUpdateSetting, T, glass }) {
    const statusCfg = STATUS_CONFIG[account.status] || STATUS_CONFIG.disconnected;
    const isConnected = account.status === 'connected';

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            {...glass}
            rounded="2xl"
            overflow="hidden"
            transition={{ duration: 0.3 }}
        >
            {/* Top accent */}
            <Box h="3px" bg={isConnected ? platform.color : 'rgba(255,255,255,0.06)'} />

            <VStack spacing={4} p={5} align="stretch">
                {/* Header */}
                <HStack justify="space-between" align="start">
                    <HStack spacing={3}>
                        <Box
                            bg={isConnected ? `${platform.color}20` : T.surface}
                            p={2.5} rounded="xl"
                            border="1px solid"
                            borderColor={isConnected ? `${platform.color}40` : 'rgba(255,255,255,0.06)'}
                            transition="all 0.2s"
                        >
                            <Icon as={platform.icon} color={isConnected ? platform.color : 'gray.500'} boxSize={5} />
                        </Box>
                        <VStack spacing={0} align="start">
                            <Text fontWeight="700" color={T.white} fontSize="sm">{platform.name}</Text>
                            <Text fontSize="xs" color="gray.500">{platform.description}</Text>
                        </VStack>
                    </HStack>

                    {/* Status badge */}
                    <Badge
                        bg={statusCfg.bg}
                        color={statusCfg.color}
                        border="1px solid"
                        borderColor={statusCfg.border}
                        rounded="full" px={3} py={1}
                        fontSize="2xs" fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="wider"
                    >
                        <HStack spacing={1}>
                            <Icon as={statusCfg.icon} boxSize={3} />
                            <Text>{statusCfg.label}</Text>
                        </HStack>
                    </Badge>
                </HStack>

                {/* Connected info */}
                {isConnected && account.username && (
                    <HStack bg={T.bgDeep} rounded="xl" px={3} py={2} spacing={2}>
                        <Icon as={FiLink} color="gray.500" boxSize={3} />
                        <Text fontSize="xs" color="gray.400">@{account.username}</Text>
                        {account.connectedAt && (
                            <>
                                <Text fontSize="xs" color="gray.600">•</Text>
                                <Icon as={FiClock} color="gray.600" boxSize={3} />
                                <Text fontSize="xs" color="gray.600">Connected {account.connectedAt}</Text>
                            </>
                        )}
                    </HStack>
                )}

                <Divider borderColor="rgba(255,255,255,0.06)" />

                {/* Settings (only when connected) */}
                {isConnected && (
                    <VStack spacing={3} align="stretch">
                        {/* Auto-publish */}
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Icon as={FiZap} color="gray.500" boxSize={3.5} />
                                <Text fontSize="xs" color="gray.400">Auto-publish</Text>
                            </HStack>
                            <Switch
                                colorScheme="orange" size="sm"
                                isChecked={account.autoPublish}
                                onChange={(e) => onUpdateSetting(platform.id, 'autoPublish', e.target.checked)}
                            />
                        </HStack>

                        {/* Scheduling */}
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Icon as={FiClock} color="gray.500" boxSize={3.5} />
                                <Text fontSize="xs" color="gray.400">Scheduling</Text>
                            </HStack>
                            <Switch
                                colorScheme="orange" size="sm"
                                isChecked={account.schedulingEnabled}
                                onChange={(e) => onUpdateSetting(platform.id, 'schedulingEnabled', e.target.checked)}
                            />
                        </HStack>

                        {/* Default account */}
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Icon as={FiCheck} color="gray.500" boxSize={3.5} />
                                <Text fontSize="xs" color="gray.400">Default posting account</Text>
                            </HStack>
                            <Switch
                                colorScheme="orange" size="sm"
                                isChecked={account.isDefault}
                                onChange={(e) => onUpdateSetting(platform.id, 'isDefault', e.target.checked)}
                            />
                        </HStack>
                    </VStack>
                )}

                {/* Action buttons */}
                <HStack spacing={2} pt={1}>
                    {account.status === 'disconnected' && (
                        <Button
                            size="sm" flex={1}
                            bg={platform.color} color={T.white}
                            rounded="xl" fontWeight="600"
                            leftIcon={<FiLink />}
                            _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                            _active={{ transform: 'translateY(0)' }}
                            onClick={() => onConnect(platform.id)}
                            boxShadow={`0 0 15px ${platform.color}30`}
                        >
                            Connect
                        </Button>
                    )}

                    {account.status === 'needs_reauth' && (
                        <Button
                            size="sm" flex={1}
                            bg="#FBBF2420" color="#FBBF24"
                            border="1px solid" borderColor="#FBBF2440"
                            rounded="xl" fontWeight="600"
                            leftIcon={<FiRefreshCw />}
                            _hover={{ bg: '#FBBF2430', transform: 'translateY(-1px)' }}
                            onClick={() => onReauth(platform.id)}
                        >
                            Re-authenticate
                        </Button>
                    )}

                    {isConnected && (
                        <>
                            <Tooltip label="View permissions" placement="top" hasArrow>
                                <Button
                                    size="sm" variant="ghost"
                                    color="gray.500" rounded="xl"
                                    _hover={{ bg: 'whiteAlpha.100', color: T.white }}
                                    onClick={() => onViewPerms(platform)}
                                >
                                    <Icon as={FiEye} boxSize={4} />
                                </Button>
                            </Tooltip>
                            <Tooltip label="Refresh token" placement="top" hasArrow>
                                <Button
                                    size="sm" variant="ghost"
                                    color="gray.500" rounded="xl"
                                    _hover={{ bg: 'whiteAlpha.100', color: T.primary }}
                                    onClick={() => onReauth(platform.id)}
                                >
                                    <Icon as={FiRefreshCw} boxSize={4} />
                                </Button>
                            </Tooltip>
                            <Tooltip label="Disconnect" placement="top" hasArrow>
                                <Button
                                    size="sm" variant="ghost"
                                    color="gray.500" rounded="xl"
                                    _hover={{ bg: 'rgba(248,113,113,0.1)', color: '#F87171' }}
                                    onClick={() => onDisconnect(platform.id)}
                                >
                                    <Icon as={FiTrash2} boxSize={4} />
                                </Button>
                            </Tooltip>
                        </>
                    )}
                </HStack>
            </VStack>
        </MotionBox>
    );
}

// ─── Main Component ───
export default function SocialMediaAccounts() {
    const { colorMode } = useColorMode();
    const dark = colorMode === 'dark';
    const T = getT(dark);
    const glass = getGlass(dark);
    const [accounts, setAccounts] = useState(loadAccounts);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => { saveAccounts(accounts); }, [accounts]);

    const handleConnect = (platformId) => {
        // Simulate OAuth connection
        const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
        setAccounts((prev) => ({
            ...prev,
            [platformId]: {
                ...prev[platformId],
                status: 'connected',
                connectedAt: new Date().toLocaleDateString(),
                lastRefresh: new Date().toISOString(),
                username: `${platform.name.toLowerCase().replace(/[^a-z]/g, '')}_user`,
            },
        }));
    };

    const handleDisconnect = (platformId) => {
        setAccounts((prev) => ({
            ...prev,
            [platformId]: {
                ...prev[platformId],
                status: 'disconnected',
                connectedAt: null,
                lastRefresh: null,
                username: '',
                autoPublish: false,
                schedulingEnabled: false,
            },
        }));
    };

    const handleReauth = (platformId) => {
        setAccounts((prev) => ({
            ...prev,
            [platformId]: {
                ...prev[platformId],
                status: 'connected',
                lastRefresh: new Date().toISOString(),
            },
        }));
    };

    const handleViewPerms = (platform) => {
        setSelectedPlatform(platform);
        onOpen();
    };

    const handleUpdateSetting = (platformId, key, value) => {
        setAccounts((prev) => ({
            ...prev,
            [platformId]: { ...prev[platformId], [key]: value },
        }));
    };

    const connectedCount = Object.values(accounts).filter((a) => a.status === 'connected').length;
    const needsReauthCount = Object.values(accounts).filter((a) => a.status === 'needs_reauth').length;

    return (
        <VStack spacing={6} align="stretch">

            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
                <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                            <Icon as={FiShield} color={T.primary} boxSize={5} />
                            <Heading size="md" color={T.white}>Social Media Accounts</Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                            Manage connections, permissions, and posting preferences
                        </Text>
                    </VStack>
                    <HStack spacing={2}>
                        <Badge bg={STATUS_CONFIG.connected.bg} color={STATUS_CONFIG.connected.color} rounded="full" px={3} py={1} fontSize="xs" border="1px solid" borderColor={STATUS_CONFIG.connected.border}>
                            {connectedCount} Connected
                        </Badge>
                        {needsReauthCount > 0 && (
                            <Badge bg={STATUS_CONFIG.needs_reauth.bg} color={STATUS_CONFIG.needs_reauth.color} rounded="full" px={3} py={1} fontSize="xs" border="1px solid" borderColor={STATUS_CONFIG.needs_reauth.border}>
                                {needsReauthCount} Needs Attention
                            </Badge>
                        )}
                    </HStack>
                </HStack>
            </MotionBox>

            {/* Alert banner */}
            {needsReauthCount > 0 && (
                <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Alert status="warning" bg="rgba(251,191,36,0.08)" rounded="xl" border="1px solid" borderColor="rgba(251,191,36,0.2)">
                        <AlertIcon color="#FBBF24" />
                        <Text fontSize="sm" color="gray.300">
                            {needsReauthCount} account(s) need re-authentication. Please reconnect to continue posting.
                        </Text>
                    </Alert>
                </MotionBox>
            )}

            {/* Account Cards Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {SOCIAL_PLATFORMS.map((platform, idx) => (
                    <MotionBox
                        key={platform.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                    >
                        <AccountCard
                            platform={platform}
                            account={accounts[platform.id]}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                            onReauth={handleReauth}
                            onViewPerms={handleViewPerms}
                            onUpdateSetting={handleUpdateSetting}
                            T={T}
                            glass={glass}
                        />
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Global Settings */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                {...glass}
                rounded="2xl" p={5}
            >
                <HStack spacing={2} mb={4}>
                    <Icon as={FiSettings} color={T.primary} boxSize={4} />
                    <Heading size="sm" color={T.white}>Global Preferences</Heading>
                </HStack>

                <VStack spacing={4} align="stretch">
                    {/* Default Account */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={T.white} fontWeight="600">Default Posting Account</Text>
                            <Text fontSize="xs" color="gray.500">Which account to use when publishing content</Text>
                        </VStack>
                        <Select
                            size="sm" w="200px" rounded="xl"
                            bg={T.bgDeep} color={T.white}
                            border="1px solid" borderColor="rgba(255,255,255,0.08)"
                            _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                            _focus={{ borderColor: T.primary }}
                            value={Object.entries(accounts).find(([, a]) => a.isDefault)?.[0] || ''}
                            onChange={(e) => {
                                const newDefault = e.target.value;
                                setAccounts((prev) => {
                                    const updated = { ...prev };
                                    Object.keys(updated).forEach((k) => { updated[k] = { ...updated[k], isDefault: k === newDefault }; });
                                    return updated;
                                });
                            }}
                        >
                            {SOCIAL_PLATFORMS.filter((p) => accounts[p.id]?.status === 'connected').map((p) => (
                                <option key={p.id} value={p.id} style={{ background: T.bg }}>{p.name}</option>
                            ))}
                        </Select>
                    </HStack>

                    <Divider borderColor="rgba(255,255,255,0.06)" />

                    {/* Global auto-publish */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={T.white} fontWeight="600">Global Auto-Publish</Text>
                            <Text fontSize="xs" color="gray.500">Automatically publish to all connected accounts</Text>
                        </VStack>
                        <Switch
                            colorScheme="orange" size="md"
                            onChange={(e) => {
                                setAccounts((prev) => {
                                    const updated = { ...prev };
                                    Object.keys(updated).forEach((k) => {
                                        if (updated[k].status === 'connected') {
                                            updated[k] = { ...updated[k], autoPublish: e.target.checked };
                                        }
                                    });
                                    return updated;
                                });
                            }}
                        />
                    </HStack>

                    <Divider borderColor="rgba(255,255,255,0.06)" />

                    {/* Global scheduling */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={T.white} fontWeight="600">Enable Scheduling</Text>
                            <Text fontSize="xs" color="gray.500">Allow scheduled posting across all platforms</Text>
                        </VStack>
                        <Switch
                            colorScheme="orange" size="md"
                            onChange={(e) => {
                                setAccounts((prev) => {
                                    const updated = { ...prev };
                                    Object.keys(updated).forEach((k) => {
                                        if (updated[k].status === 'connected') {
                                            updated[k] = { ...updated[k], schedulingEnabled: e.target.checked };
                                        }
                                    });
                                    return updated;
                                });
                            }}
                        />
                    </HStack>
                </VStack>
            </MotionBox>

            {/* Permissions Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
                <ModalContent bg={T.bg} border="1px solid" borderColor="rgba(255,255,255,0.08)" rounded="2xl">
                    {selectedPlatform && (
                        <>
                            <ModalHeader pb={2}>
                                <HStack spacing={3}>
                                    <Box bg={`${selectedPlatform.color}20`} p={2} rounded="lg">
                                        <Icon as={selectedPlatform.icon} color={selectedPlatform.color} boxSize={5} />
                                    </Box>
                                    <VStack spacing={0} align="start">
                                        <Heading size="sm" color={T.white}>{selectedPlatform.name}</Heading>
                                        <Text fontSize="xs" color="gray.500">Granted Permissions</Text>
                                    </VStack>
                                </HStack>
                            </ModalHeader>
                            <ModalCloseButton color="gray.500" />
                            <ModalBody>
                                <VStack spacing={3} align="stretch">
                                    {selectedPlatform.permissions.map((perm, idx) => (
                                        <HStack
                                            key={idx}
                                            bg={T.surface}
                                            rounded="xl" px={4} py={3}
                                            border="1px solid" borderColor="rgba(255,255,255,0.06)"
                                        >
                                            <Icon as={FiCheck} color="#4ADE80" boxSize={4} />
                                            <Text fontSize="sm" color={T.white}>{perm}</Text>
                                        </HStack>
                                    ))}

                                    <Divider borderColor="rgba(255,255,255,0.06)" my={2} />

                                    <HStack bg={T.bgDeep} rounded="xl" px={4} py={3}>
                                        <Icon as={FiClock} color="gray.500" boxSize={3.5} />
                                        <Text fontSize="xs" color="gray.500">
                                            Last token refresh: {accounts[selectedPlatform.id]?.lastRefresh
                                                ? new Date(accounts[selectedPlatform.id].lastRefresh).toLocaleString()
                                                : 'Never'}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </ModalBody>
                            <ModalFooter pt={2}>
                                <HStack spacing={2}>
                                    <Button
                                        size="sm" variant="ghost"
                                        color="gray.500" rounded="xl"
                                        leftIcon={<FiRefreshCw />}
                                        _hover={{ bg: 'whiteAlpha.100', color: T.primary }}
                                        onClick={() => { handleReauth(selectedPlatform.id); onClose(); }}
                                    >
                                        Refresh Token
                                    </Button>
                                    <Button
                                        size="sm"
                                        bg="rgba(248,113,113,0.1)" color="#F87171"
                                        border="1px solid" borderColor="rgba(248,113,113,0.2)"
                                        rounded="xl"
                                        leftIcon={<FiTrash2 />}
                                        _hover={{ bg: 'rgba(248,113,113,0.2)' }}
                                        onClick={() => { handleDisconnect(selectedPlatform.id); onClose(); }}
                                    >
                                        Disconnect
                                    </Button>
                                </HStack>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </VStack>
    );
}
