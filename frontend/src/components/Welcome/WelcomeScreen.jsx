/**
 * Brand DNA Onboarding Wizard
 * Multi-step wizard that forces brand identity creation before accessing the dashboard.
 * Steps: 1) Brand Name + Mission  2) Tone + Audience  3) Values  4) Colors + Typography  5) Guidelines + Logo
 * Enter key advances to next step when not focused on a form field.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Icon, Input, Button,
    Textarea, SimpleGrid, Tag, TagLabel, TagCloseButton, Wrap, WrapItem,
    Progress, Image, useColorMode,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiZap, FiArrowRight, FiArrowLeft, FiCheck, FiUpload, FiX,
} from 'react-icons/fi';
import { useBrandDNA, hasBrandDNA } from '../../context/BrandDNAContext';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);

const getT = (dark) => ({
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.35)',
    primaryGlowStrong: 'rgba(255,107,1,0.55)',
    primaryFaint: 'rgba(255,107,1,0.1)',
    white: dark ? '#FFFFFF' : '#1A1A1A',
    surface: dark ? '#353535' : '#FFFFFF',
    surfaceLight: dark ? '#444444' : '#F0F0F2',
    bg: dark ? '#1A1A1A' : '#F7F7F8',
    bgDeep: dark ? '#111111' : '#EEEEF0',
});

const getGlass = (dark) => ({
    bg: dark ? 'rgba(53,53,53,0.5)' : 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(30px)',
    border: '1px solid',
    borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
});

const TONE_OPTIONS = [
    'Professional', 'Casual', 'Friendly', 'Technical',
    'Authoritative', 'Playful', 'Inspirational', 'Formal',
];

const FONT_OPTIONS = [
    'Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat',
    'Open Sans', 'Lato', 'Source Sans Pro',
];

const PRESET_COLORS = [
    '#FF6B01', '#E85F00', '#F59E0B', '#22C55E',
    '#3B82F6', '#FF6B01', '#f59e0b', '#EC4899',
    '#EF4444', '#14B8A6', '#F97316', '#A855F7',
];

const TOTAL_STEPS = 5;

const STEP_TITLES = [
    'Brand Identity',
    'Voice & Audience',
    'Core Values',
    'Visual Identity',
    'Guidelines & Logo',
];

// ─── Helper: keep legacy getUsername working ───
export function getUsername() {
    try {
        const raw = localStorage.getItem('saco_brand_dna');
        if (raw) {
            const d = JSON.parse(raw);
            return d.brandName || '';
        }
    } catch { /* noop */ }
    return localStorage.getItem('saco_username') || '';
}

