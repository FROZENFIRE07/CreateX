/**
 * Settings Page Component
 * User profile and account management
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Button,
    Divider,
    Avatar,
    Spinner,
    Center,
    Icon,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiLogOut,
    FiSave,
    FiTrash2,
    FiAlertTriangle,
    FiLink,
    FiExternalLink,
    FiCheck,
    FiXCircle,
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiKey,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../common';

const MotionBox = motion(Box);

// Settings Section Component
const SettingsSection = ({ title, icon, children, delay = 0 }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        bg="surface.card"
        borderRadius="xl"
        border="1px solid"
        borderColor="surface.border"
        overflow="hidden"
    >
        <HStack p={4} borderBottom="1px solid" borderColor="surface.border" bg="surface.bg">
            <Icon as={icon} color="brand.400" />
            <Heading size="sm" color="app.text">{title}</Heading>
        </HStack>
        <VStack p={5} spacing={5} align="stretch">
            {children}
        </VStack>
    </MotionBox>
);

// Settings Row Component
const SettingsRow = ({ label, description, children }) => (
    <HStack justify="space-between" align="start">
        <Box flex={1}>
            <Text color="app.text" fontWeight="500">{label}</Text>
            {description && <Text fontSize="sm" color="gray.500">{description}</Text>}
        </Box>
        <Box>{children}</Box>
    </HStack>
);

function Settings() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [settings, setSettings] = useState({
        name: '',
        email: '',
    });

    // Ayrshare integration state
    const [ayrshareStatus, setAyrshareStatus] = useState(null);
    const [ayrshareLoading, setAyrshareLoading] = useState(true);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [apiKeyHint, setApiKeyHint] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [savingKey, setSavingKey] = useState(false);

    useEffect(() => {
        loadSettings();
        loadAyrshareStatus();
        loadApiKeyStatus();
    }, []);

    const loadSettings = async () => {
        try {
            // Load user data
            const res = await api.get('/auth/profile');
            if (res.data.user) {
                setSettings(prev => ({
                    ...prev,
                    name: res.data.user.username || '',
                    email: res.data.user.email || '',
                }));
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAyrshareStatus = async () => {
        try {
            setAyrshareLoading(true);
            const res = await api.get('/publish/status');
            setAyrshareStatus(res.data);
        } catch (err) {
            console.error('Failed to load Ayrshare status:', err);
            setAyrshareStatus({ ayrshare_configured: false, mode: 'mock' });
        } finally {
            setAyrshareLoading(false);
        }
    };

    const loadApiKeyStatus = async () => {
        try {
            const res = await api.get('/auth/ayrshare-key');
            setApiKeyHint(res.data.keyHint || null);
        } catch (err) {
            console.error('Failed to load API key status:', err);
        }
    };

    const handleSaveApiKey = async () => {
        setSavingKey(true);
        try {
            await api.put('/auth/ayrshare-key', { apiKey: apiKeyInput });
            showToast.success(apiKeyInput ? 'Ayrshare API key saved securely' : 'Ayrshare API key removed');
            setApiKeyInput('');
            await loadApiKeyStatus();
            await loadAyrshareStatus();
        } catch (err) {
            showToast.error('Failed to save API key');
        } finally {
            setSavingKey(false);
        }
    };

    const handleRemoveApiKey = async () => {
        setSavingKey(true);
        try {
            await api.put('/auth/ayrshare-key', { apiKey: null });
            showToast.success('Ayrshare API key removed');
            setApiKeyHint(null);
            await loadAyrshareStatus();
        } catch (err) {
            showToast.error('Failed to remove API key');
        } finally {
            setSavingKey(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', {
                username: settings.name,
            });
            showToast.success('Settings saved successfully');
        } catch (err) {
            showToast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        showToast.info('You have been logged out');
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/auth/account');
            showToast.success('Account deleted');
            logout();
        } catch (err) {
            showToast.error('Failed to delete account');
        }
        onClose();
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="brand.500" />
            </Center>
        );
    }

    return (
        <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
            {/* Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Heading size="lg" color="app.text">Settings</Heading>
                <Text color="gray.400" mt={1}>Manage your account</Text>
            </MotionBox>

            {/* Profile Section */}
            <SettingsSection title="Profile" icon={FiUser} delay={0.1}>
                <HStack spacing={4}>
                    <Avatar
                        size="lg"
                        name={settings.name}
                        bg="brand.500"
                        color="white"
                    />
                    <VStack align="start" spacing={1}>
                        <Text color="app.text" fontWeight="600">{settings.name || 'User'}</Text>
                        <Text fontSize="sm" color="gray.500">{settings.email}</Text>
                    </VStack>
                </HStack>

                <Divider borderColor="surface.border" />

                <SettingsRow label="Display Name" description="Your public display name">
                    <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                        w="250px"
                        _hover={{ borderColor: 'surface.borderHover' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #FF6B01' }}
                    />
                </SettingsRow>

                <Divider borderColor="surface.border" />

                <SettingsRow label="Email" description="Email cannot be changed">
                    <Input
                        value={settings.email}
                        isReadOnly
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                        w="250px"
                        opacity={0.7}
                    />
                </SettingsRow>
            </SettingsSection>

            {/* Ayrshare Integration Section */}
            <SettingsSection title="Ayrshare Integration" icon={FiLink} delay={0.2}>
                <Text fontSize="sm" color="gray.400" mb={2}>
                    Connect your social media accounts via Ayrshare to enable live publishing to Twitter, LinkedIn, and Instagram.
                </Text>

                {/* API Key Input */}
                <Box
                    bg="surface.bg"
                    p={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="surface.border"
                >
                    <HStack spacing={2} mb={3}>
                        <Icon as={FiKey} color="brand.400" boxSize={4} />
                        <Text fontSize="sm" color="app.text" fontWeight="600">Ayrshare API Key</Text>
                    </HStack>

                    {apiKeyHint ? (
                        <VStack spacing={3} align="stretch">
                            <HStack
                                bg="rgba(74, 222, 128, 0.08)"
                                p={3}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="rgba(74, 222, 128, 0.2)"
                                justify="space-between"
                            >
                                <HStack spacing={2}>
                                    <Icon as={FiCheck} color="#4ADE80" boxSize={4} />
                                    <Text fontSize="sm" color="app.text">Key configured: <Text as="span" color="gray.500" fontFamily="mono">{apiKeyHint}</Text></Text>
                                </HStack>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    color="#F87171"
                                    _hover={{ bg: 'rgba(248, 113, 113, 0.1)' }}
                                    onClick={handleRemoveApiKey}
                                    isLoading={savingKey}
                                >
                                    Remove
                                </Button>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">Want to update? Enter a new key below to replace it.</Text>
                        </VStack>
                    ) : (
                        <Text fontSize="xs" color="gray.500" mb={2}>
                            Paste your Ayrshare API key to enable live publishing. Your key is encrypted and stored securely.
                        </Text>
                    )}

                    <HStack mt={3} spacing={2}>
                        <InputGroup size="sm">
                            <Input
                                type={showApiKey ? 'text' : 'password'}
                                placeholder="Enter your Ayrshare API key"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                bg="surface.bg"
                                border="1px solid"
                                borderColor="surface.border"
                                _hover={{ borderColor: 'surface.borderHover' }}
                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #FF6B01' }}
                                fontFamily="mono"
                                fontSize="xs"
                            />
                            <InputRightElement>
                                <IconButton
                                    size="xs"
                                    variant="ghost"
                                    icon={<Icon as={showApiKey ? FiEyeOff : FiEye} />}
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    aria-label={showApiKey ? 'Hide key' : 'Show key'}
                                    color="gray.500"
                                    _hover={{ color: 'brand.400' }}
                                />
                            </InputRightElement>
                        </InputGroup>
                        <Button
                            size="sm"
                            bg="brand.500"
                            color="white"
                            _hover={{ bg: 'brand.600' }}
                            onClick={handleSaveApiKey}
                            isLoading={savingKey}
                            isDisabled={!apiKeyInput.trim()}
                            minW="70px"
                        >
                            Save
                        </Button>
                    </HStack>
                </Box>

                {ayrshareLoading ? (
                    <HStack justify="center" py={4}>
                        <Spinner size="sm" color="brand.500" />
                        <Text fontSize="sm" color="gray.500">Checking Ayrshare status...</Text>
                    </HStack>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {/* Connection Status */}
                        <HStack
                            bg={ayrshareStatus?.ayrshare_configured ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)'}
                            p={4}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={ayrshareStatus?.ayrshare_configured ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}
                            justify="space-between"
                        >
                            <HStack spacing={3}>
                                <Icon
                                    as={ayrshareStatus?.ayrshare_configured ? FiCheck : FiXCircle}
                                    color={ayrshareStatus?.ayrshare_configured ? '#4ADE80' : '#F87171'}
                                    boxSize={5}
                                />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" color="app.text" fontSize="sm">
                                        {ayrshareStatus?.ayrshare_configured ? 'Ayrshare Connected' : 'Ayrshare Not Connected'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {ayrshareStatus?.ayrshare_configured
                                            ? `Mode: ${ayrshareStatus.mode || 'mock'}`
                                            : 'Add your API key above to enable live publishing'
                                        }
                                    </Text>
                                </VStack>
                            </HStack>
                            <Button
                                size="sm"
                                variant="ghost"
                                color="gray.500"
                                onClick={() => { loadAyrshareStatus(); loadApiKeyStatus(); }}
                                _hover={{ color: 'brand.400', bg: 'whiteAlpha.100' }}
                            >
                                <Icon as={FiRefreshCw} />
                            </Button>
                        </HStack>

                        {/* Connected Accounts */}
                        {ayrshareStatus?.ayrshare_user?.activeSocialAccounts?.length > 0 && (
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                                    Connected Accounts
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {ayrshareStatus.ayrshare_user.activeSocialAccounts.map((account) => (
                                        <HStack
                                            key={account}
                                            bg="surface.bg"
                                            p={3}
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor="surface.border"
                                            spacing={3}
                                        >
                                            <Icon as={FiCheck} color="#4ADE80" boxSize={4} />
                                            <Text fontSize="sm" color="app.text" textTransform="capitalize" fontWeight="500">
                                                {account}
                                            </Text>
                                            {ayrshareStatus.ayrshare_user.displayNames?.[account] && (
                                                <Text fontSize="xs" color="gray.500">
                                                    @{ayrshareStatus.ayrshare_user.displayNames[account]}
                                                </Text>
                                            )}
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {/* Supported Platforms */}
                        <Box>
                            <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                                Supported Platforms
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                                {['Twitter', 'LinkedIn', 'Instagram'].map((p) => (
                                    <Box
                                        key={p}
                                        bg="rgba(255, 107, 1, 0.08)"
                                        px={3}
                                        py={1.5}
                                        borderRadius="full"
                                        border="1px solid"
                                        borderColor="rgba(255, 107, 1, 0.2)"
                                    >
                                        <Text fontSize="xs" color="brand.400" fontWeight="600">{p}</Text>
                                    </Box>
                                ))}
                                {['Email', 'Blog'].map((p) => (
                                    <Box
                                        key={p}
                                        bg="surface.bg"
                                        px={3}
                                        py={1.5}
                                        borderRadius="full"
                                        border="1px solid"
                                        borderColor="surface.border"
                                    >
                                        <Text fontSize="xs" color="gray.500">{p} (mock only)</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </Box>

                        <Divider borderColor="surface.border" />

                        {/* Setup / Manage Ayrshare */}
                        <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" color="gray.400">
                                {ayrshareStatus?.ayrshare_configured
                                    ? 'Manage your Ayrshare account, connect additional social media profiles, or update your settings.'
                                    : 'Sign up for Ayrshare to get your API key and connect your social media accounts.'
                                }
                            </Text>
                            <HStack spacing={3}>
                                <Button
                                    size="sm"
                                    bg="brand.500"
                                    color="white"
                                    rightIcon={<FiExternalLink />}
                                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)' }}
                                    _active={{ transform: 'translateY(0)' }}
                                    onClick={() => window.open('https://app.ayrshare.com', '_blank', 'noopener,noreferrer')}
                                >
                                    {ayrshareStatus?.ayrshare_configured ? 'Manage Ayrshare' : 'Sign Up for Ayrshare'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderColor="surface.border"
                                    color="gray.400"
                                    rightIcon={<FiExternalLink />}
                                    _hover={{ borderColor: 'brand.400', color: 'brand.400' }}
                                    onClick={() => window.open('https://docs.ayrshare.com', '_blank', 'noopener,noreferrer')}
                                >
                                    Documentation
                                </Button>
                            </HStack>

                            {/* Quick Setup Guide */}
                            {!ayrshareStatus?.ayrshare_configured && (
                                <Box
                                    bg="surface.bg"
                                    p={4}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="surface.border"
                                >
                                    <Text fontSize="sm" color="app.text" fontWeight="600" mb={2}>
                                        Quick Setup Guide
                                    </Text>
                                    <VStack align="start" spacing={2}>
                                        {[
                                            '1. Sign up at ayrshare.com and get your API key',
                                            '2. Connect your Twitter, LinkedIn, and/or Instagram in Ayrshare dashboard',
                                            '3. Paste your API key in the field above and click Save',
                                            '4. Use the Live Mode toggle when creating content to publish for real',
                                        ].map((step, idx) => (
                                            <Text key={idx} fontSize="xs" color="gray.400">
                                                {step}
                                            </Text>
                                        ))}
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    </VStack>
                )}
            </SettingsSection>

            {/* Actions */}
            <HStack justify="space-between">
                <Button
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                    onClick={handleLogout}
                >
                    Log Out
                </Button>

                <HStack spacing={3}>
                    <Button
                        leftIcon={<FiTrash2 />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={onOpen}
                    >
                        Delete Account
                    </Button>
                    <Button
                        leftIcon={<FiSave />}
                        colorScheme="orange"
                        isLoading={saving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </HStack>
            </HStack>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="surface.card" border="1px solid" borderColor="surface.border">
                    <ModalHeader color="app.text">
                        <HStack>
                            <Icon as={FiAlertTriangle} color="error.400" />
                            <Text>Delete Account</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.500" />
                    <ModalBody>
                        <Text color="app.textSecondary">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} color="gray.400">
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteAccount}>
                            Delete Account
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}

export default Settings;
