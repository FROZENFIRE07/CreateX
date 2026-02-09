/**
 * Brand Settings Component - Redesigned
 * Modern multi-step wizard with color picker and visual feedback
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    Textarea,
    Button,
    Badge,
    SimpleGrid,
    Select,
    Progress,
    Icon,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    TagCloseButton,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCheck,
    FiChevronRight,
    FiChevronLeft,
    FiSave,
    FiTarget,
    FiMessageCircle,
    FiHeart,
    FiUsers,
    FiZap,
    FiAlertCircle,
    FiCheckCircle,
} from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import api from '../../services/api';
import { showToast } from '../common';

const MotionBox = motion(Box);

const TONE_OPTIONS = [
    { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and business-focused' },
    { value: 'casual', label: 'Casual', icon: '😊', desc: 'Relaxed and friendly' },
    { value: 'inspirational', label: 'Inspirational', icon: '✨', desc: 'Motivating and uplifting' },
    { value: 'authoritative', label: 'Authoritative', icon: '🎓', desc: 'Expert and confident' },
    { value: 'friendly', label: 'Friendly', icon: '🤝', desc: 'Warm and approachable' },
    { value: 'playful', label: 'Playful', icon: '🎉', desc: 'Fun and energetic' },
];

const STEPS = [
    { id: 1, title: 'Brand Identity', icon: FiTarget },
    { id: 2, title: 'Voice & Tone', icon: FiMessageCircle },
    { id: 3, title: 'Values & Keywords', icon: FiHeart },
    { id: 4, title: 'Audience', icon: FiUsers },
];

// Step Indicator Component
const StepIndicator = ({ steps, currentStep }) => (
    <HStack spacing={0} w="full" justify="space-between" mb={8}>
        {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
                <VStack spacing={2}>
                    <Box
                        bg={currentStep >= step.id ? 'brand.500' : 'surface.bg'}
                        border="2px solid"
                        borderColor={currentStep >= step.id ? 'brand.500' : 'surface.border'}
                        borderRadius="full"
                        w={12}
                        h={12}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.3s"
                    >
                        {currentStep > step.id ? (
                            <Icon as={FiCheck} color="white" boxSize={5} />
                        ) : (
                            <Icon as={step.icon} color={currentStep >= step.id ? 'white' : 'gray.500'} boxSize={5} />
                        )}
                    </Box>
                    <Text
                        fontSize="xs"
                        color={currentStep >= step.id ? 'white' : 'gray.500'}
                        fontWeight={currentStep === step.id ? '600' : '400'}
                        display={{ base: 'none', md: 'block' }}
                    >
                        {step.title}
                    </Text>
                </VStack>
                {idx < steps.length - 1 && (
                    <Box
                        flex={1}
                        h="2px"
                        bg={currentStep > step.id ? 'brand.500' : 'surface.border'}
                        mx={2}
                        transition="all 0.3s"
                    />
                )}
            </React.Fragment>
        ))}
    </HStack>
);

// Tone Card Component
const ToneCard = ({ tone, selected, onClick }) => (
    <MotionBox
        as="button"
        type="button"
        onClick={onClick}
        bg={selected ? 'rgba(99, 102, 241, 0.15)' : 'surface.bg'}
        border="2px solid"
        borderColor={selected ? 'brand.500' : 'surface.border'}
        borderRadius="xl"
        p={4}
        textAlign="center"
        cursor="pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        w="full"
    >
        <Text fontSize="2xl" mb={2}>{tone.icon}</Text>
        <Text fontWeight="600" color="white" fontSize="sm">{tone.label}</Text>
        <Text fontSize="xs" color="gray.500">{tone.desc}</Text>
    </MotionBox>
);

// Tag Input Component
const TagInput = ({ value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

    const addTag = (tag) => {
        if (tag && !tags.includes(tag)) {
            onChange([...tags, tag].join(', '));
        }
        setInputValue('');
    };

    const removeTag = (tagToRemove) => {
        onChange(tags.filter(t => t !== tagToRemove).join(', '));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue.trim());
        }
    };

    return (
        <Box>
            <Wrap spacing={2} mb={2}>
                {tags.map((tag, idx) => (
                    <WrapItem key={idx}>
                        <Tag
                            size="md"
                            borderRadius="full"
                            variant="subtle"
                            colorScheme="purple"
                        >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => removeTag(tag)} />
                        </Tag>
                    </WrapItem>
                ))}
            </Wrap>
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue && addTag(inputValue.trim())}
                placeholder={placeholder}
                bg="surface.bg"
                border="1px solid"
                borderColor="surface.border"
                _hover={{ borderColor: 'surface.borderHover' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
            />
            <Text fontSize="xs" color="gray.600" mt={1}>Press Enter or comma to add</Text>
        </Box>
    );
};

function BrandSettings() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [brandColor, setBrandColor] = useState('#6366f1');
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [form, setForm] = useState({
        name: '',
        tone: 'professional',
        voice: '',
        values: '',
        keywords: '',
        avoidWords: '',
        targetAudience: ''
    });

    useEffect(() => {
        fetchBrandDNA();
    }, []);

    const fetchBrandDNA = async () => {
        try {
            const res = await api.get('/brand');
            if (res.data.brandDNA) {
                const b = res.data.brandDNA;
                setForm({
                    name: b.name || '',
                    tone: b.guidelines?.tone || 'professional',
                    voice: b.guidelines?.voice || '',
                    values: b.guidelines?.values?.join(', ') || '',
                    keywords: b.guidelines?.keywords?.join(', ') || '',
                    avoidWords: b.guidelines?.avoidWords?.join(', ') || '',
                    targetAudience: b.guidelines?.targetAudience || ''
                });
                if (b.brandColor) setBrandColor(b.brandColor);
            }
        } catch (err) {
            console.error('Brand fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);

        try {
            const payload = {
                name: form.name,
                brandColor,
                guidelines: {
                    tone: form.tone,
                    voice: form.voice,
                    values: form.values.split(',').map(v => v.trim()).filter(Boolean),
                    keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
                    avoidWords: form.avoidWords.split(',').map(w => w.trim()).filter(Boolean),
                    targetAudience: form.targetAudience
                }
            };

            await api.post('/brand', payload);
            showToast.success('Brand DNA saved successfully!');
            fetchBrandDNA();
        } catch (err) {
            showToast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return form.name.trim().length > 0;
            case 2: return form.tone;
            case 3: return true;
            case 4: return true;
            default: return true;
        }
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="brand.500" />
            </Center>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Heading size="lg" color="white">Brand DNA</Heading>
                <Text color="gray.400" mt={1}>Define your brand voice for consistent content generation</Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                {/* Main Form */}
                <Box gridColumn={{ lg: 'span 2' }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        bg="surface.card"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="surface.border"
                        p={6}
                    >
                        {/* Step Indicator */}
                        <StepIndicator steps={STEPS} currentStep={currentStep} />

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <MotionBox
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Brand Name *</Text>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="e.g., Acme Corp"
                                                size="lg"
                                                bg="surface.bg"
                                                border="1px solid"
                                                borderColor="surface.border"
                                                _hover={{ borderColor: 'surface.borderHover' }}
                                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                                            />
                                        </Box>

                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Brand Color</Text>
                                            <HStack spacing={4}>
                                                <Box
                                                    as="button"
                                                    w={12}
                                                    h={12}
                                                    borderRadius="lg"
                                                    bg={brandColor}
                                                    border="2px solid"
                                                    borderColor="white"
                                                    boxShadow={`0 0 20px ${brandColor}40`}
                                                    cursor="pointer"
                                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                                />
                                                <Input
                                                    value={brandColor}
                                                    onChange={(e) => setBrandColor(e.target.value)}
                                                    maxW="120px"
                                                    bg="surface.bg"
                                                    border="1px solid"
                                                    borderColor="surface.border"
                                                />
                                            </HStack>
                                            {showColorPicker && (
                                                <Box mt={4} p={4} bg="surface.bg" borderRadius="lg">
                                                    <HexColorPicker color={brandColor} onChange={setBrandColor} />
                                                </Box>
                                            )}
                                        </Box>
                                    </VStack>
                                </MotionBox>
                            )}

                            {currentStep === 2 && (
                                <MotionBox
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={3}>Tone of Voice</Text>
                                            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                                                {TONE_OPTIONS.map(tone => (
                                                    <ToneCard
                                                        key={tone.value}
                                                        tone={tone}
                                                        selected={form.tone === tone.value}
                                                        onClick={() => setForm({ ...form, tone: tone.value })}
                                                    />
                                                ))}
                                            </SimpleGrid>
                                        </Box>

                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Brand Voice Statement</Text>
                                            <Textarea
                                                value={form.voice}
                                                onChange={(e) => setForm({ ...form, voice: e.target.value })}
                                                placeholder="Describe how your brand speaks. e.g., 'We communicate with clarity and confidence...'"
                                                minH="120px"
                                                bg="surface.bg"
                                                border="1px solid"
                                                borderColor="surface.border"
                                                _hover={{ borderColor: 'surface.borderHover' }}
                                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                                            />
                                        </Box>
                                    </VStack>
                                </MotionBox>
                            )}

                            {currentStep === 3 && (
                                <MotionBox
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Core Values</Text>
                                            <TagInput
                                                value={form.values}
                                                onChange={(val) => setForm({ ...form, values: val })}
                                                placeholder="e.g., innovation, trust, simplicity"
                                            />
                                        </Box>

                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Must-Use Keywords</Text>
                                            <TagInput
                                                value={form.keywords}
                                                onChange={(val) => setForm({ ...form, keywords: val })}
                                                placeholder="e.g., AI-powered, seamless, innovative"
                                            />
                                        </Box>

                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Words to Avoid</Text>
                                            <TagInput
                                                value={form.avoidWords}
                                                onChange={(val) => setForm({ ...form, avoidWords: val })}
                                                placeholder="e.g., cheap, basic, easy"
                                            />
                                        </Box>
                                    </VStack>
                                </MotionBox>
                            )}

                            {currentStep === 4 && (
                                <MotionBox
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontWeight="500" color="gray.300" fontSize="sm" mb={2}>Target Audience</Text>
                                            <Textarea
                                                value={form.targetAudience}
                                                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                                                placeholder="Describe your ideal audience. e.g., 'Tech-savvy marketers aged 25-45 at growth-stage startups...'"
                                                minH="120px"
                                                bg="surface.bg"
                                                border="1px solid"
                                                borderColor="surface.border"
                                                _hover={{ borderColor: 'surface.borderHover' }}
                                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                                            />
                                        </Box>

                                        {/* Summary Preview */}
                                        <Box
                                            bg="rgba(99, 102, 241, 0.1)"
                                            border="1px solid"
                                            borderColor="brand.500"
                                            borderRadius="lg"
                                            p={4}
                                        >
                                            <HStack mb={3}>
                                                <Icon as={FiCheckCircle} color="brand.400" />
                                                <Text fontWeight="600" color="white">Ready to Save</Text>
                                            </HStack>
                                            <SimpleGrid columns={2} spacing={3} fontSize="sm">
                                                <Box>
                                                    <Text color="gray.500">Brand</Text>
                                                    <Text color="white">{form.name || 'Not set'}</Text>
                                                </Box>
                                                <Box>
                                                    <Text color="gray.500">Tone</Text>
                                                    <Badge colorScheme="purple">{form.tone}</Badge>
                                                </Box>
                                                <Box>
                                                    <Text color="gray.500">Values</Text>
                                                    <Text color="white" noOfLines={1}>{form.values || 'None'}</Text>
                                                </Box>
                                                <Box>
                                                    <Text color="gray.500">Keywords</Text>
                                                    <Text color="white" noOfLines={1}>{form.keywords || 'None'}</Text>
                                                </Box>
                                            </SimpleGrid>
                                        </Box>
                                    </VStack>
                                </MotionBox>
                            )}
                        </AnimatePresence>

                        {/* Navigation */}
                        <HStack justify="space-between" mt={8}>
                            <Button
                                variant="ghost"
                                leftIcon={<FiChevronLeft />}
                                onClick={prevStep}
                                isDisabled={currentStep === 1}
                                color="gray.400"
                                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                            >
                                Previous
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    rightIcon={<FiChevronRight />}
                                    onClick={nextStep}
                                    isDisabled={!isStepValid()}
                                    bg="brand.500"
                                    color="white"
                                    _hover={{ bg: 'brand.600' }}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    leftIcon={<FiSave />}
                                    onClick={handleSubmit}
                                    isLoading={saving}
                                    loadingText="Saving..."
                                    bg="success.500"
                                    color="white"
                                    _hover={{ bg: 'success.600' }}
                                >
                                    Save Brand DNA
                                </Button>
                            )}
                        </HStack>
                    </MotionBox>
                </Box>

                {/* Sidebar */}
                <VStack spacing={6} align="stretch">
                    {/* Live Preview */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        bg="surface.card"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="surface.border"
                        overflow="hidden"
                    >
                        <Box p={4} borderBottom="1px solid" borderColor="surface.border" bg="surface.bg">
                            <Heading size="sm" color="white">Live Preview</Heading>
                        </Box>
                        <VStack p={4} spacing={4} align="stretch">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>BRAND</Text>
                                <HStack>
                                    <Box w={4} h={4} borderRadius="sm" bg={brandColor} />
                                    <Text fontWeight="600" color="white">{form.name || 'Not set'}</Text>
                                </HStack>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>TONE</Text>
                                <Badge colorScheme="purple">{form.tone}</Badge>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>VALUES</Text>
                                <Text fontSize="sm" color="gray.300">{form.values || 'None defined'}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>AUDIENCE</Text>
                                <Text fontSize="sm" color="gray.300" noOfLines={2}>{form.targetAudience || 'Not specified'}</Text>
                            </Box>
                        </VStack>
                    </MotionBox>

                    {/* Info Card */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        bg="surface.card"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="surface.border"
                        p={4}
                    >
                        <HStack mb={3}>
                            <Icon as={FiZap} color="brand.400" />
                            <Text fontWeight="600" color="white">Why Brand DNA?</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.400" lineHeight="1.6" mb={4}>
                            Brand DNA ensures consistency across all generated content.
                            The Reviewer Agent scores every variant against your guidelines.
                        </Text>
                        <VStack spacing={2} align="start">
                            {['Consistent tone', 'Brand keywords', 'Audience alignment'].map((item, idx) => (
                                <HStack key={idx} spacing={2}>
                                    <Icon as={FiCheck} color="success.400" boxSize={4} />
                                    <Text fontSize="sm" color="gray.300">{item}</Text>
                                </HStack>
                            ))}
                        </VStack>
                    </MotionBox>
                </VStack>
            </SimpleGrid>
        </VStack>
    );
}

export default BrandSettings;