export default function WelcomeScreen({ children }) {
    const { initializeBrandDNA } = useBrandDNA();
    const { user, loading: authLoading } = useAuth();
    const { colorMode } = useColorMode();
    const dark = colorMode === 'dark';
    const T = getT(dark);
    const glass = getGlass(dark);
    const [hasProfile, setHasProfile] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [step, setStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [form, setForm] = useState({
        brandName: '',
        mission: '',
        toneOfVoice: [],
        targetAudience: '',
        coreValues: [],
        colorPalette: { primary: '#FF6B01', secondary: '#1A1A1A', accent: '#A78BFA' },
        typography: { headingFont: 'Inter', bodyFont: 'Inter' },
        brandGuidelines: '',
        logoDataUrl: '',
    });
    const [valueInput, setValueInput] = useState('');

    const updateForm = useCallback((key, value) => setForm((p) => ({ ...p, [key]: value })), []);
    const updateColor = useCallback((key, value) => setForm((p) => ({
        ...p, colorPalette: { ...p.colorPalette, [key]: value },
    })), []);
    const updateTypo = useCallback((key, value) => setForm((p) => ({
        ...p, typography: { ...p.typography, [key]: value },
    })), []);

    const addValue = useCallback(() => {
        setForm((prev) => {
            const v = valueInput.trim();
            if (v && !prev.coreValues.includes(v)) {
                return { ...prev, coreValues: [...prev.coreValues, v] };
            }
            return prev;
        });
        setValueInput('');
    }, [valueInput]);

    const removeValue = useCallback((v) => {
        setForm((prev) => ({
            ...prev,
            coreValues: prev.coreValues.filter((x) => x !== v),
        }));
    }, []);

    const handleLogoUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setForm((p) => ({ ...p, logoDataUrl: ev.target.result }));
        reader.readAsDataURL(file);
    }, []);

    const canProceed = useCallback(() => {
        switch (step) {
            case 1: return true;
            case 2: return true;
            case 3: return true;
            case 4: return true;
            case 5: return true;
            default: return false;
        }
    }, [step]);

    const handleFinish = useCallback(() => {
        initializeBrandDNA(form);
        setIsTransitioning(true);
        setTimeout(() => {
            setHasProfile(true);
            setTimeout(() => {
                setShowContent(true);
                setIsTransitioning(false);
            }, 200);
        }, 700);
    }, [form, initializeBrandDNA]);

    // Check if Brand DNA already exists
    useEffect(() => {
        if (hasBrandDNA()) {
            setHasProfile(true);
            setShowContent(true);
        }
    }, []);

    // Enter key → next step (only when not typing in any form field)
    useEffect(() => {
        if (authLoading || !user || (showContent && hasProfile)) return;

        const handleKeyDown = (e) => {
            if (e.key !== 'Enter') return;
            const tag = document.activeElement?.tagName;
            if (tag === 'TEXTAREA' || tag === 'INPUT') return;
            e.preventDefault();
            setStep((currentStep) => {
                if (currentStep < TOTAL_STEPS) {
                    return currentStep + 1;
                }
                return currentStep;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [authLoading, user, showContent, hasProfile]);

    // If auth is still loading or user is NOT logged in — show children (login page)
    if (authLoading || !user) {
        return <>{children}</>;
    }

    // Already has Brand DNA — show app
    if (showContent && hasProfile) {
        return <>{children}</>;
    }

    // ─── Step Renderers ────────────────────────────
    const renderStep1 = () => (
        <VStack spacing={6} align="stretch">
            <VStack spacing={1} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Brand Name *
                </Text>
                <Input
                    placeholder="e.g. GrowthOS, Acme Inc..."
                    value={form.brandName}
                    onChange={(e) => updateForm('brandName', e.target.value)}
                    autoFocus
                    size="lg"
                    bg="rgba(26,26,26,0.6)"
                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                    rounded="xl" color={T.white} fontSize="md"
                    _placeholder={{ color: 'gray.600' }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                />
            </VStack>
            <VStack spacing={1} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Mission / Vision
                </Text>
                <Textarea
                    placeholder="What is your brand's mission or vision statement?"
                    value={form.mission}
                    onChange={(e) => updateForm('mission', e.target.value)}
                    bg="rgba(26,26,26,0.6)"
                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                    rounded="xl" color={T.white} fontSize="sm"
                    minH="100px" resize="vertical"
                    _placeholder={{ color: 'gray.600' }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                />
            </VStack>
        </VStack>
    );

    const renderStep2 = () => (
        <VStack spacing={6} align="stretch">
            <VStack spacing={2} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Tone of Voice * (select one or more)
                </Text>
                <Wrap spacing={2}>
                    {TONE_OPTIONS.map((tone) => {
                        const isSelected = form.toneOfVoice.includes(tone);
                        return (
                            <WrapItem key={tone}>
                                <Button
                                    size="sm" rounded="full" px={4}
                                    bg={isSelected ? T.primary : T.surface}
                                    color={isSelected ? T.white : 'gray.400'}
                                    border="1px solid"
                                    borderColor={isSelected ? T.primary : 'rgba(255,255,255,0.1)'}
                                    _hover={{ bg: isSelected ? T.primaryHover : T.surfaceLight, borderColor: T.primary }}
                                    onClick={() => updateForm('toneOfVoice', isSelected
                                        ? form.toneOfVoice.filter((t) => t !== tone)
                                        : [...form.toneOfVoice, tone]
                                    )}
                                    transition="all 0.2s"
                                >
                                    {tone}
                                    {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                </Button>
                            </WrapItem>
                        );
                    })}
                </Wrap>
            </VStack>
            <VStack spacing={1} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Target Audience
                </Text>
                <Textarea
                    placeholder="Who is your ideal customer? e.g. SaaS founders, Gen-Z consumers, Enterprise CTOs..."
                    value={form.targetAudience}
                    onChange={(e) => updateForm('targetAudience', e.target.value)}
                    bg="rgba(26,26,26,0.6)"
                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                    rounded="xl" color={T.white} fontSize="sm"
                    minH="80px" resize="vertical"
                    _placeholder={{ color: 'gray.600' }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                />
            </VStack>
        </VStack>
    );

    const renderStep3 = () => (
        <VStack spacing={5} align="stretch">
            <VStack spacing={1} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Core Brand Values
                </Text>
                <Text fontSize="xs" color="gray.600">
                    Add the values that define your brand identity
                </Text>
            </VStack>
            <HStack>
                <Input
                    placeholder="e.g. Innovation, Transparency..."
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                    bg="rgba(26,26,26,0.6)"
                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                    rounded="xl" color={T.white} fontSize="sm"
                    _placeholder={{ color: 'gray.600' }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                />
                <Button
                    onClick={addValue} size="md" rounded="xl"
                    bg={T.primary} color={T.white}
                    _hover={{ bg: T.primaryHover }}
                    isDisabled={!valueInput.trim()}
                    px={6}
                >
                    Add
                </Button>
            </HStack>
            <Wrap spacing={2} minH="60px">
                <AnimatePresence>
                    {form.coreValues.map((v) => (
                        <WrapItem key={v}>
                            <MotionBox
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Tag
                                    size="lg" rounded="full"
                                    bg={T.primaryFaint}
                                    border="1px solid" borderColor={T.primary}
                                    px={4}
                                >
                                    <TagLabel color={T.white} fontSize="sm">{v}</TagLabel>
                                    <TagCloseButton color="gray.400" onClick={() => removeValue(v)} />
                                </Tag>
                            </MotionBox>
                        </WrapItem>
                    ))}
                </AnimatePresence>
                {form.coreValues.length === 0 && (
                    <Text fontSize="sm" color="gray.600" fontStyle="italic" py={4} w="100%" textAlign="center">
                        No values added yet — type and press Enter or click Add
                    </Text>
                )}
            </Wrap>
        </VStack>
    );

    const renderStep4 = () => (
        <VStack spacing={6} align="stretch">
            {/* Color Palette */}
            <VStack spacing={2} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Color Palette
                </Text>
                <SimpleGrid columns={3} spacing={4} w="100%">
                    {['primary', 'secondary', 'accent'].map((key) => (
                        <VStack key={key} spacing={2}>
                            <Text fontSize="2xs" color="gray.500" textTransform="capitalize" fontWeight="600">{key}</Text>
                            <Box position="relative" w="100%">
                                <Box
                                    w="100%" h="48px" rounded="xl"
                                    bg={form.colorPalette[key]}
                                    border="2px solid" borderColor="rgba(255,255,255,0.15)"
                                    cursor="pointer"
                                    onClick={() => document.getElementById(`color-${key}`)?.click()}
                                    transition="all 0.2s"
                                    _hover={{ borderColor: T.primary, transform: 'scale(1.03)' }}
                                />
                                <input
                                    id={`color-${key}`}
                                    type="color"
                                    value={form.colorPalette[key]}
                                    onChange={(e) => updateColor(key, e.target.value)}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                />
                            </Box>
                            <Text fontSize="2xs" color="gray.500" fontFamily="mono">{form.colorPalette[key]}</Text>
                        </VStack>
                    ))}
                </SimpleGrid>
                <Text fontSize="2xs" color="gray.600" mt={1}>Quick picks:</Text>
                <HStack spacing={1} flexWrap="wrap">
                    {PRESET_COLORS.map((c) => (
                        <Box
                            key={c} w="24px" h="24px" rounded="md"
                            bg={c} cursor="pointer"
                            border="2px solid"
                            borderColor={form.colorPalette.primary === c ? T.white : 'transparent'}
                            _hover={{ transform: 'scale(1.2)' }}
                            transition="all 0.15s"
                            onClick={() => updateColor('primary', c)}
                        />
                    ))}
                </HStack>
            </VStack>

            {/* Typography */}
            <VStack spacing={2} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Typography
                </Text>
                <SimpleGrid columns={2} spacing={4} w="100%">
                    <VStack spacing={1} align="start">
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">Heading Font</Text>
                        <Wrap spacing={1}>
                            {FONT_OPTIONS.slice(0, 4).map((f) => (
                                <WrapItem key={f}>
                                    <Button
                                        size="xs" rounded="full"
                                        bg={form.typography.headingFont === f ? T.primary : T.surface}
                                        color={form.typography.headingFont === f ? T.white : 'gray.400'}
                                        border="1px solid"
                                        borderColor={form.typography.headingFont === f ? T.primary : 'rgba(255,255,255,0.08)'}
                                        _hover={{ borderColor: T.primary }}
                                        onClick={() => updateTypo('headingFont', f)}
                                        fontFamily={f}
                                    >
                                        {f}
                                    </Button>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </VStack>
                    <VStack spacing={1} align="start">
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">Body Font</Text>
                        <Wrap spacing={1}>
                            {FONT_OPTIONS.slice(0, 4).map((f) => (
                                <WrapItem key={f}>
                                    <Button
                                        size="xs" rounded="full"
                                        bg={form.typography.bodyFont === f ? T.primary : T.surface}
                                        color={form.typography.bodyFont === f ? T.white : 'gray.400'}
                                        border="1px solid"
                                        borderColor={form.typography.bodyFont === f ? T.primary : 'rgba(255,255,255,0.08)'}
                                        _hover={{ borderColor: T.primary }}
                                        onClick={() => updateTypo('bodyFont', f)}
                                        fontFamily={f}
                                    >
                                        {f}
                                    </Button>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </VStack>
                </SimpleGrid>
            </VStack>
        </VStack>
    );

    const renderStep5 = () => (
        <VStack spacing={6} align="stretch">
            <VStack spacing={1} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Brand Guidelines
                </Text>
                <Textarea
                    placeholder="Describe any specific brand guidelines, dos and don'ts, style rules..."
                    value={form.brandGuidelines}
                    onChange={(e) => updateForm('brandGuidelines', e.target.value)}
                    bg="rgba(26,26,26,0.6)"
                    border="1px solid" borderColor="rgba(255,255,255,0.1)"
                    rounded="xl" color={T.white} fontSize="sm"
                    minH="100px" resize="vertical"
                    _placeholder={{ color: 'gray.600' }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    _focus={{ borderColor: T.primary, boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                />
            </VStack>

            {/* Logo Upload */}
            <VStack spacing={2} align="start">
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Logo Upload
                </Text>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                />
                {form.logoDataUrl ? (
                    <Box position="relative" w="fit-content">
                        <Image
                            src={form.logoDataUrl}
                            alt="Brand Logo"
                            maxH="120px" maxW="200px"
                            rounded="xl"
                            border="2px solid" borderColor="rgba(255,255,255,0.1)"
                        />
                        <Button
                            position="absolute" top={-2} right={-2}
                            size="xs" rounded="full"
                            bg="red.500" color={T.white}
                            _hover={{ bg: 'red.600' }}
                            onClick={() => updateForm('logoDataUrl', '')}
                            minW="auto" p={1}
                        >
                            <FiX />
                        </Button>
                    </Box>
                ) : (
                    <Box
                        as="button"
                        onClick={() => fileInputRef.current?.click()}
                        w="100%" py={8}
                        rounded="xl"
                        border="2px dashed" borderColor="rgba(255,255,255,0.15)"
                        bg="rgba(26,26,26,0.4)"
                        cursor="pointer"
                        _hover={{ borderColor: T.primary, bg: T.primaryFaint }}
                        transition="all 0.25s"
                        display="flex" flexDirection="column"
                        alignItems="center" gap={2}
                    >
                        <Icon as={FiUpload} boxSize={6} color="gray.500" />
                        <Text fontSize="sm" color="gray.500">Click to upload your logo</Text>
                        <Text fontSize="xs" color="gray.600">PNG, JPG, SVG up to 5MB</Text>
                    </Box>
                )}
            </VStack>
        </VStack>
    );

    const renderCurrentStep = () => {
        switch (step) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            default: return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!hasProfile && (
                <MotionBox
                    key="brand-dna-wizard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                        opacity: 0, y: -60,
                        filter: 'blur(20px)', scale: 0.97,
                        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                    }}
                    position="fixed" inset={0} zIndex={9999}
                    bg={T.bg}
                    display="flex" alignItems="center" justifyContent="center"
                    overflow="hidden"
                >
                    {/* Ambient glows */}
                    <Box position="absolute" top="-20%" left="20%" w="50vw" h="50vw"
                        bg={T.primary} filter="blur(200px)" opacity={0.08} pointerEvents="none" />
                    <Box position="absolute" bottom="-15%" right="10%" w="40vw" h="40vw"
                        bg="#A78BFA" filter="blur(180px)" opacity={0.05} pointerEvents="none" />

                    <MotionBox
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        {...glass}
                        rounded="3xl"
                        p={{ base: 6, md: 10 }}
                        maxW="580px" w="92%"
                        position="relative" overflow="hidden"
                    >
                        {/* Orange accent line at top */}
                        <Box position="absolute" top={0} left="50%" transform="translateX(-50%)"
                            w="60%" h="2px" bg={T.primary} opacity={0.6} rounded="full" />

                        <VStack spacing={6} align="stretch">
                            {/* Header */}
                            <HStack justify="space-between" align="center">
                                <HStack spacing={3}>
                                    <MotionBox
                                        animate={{
                                            boxShadow: [
                                                `0 0 15px ${T.primaryGlow}`,
                                                `0 0 30px ${T.primaryGlowStrong}`,
                                                `0 0 15px ${T.primaryGlow}`,
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        bg={T.primary} p={2.5} rounded="xl"
                                    >
                                        <Icon as={FiZap} boxSize={5} color={T.white} />
                                    </MotionBox>
                                    <VStack spacing={0} align="start">
                                        <Heading size="md" color={T.white} letterSpacing="tight">
                                            Brand DNA
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500">
                                            Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                                    {Math.round((step / TOTAL_STEPS) * 100)}%
                                </Text>
                            </HStack>

                            {/* Progress bar */}
                            <Box w="100%" h="3px" bg="rgba(255,255,255,0.06)" rounded="full" overflow="hidden">
                                <MotionBox
                                    h="100%" bg={T.primary} rounded="full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    boxShadow={`0 0 10px ${T.primaryGlow}`}
                                />
                            </Box>

                            {/* Step Content */}
                            <AnimatePresence mode="wait">
                                <MotionBox
                                    key={step}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderCurrentStep()}
                                </MotionBox>
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <HStack justify="space-between" pt={2}>
                                <Button
                                    variant="ghost"
                                    leftIcon={<FiArrowLeft />}
                                    color="gray.500"
                                    _hover={{ color: T.white, bg: 'whiteAlpha.100' }}
                                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                                    visibility={step === 1 ? 'hidden' : 'visible'}
                                    size="sm"
                                >
                                    Back
                                </Button>

                                {step < TOTAL_STEPS ? (
                                    <Button
                                        rightIcon={<FiArrowRight />}
                                        bg={T.primary} color={T.white}
                                        rounded="full" px={8}
                                        boxShadow={`0 0 20px ${T.primaryGlow}`}
                                        _hover={{ bg: T.primaryHover, transform: 'translateY(-1px)', boxShadow: `0 0 30px ${T.primaryGlowStrong}` }}
                                        _active={{ transform: 'translateY(0)' }}
                                        _disabled={{ opacity: 0.4, cursor: 'not-allowed', _hover: { transform: 'none', bg: T.primary } }}
                                        isDisabled={!canProceed()}
                                        onClick={() => setStep((s) => s + 1)}
                                        transition="all 0.25s"
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        rightIcon={<FiCheck />}
                                        bg={T.primary} color={T.white}
                                        rounded="full" px={8}
                                        boxShadow={`0 0 20px ${T.primaryGlow}`}
                                        _hover={{ bg: T.primaryHover, transform: 'translateY(-1px)', boxShadow: `0 0 30px ${T.primaryGlowStrong}` }}
                                        _active={{ transform: 'translateY(0)' }}
                                        onClick={handleFinish}
                                        isLoading={isTransitioning}
                                        loadingText="Setting up..."
                                        transition="all 0.25s"
                                        data-finish-btn
                                    >
                                        Launch Dashboard
                                    </Button>
                                )}
                            </HStack>

                            <Text fontSize="xs" color="gray.600" textAlign="center">
                                Brand DNA shapes content tone — you can set it up later in Settings
                            </Text>

                            {/* Skip for now */}
                            <Button
                                variant="link"
                                color="gray.500"
                                fontSize="xs"
                                fontWeight="500"
                                _hover={{ color: T.white }}
                                onClick={() => {
                                    initializeBrandDNA({ ...form, brandName: form.brandName || 'My Brand' });
                                    setIsTransitioning(true);
                                    setTimeout(() => {
                                        setHasProfile(true);
                                        setTimeout(() => {
                                            setShowContent(true);
                                            setIsTransitioning(false);
                                        }, 200);
                                    }, 400);
                                }}
                            >
                                Skip for now →
                            </Button>
                        </VStack>
                    </MotionBox>
                </MotionBox>
            )}
        </AnimatePresence>
    );
}
