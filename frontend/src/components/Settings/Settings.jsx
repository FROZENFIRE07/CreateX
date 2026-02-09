/**
 * Settings Page Component
 * User preferences and account management
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    Button,
    Switch,
    Divider,
    Avatar,
    Badge,
    SimpleGrid,
    FormControl,
    FormLabel,
    Select,
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
    FiBell,
    FiShield,
    FiMoon,
    FiSun,
    FiGlobe,
    FiLogOut,
    FiSave,
    FiTrash2,
    FiCheck,
    FiAlertTriangle,
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
            <Heading size="sm" color="white">{title}</Heading>
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
            <Text color="white" fontWeight="500">{label}</Text>
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
        notifications: {
            email: true,
            push: false,
            orchestrationComplete: true,
            weeklyDigest: false,
        },
        preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'auto',
        },
    });

    useEffect(() => {
        loadSettings();
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
                <Heading size="lg" color="white">Settings</Heading>
                <Text color="gray.400" mt={1}>Manage your account and preferences</Text>
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
                        <Text color="white" fontWeight="600">{settings.name || 'User'}</Text>
                        <Badge colorScheme="purple">Pro Account</Badge>
                    </VStack>
                </HStack>

                <Divider borderColor="surface.border" />

                <FormControl>
                    <FormLabel color="gray.400" fontSize="sm">Display Name</FormLabel>
                    <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                        _hover={{ borderColor: 'surface.borderHover' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                    <Input
                        value={settings.email}
                        isReadOnly
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                        opacity={0.7}
                    />
                    <Text fontSize="xs" color="gray.600" mt={1}>Email cannot be changed</Text>
                </FormControl>
            </SettingsSection>

            {/* Notifications Section */}
            <SettingsSection title="Notifications" icon={FiBell} delay={0.2}>
                <SettingsRow
                    label="Email Notifications"
                    description="Receive updates via email"
                >
                    <Switch
                        colorScheme="purple"
                        isChecked={settings.notifications.email}
                        onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, email: e.target.checked }
                        })}
                    />
                </SettingsRow>

                <Divider borderColor="surface.border" />

                <SettingsRow
                    label="Orchestration Complete"
                    description="Notify when content processing finishes"
                >
                    <Switch
                        colorScheme="purple"
                        isChecked={settings.notifications.orchestrationComplete}
                        onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, orchestrationComplete: e.target.checked }
                        })}
                    />
                </SettingsRow>

                <Divider borderColor="surface.border" />

                <SettingsRow
                    label="Weekly Digest"
                    description="Summary of your content performance"
                >
                    <Switch
                        colorScheme="purple"
                        isChecked={settings.notifications.weeklyDigest}
                        onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, weeklyDigest: e.target.checked }
                        })}
                    />
                </SettingsRow>
            </SettingsSection>

            {/* Preferences Section */}
            <SettingsSection title="Preferences" icon={FiGlobe} delay={0.3}>
                <SettingsRow label="Theme" description="Choose your color scheme">
                    <Select
                        value={settings.preferences.theme}
                        onChange={(e) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, theme: e.target.value }
                        })}
                        w="150px"
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                    </Select>
                </SettingsRow>

                <Divider borderColor="surface.border" />

                <SettingsRow label="Language" description="Interface language">
                    <Select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, language: e.target.value }
                        })}
                        w="150px"
                        bg="surface.bg"
                        border="1px solid"
                        borderColor="surface.border"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </Select>
                </SettingsRow>
            </SettingsSection>

            {/* Security Section */}
            <SettingsSection title="Security" icon={FiShield} delay={0.4}>
                <SettingsRow
                    label="Change Password"
                    description="Update your password"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="surface.border"
                        color="gray.400"
                        _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                    >
                        Change
                    </Button>
                </SettingsRow>

                <Divider borderColor="surface.border" />

                <SettingsRow
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security"
                >
                    <Badge colorScheme="orange">Coming Soon</Badge>
                </SettingsRow>
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
                        colorScheme="purple"
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
                    <ModalHeader color="white">
                        <HStack>
                            <Icon as={FiAlertTriangle} color="error.400" />
                            <Text>Delete Account</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.500" />
                    <ModalBody>
                        <Text color="gray.300">
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
