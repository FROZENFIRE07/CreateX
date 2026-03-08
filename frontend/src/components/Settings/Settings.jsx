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
