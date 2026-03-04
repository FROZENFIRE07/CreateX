/**
 * Settings Page Component
 * User preferences, account management, and Brand DNA editing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Box, VStack, HStack, Heading, Text, Input, Button, Switch, Divider,
    Avatar, Badge, SimpleGrid, FormControl, FormLabel, Select, Spinner,
    Center, Icon, useDisclosure, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea,
    Wrap, WrapItem, Tag, TagLabel, TagCloseButton, Image,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings as FiSettingsIcon } from 'react-icons/fi';
import {
    FiUser, FiBell, FiShield, FiGlobe, FiLogOut, FiSave, FiTrash2,
    FiCheck, FiAlertTriangle, FiUpload, FiX, FiZap, FiShare2,
} from 'react-icons/fi';
import SocialMediaAccounts from './SocialMediaAccounts';
import { useAuth } from '../../context/AuthContext';
import { useBrandDNA } from '../../context/BrandDNAContext';
import api from '../../services/api';
import { showToast } from '../common';

const MotionBox = motion(Box);

const T = {
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.35)',
    primaryFaint: 'rgba(255,107,1,0.1)',
};

const TONE_OPTIONS = [
    'Professional', 'Casual', 'Friendly', 'Technical',
    'Authoritative', 'Playful', 'Inspirational', 'Formal',
];

const FONT_OPTIONS = ['Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat', 'Open Sans', 'Lato'];

const PRESET_COLORS = [
    '#FF6B01', '#E85F00', '#F59E0B', '#22C55E', '#3B82F6',
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6',
];

// Settings Section Component
const SettingsSection = ({ title, icon, children, delay = 0 }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        bg="surface.card" borderRadius="xl"
        border="1px solid" borderColor="surface.border" overflow="hidden"
    >
        <HStack p={4} borderBottom="1px solid" borderColor="surface.border" bg="surface.bg">
            <Icon as={icon} color="brand.400" />
            <Heading size="sm" color="white">{title}</Heading>
        </HStack>
        <VStack p={5} spacing={5} align="stretch">{children}</VStack>
    </MotionBox>
);

const SettingsRow = ({ label, description, children }) => (
    <HStack justify="space-between" align="start">
        <Box flex={1}>
            <Text color="white" fontWeight="500">{label}</Text>
            {description && <Text fontSize="sm" color="gray.500">{description}</Text>}
        </Box>
        <Box>{children}</Box>
    </HStack>
);

const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: FiSettingsIcon },
    { id: 'social', label: 'Social Accounts', icon: FiShare2 },
];

function Settings() {
    const { user, logout } = useAuth();
    const { brandDNA, setBrandDNA } = useBrandDNA();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const fileInputRef = useRef(null);
    const [valueInput, setValueInput] = useState('');
    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        name: '', email: '',
        notifications: { email: true, push: false, orchestrationComplete: true, weeklyDigest: false },
        preferences: { theme: 'dark', language: 'en', timezone: 'auto' },
    });

    // Brand DNA local state (mirrors context for editing)
    const [dna, setDna] = useState({ ...brandDNA });

    useEffect(() => {
        setDna({ ...brandDNA });
    }, [brandDNA]);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/auth/profile');
            if (res.data.user) {
                setSettings((prev) => ({
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

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', { username: settings.name });
            // Save Brand DNA
            setBrandDNA(dna);
            showToast.success('All settings saved successfully');
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

    const updateDna = (key, val) => setDna((p) => ({ ...p, [key]: val }));
    const updateDnaColor = (key, val) => setDna((p) => ({
        ...p, colorPalette: { ...p.colorPalette, [key]: val },
    }));
    const updateDnaFont = (key, val) => setDna((p) => ({
        ...p, typography: { ...p.typography, [key]: val },
    }));

    const addValue = () => {
        const v = valueInput.trim();
        if (v && !(dna.coreValues || []).includes(v)) {
            updateDna('coreValues', [...(dna.coreValues || []), v]);
        }
        setValueInput('');
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => updateDna('logoDataUrl', ev.target.result);
        reader.readAsDataURL(file);
    };

    if (loading) {
        return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;
    }

    return (
        <VStack spacing={6} align="stretch" maxW="900px" mx="auto">
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Heading size="lg" color="white">Settings</Heading>
                <Text color="gray.400" mt={1}>Manage your account, preferences, and Brand DNA</Text>
            </MotionBox>

            {/* Tab Navigation */}
            <MotionBox
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <HStack
                    spacing={1} p={1} rounded="xl"
                    bg="rgba(53,53,53,0.5)"
                    backdropFilter="blur(20px)"
                    border="1px solid" borderColor="rgba(255,255,255,0.06)"
                    w="fit-content"
                >
                    {SETTINGS_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                size="sm"
                                px={5} py={2}
                                rounded="lg"
                                fontWeight={isActive ? '700' : '500'}
                                fontSize="sm"
                                bg={isActive ? T.primary : 'transparent'}
                                color={isActive ? 'white' : 'gray.400'}
                                border="1px solid"
                                borderColor={isActive ? T.primary : 'transparent'}
                                _hover={{
                                    bg: isActive ? T.primaryHover : 'whiteAlpha.100',
                                    color: 'white',
                                }}
                                leftIcon={<Icon as={tab.icon} boxSize={4} />}
                                onClick={() => setActiveTab(tab.id)}
                                transition="all 0.2s"
                                boxShadow={isActive ? `0 0 20px ${T.primaryGlow}` : 'none'}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </HStack>
            </MotionBox>

            {/* Tab Content */}
            {activeTab === 'social' ? (
                <MotionBox
                    key="social"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <SocialMediaAccounts />
                </MotionBox>
            ) : (
                <>
                    {/* ── General Settings content below ── */}

                    {/* ═══ Brand DNA Section ═══ */}
                    <SettingsSection title="Brand DNA" icon={FiZap} delay={0.05}>
                        {/* Brand Name */}
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Brand Name</FormLabel>
                            <Input
                                value={dna.brandName || ''}
                                onChange={(e) => updateDna('brandName', e.target.value)}
                                bg="surface.bg" border="1px solid" borderColor="surface.border"
                                _hover={{ borderColor: 'surface.borderHover' }}
                                _focus={{ borderColor: 'brand.500', boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                            />
                        </FormControl>

                        <Divider borderColor="surface.border" />

                        {/* Mission */}
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Mission / Vision</FormLabel>
                            <Textarea
                                value={dna.mission || ''}
                                onChange={(e) => updateDna('mission', e.target.value)}
                                bg="surface.bg" border="1px solid" borderColor="surface.border"
                                minH="80px" resize="vertical"
                                _focus={{ borderColor: 'brand.500', boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                            />
                        </FormControl>

                        <Divider borderColor="surface.border" />

                        {/* Tone of Voice */}
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="500">Tone of Voice</Text>
                            <Wrap spacing={2}>
                                {TONE_OPTIONS.map((tone) => {
                                    const tones = Array.isArray(dna.toneOfVoice) ? dna.toneOfVoice : [];
                                    const isSelected = tones.includes(tone);
                                    return (
                                        <WrapItem key={tone}>
                                            <Button
                                                size="xs" rounded="full" px={3}
                                                bg={isSelected ? T.primary : 'surface.bg'}
                                                color={isSelected ? 'white' : 'gray.400'}
                                                border="1px solid"
                                                borderColor={isSelected ? T.primary : 'surface.border'}
                                                _hover={{ borderColor: T.primary }}
                                                onClick={() => updateDna('toneOfVoice', isSelected
                                                    ? tones.filter((t) => t !== tone)
                                                    : [...tones, tone]
                                                )}
                                            >
                                                {tone} {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                            </Button>
                                        </WrapItem>
                                    );
                                })}
                            </Wrap>
                        </Box>

                        <Divider borderColor="surface.border" />

                        {/* Target Audience */}
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Target Audience</FormLabel>
                            <Textarea
                                value={dna.targetAudience || ''}
                                onChange={(e) => updateDna('targetAudience', e.target.value)}
                                bg="surface.bg" border="1px solid" borderColor="surface.border"
                                minH="60px" resize="vertical"
                                _focus={{ borderColor: 'brand.500', boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                            />
                        </FormControl>

                        <Divider borderColor="surface.border" />

                        {/* Core Values */}
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="500">Core Values</Text>
                            <HStack mb={2}>
                                <Input
                                    placeholder="Add a value..."
                                    value={valueInput}
                                    onChange={(e) => setValueInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                                    bg="surface.bg" border="1px solid" borderColor="surface.border" size="sm"
                                    _focus={{ borderColor: 'brand.500' }}
                                />
                                <Button size="sm" bg={T.primary} color="white" _hover={{ bg: T.primaryHover }}
                                    onClick={addValue} isDisabled={!valueInput.trim()}>
                                    Add
                                </Button>
                            </HStack>
                            <Wrap spacing={2}>
                                {(dna.coreValues || []).map((v) => (
                                    <WrapItem key={v}>
                                        <Tag size="md" rounded="full" bg={T.primaryFaint}
                                            border="1px solid" borderColor={T.primary}>
                                            <TagLabel color="white" fontSize="xs">{v}</TagLabel>
                                            <TagCloseButton color="gray.400"
                                                onClick={() => updateDna('coreValues', (dna.coreValues || []).filter((x) => x !== v))} />
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </Box>

                        <Divider borderColor="surface.border" />

                        {/* Color Palette */}
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="500">Color Palette</Text>
                            <SimpleGrid columns={3} spacing={3}>
                                {['primary', 'secondary', 'accent'].map((key) => (
                                    <VStack key={key} spacing={1}>
                                        <Text fontSize="2xs" color="gray.500" textTransform="capitalize">{key}</Text>
                                        <Box position="relative" w="100%">
                                            <Box w="100%" h="36px" rounded="lg"
                                                bg={dna.colorPalette?.[key] || '#333'}
                                                border="2px solid" borderColor="rgba(255,255,255,0.15)"
                                                cursor="pointer"
                                                onClick={() => document.getElementById(`settings-color-${key}`)?.click()}
                                                _hover={{ borderColor: T.primary }}
                                                transition="all 0.2s"
                                            />
                                            <input id={`settings-color-${key}`} type="color"
                                                value={dna.colorPalette?.[key] || '#333333'}
                                                onChange={(e) => updateDnaColor(key, e.target.value)}
                                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                                        </Box>
                                        <Text fontSize="2xs" color="gray.600" fontFamily="mono">
                                            {dna.colorPalette?.[key]}
                                        </Text>
                                    </VStack>
                                ))}
                            </SimpleGrid>
                            <HStack mt={2} spacing={1}>
                                {PRESET_COLORS.map((c) => (
                                    <Box key={c} w="20px" h="20px" rounded="sm" bg={c} cursor="pointer"
                                        border="2px solid" borderColor={dna.colorPalette?.primary === c ? 'white' : 'transparent'}
                                        _hover={{ transform: 'scale(1.2)' }} transition="all 0.15s"
                                        onClick={() => updateDnaColor('primary', c)} />
                                ))}
                            </HStack>
                        </Box>

                        <Divider borderColor="surface.border" />

                        {/* Typography */}
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="500">Typography</Text>
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel color="gray.500" fontSize="xs">Heading Font</FormLabel>
                                    <Select value={dna.typography?.headingFont || 'Inter'}
                                        onChange={(e) => updateDnaFont('headingFont', e.target.value)}
                                        bg="surface.bg" border="1px solid" borderColor="surface.border" size="sm">
                                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel color="gray.500" fontSize="xs">Body Font</FormLabel>
                                    <Select value={dna.typography?.bodyFont || 'Inter'}
                                        onChange={(e) => updateDnaFont('bodyFont', e.target.value)}
                                        bg="surface.bg" border="1px solid" borderColor="surface.border" size="sm">
                                        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Divider borderColor="surface.border" />

                        {/* Brand Guidelines */}
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Brand Guidelines</FormLabel>
                            <Textarea
                                value={dna.brandGuidelines || ''}
                                onChange={(e) => updateDna('brandGuidelines', e.target.value)}
                                bg="surface.bg" border="1px solid" borderColor="surface.border"
                                minH="80px" resize="vertical"
                                _focus={{ borderColor: 'brand.500', boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                            />
                        </FormControl>

                        <Divider borderColor="surface.border" />

                        {/* Logo */}
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb={2} fontWeight="500">Logo</Text>
                            <input ref={fileInputRef} type="file" accept="image/*"
                                onChange={handleLogoUpload} style={{ display: 'none' }} />
                            {dna.logoDataUrl ? (
                                <HStack spacing={3}>
                                    <Image src={dna.logoDataUrl} alt="Logo" maxH="60px" rounded="lg"
                                        border="1px solid" borderColor="surface.border" />
                                    <VStack align="start" spacing={1}>
                                        <Button size="xs" variant="outline" borderColor="surface.border" color="gray.400"
                                            _hover={{ bg: 'whiteAlpha.100' }}
                                            onClick={() => fileInputRef.current?.click()}>
                                            Change Logo
                                        </Button>
                                        <Button size="xs" variant="ghost" color="red.400"
                                            onClick={() => updateDna('logoDataUrl', '')}>
                                            Remove
                                        </Button>
                                    </VStack>
                                </HStack>
                            ) : (
                                <Button size="sm" leftIcon={<FiUpload />} variant="outline"
                                    borderColor="surface.border" color="gray.400"
                                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                                    onClick={() => fileInputRef.current?.click()}>
                                    Upload Logo
                                </Button>
                            )}
                        </Box>
                    </SettingsSection>

                    {/* ═══ Profile Section ═══ */}
                    <SettingsSection title="Profile" icon={FiUser} delay={0.1}>
                        <HStack spacing={4}>
                            <Avatar size="lg" name={settings.name} bg="brand.500" color="white" />
                            <VStack align="start" spacing={1}>
                                <Text color="white" fontWeight="600">{settings.name || 'User'}</Text>
                                <Badge colorScheme="purple">Pro Account</Badge>
                            </VStack>
                        </HStack>
                        <Divider borderColor="surface.border" />
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Display Name</FormLabel>
                            <Input value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                bg="surface.bg" border="1px solid" borderColor="surface.border"
                                _hover={{ borderColor: 'surface.borderHover' }}
                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }} />
                        </FormControl>
                        <FormControl>
                            <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                            <Input value={settings.email} isReadOnly
                                bg="surface.bg" border="1px solid" borderColor="surface.border" opacity={0.7} />
                            <Text fontSize="xs" color="gray.600" mt={1}>Email cannot be changed</Text>
                        </FormControl>
                    </SettingsSection>

                    {/* Notifications */}
                    <SettingsSection title="Notifications" icon={FiBell} delay={0.2}>
                        <SettingsRow label="Email Notifications" description="Receive updates via email">
                            <Switch colorScheme="orange"
                                isChecked={settings.notifications.email}
                                onChange={(e) => setSettings({
                                    ...settings, notifications: { ...settings.notifications, email: e.target.checked }
                                })} />
                        </SettingsRow>
                        <Divider borderColor="surface.border" />
                        <SettingsRow label="Weekly Digest" description="Summary of your content performance">
                            <Switch colorScheme="orange"
                                isChecked={settings.notifications.weeklyDigest}
                                onChange={(e) => setSettings({
                                    ...settings, notifications: { ...settings.notifications, weeklyDigest: e.target.checked }
                                })} />
                        </SettingsRow>
                    </SettingsSection>

                    {/* Preferences */}
                    <SettingsSection title="Preferences" icon={FiGlobe} delay={0.3}>
                        <SettingsRow label="Theme" description="Choose your color scheme">
                            <Select value={settings.preferences.theme}
                                onChange={(e) => setSettings({
                                    ...settings, preferences: { ...settings.preferences, theme: e.target.value }
                                })}
                                w="150px" bg="surface.bg" border="1px solid" borderColor="surface.border">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="system">System</option>
                            </Select>
                        </SettingsRow>
                        <Divider borderColor="surface.border" />
                        <SettingsRow label="Language" description="Interface language">
                            <Select value={settings.preferences.language}
                                onChange={(e) => setSettings({
                                    ...settings, preferences: { ...settings.preferences, language: e.target.value }
                                })}
                                w="150px" bg="surface.bg" border="1px solid" borderColor="surface.border">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </Select>
                        </SettingsRow>
                    </SettingsSection>

                    {/* Security */}
                    <SettingsSection title="Security" icon={FiShield} delay={0.4}>
                        <SettingsRow label="Change Password" description="Update your password">
                            <Button size="sm" variant="outline" borderColor="surface.border" color="gray.400"
                                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}>Change</Button>
                        </SettingsRow>
                        <Divider borderColor="surface.border" />
                        <SettingsRow label="Two-Factor Authentication" description="Add an extra layer of security">
                            <Badge colorScheme="orange">Coming Soon</Badge>
                        </SettingsRow>
                    </SettingsSection>

                    {/* Actions */}
                    <HStack justify="space-between">
                        <Button leftIcon={<FiLogOut />} variant="ghost" color="gray.400"
                            _hover={{ bg: 'whiteAlpha.100', color: 'white' }} onClick={handleLogout}>
                            Log Out
                        </Button>
                        <HStack spacing={3}>
                            <Button leftIcon={<FiTrash2 />} variant="ghost" colorScheme="red" onClick={onOpen}>
                                Delete Account
                            </Button>
                            <Button leftIcon={<FiSave />} bg={T.primary} color="white"
                                _hover={{ bg: T.primaryHover }}
                                isLoading={saving} onClick={handleSaveAll}>
                                Save Changes
                            </Button>
                        </HStack>
                    </HStack>

                    {/* Delete Confirmation Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                        <ModalOverlay bg="blackAlpha.700" />
                        <ModalContent bg="surface.card" border="1px solid" borderColor="surface.border">
                            <ModalHeader color="white">
                                <HStack><Icon as={FiAlertTriangle} color="error.400" /><Text>Delete Account</Text></HStack>
                            </ModalHeader>
                            <ModalCloseButton color="gray.500" />
                            <ModalBody>
                                <Text color="gray.300">
                                    Are you sure? This action cannot be undone and all your data will be permanently removed.
                                </Text>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="ghost" mr={3} onClick={onClose} color="gray.400">Cancel</Button>
                                <Button colorScheme="red" onClick={handleDeleteAccount}>Delete Account</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </> /* End of General tab content */
            )}
        </VStack>
    );
}

export default Settings;
