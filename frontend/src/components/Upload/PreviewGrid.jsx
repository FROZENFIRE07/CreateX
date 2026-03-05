/**
 * PreviewGrid — Platform Preview Grid
 * Displays AI-generated content variants in platform-specific cards.
 * Each card: generated text, publish toggle, edit button, copy button.
 * When publish toggle is ON → publishes to that platform's library.
 */

import React, { useState } from 'react';
import {
    Box, SimpleGrid, VStack, HStack, Text, IconButton, Switch,
    Tooltip, Textarea, Icon, useColorModeValue, Badge, Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiCopy, FiEdit3, FiCheck, FiX, FiUploadCloud,
    FiTwitter, FiLinkedin, FiMail, FiInstagram, FiFileText,
} from 'react-icons/fi';

const MotionBox = motion(Box);

// Theme constants
const T = {
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    primaryGlow: 'rgba(255,107,1,0.25)',
    primaryFaint: 'rgba(255,107,1,0.08)',
};

// Platform metadata
const PLATFORM_META = {
    twitter: { icon: FiTwitter, color: '#1DA1F2', label: 'Twitter / X' },
    linkedin: { icon: FiLinkedin, color: '#0A66C2', label: 'LinkedIn' },
    instagram: { icon: FiInstagram, color: '#E4405F', label: 'Instagram' },
    blog: { icon: FiFileText, color: '#10B981', label: 'Blog' },
    email: { icon: FiMail, color: '#EA4335', label: 'Email' },
};

function PreviewCard({ variant, onUpdate, onPublish }) {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(variant.content || '');
    const [published, setPublished] = useState(false);
    const [copied, setCopied] = useState(false);

    const meta = PLATFORM_META[variant.platform?.toLowerCase()] || {
        icon: FiFileText, color: '#888', label: variant.platform,
    };

    const cardBg = useColorModeValue('white', '#2A2A2A');
    const cardBorder = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)');
    const textColor = useColorModeValue('gray.800', 'gray.100');
    const subTextColor = useColorModeValue('gray.600', 'gray.400');
    const editBg = useColorModeValue('gray.50', 'blackAlpha.400');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(variant.content || editContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* noop */ }
    };

    const handleSaveEdit = () => {
        if (onUpdate) onUpdate(variant.platform, editContent);
        setEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(variant.content || '');
        setEditing(false);
    };

    const handlePublishToggle = () => {
        if (!published && onPublish) {
            onPublish(variant);
            setPublished(true);
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            bg={cardBg}
            border="1px solid"
            borderColor={published ? `${meta.color}60` : cardBorder}
            borderRadius="2xl"
            overflow="hidden"
            _hover={{ borderColor: `${meta.color}40`, boxShadow: `0 4px 20px rgba(0,0,0,0.15)` }}
            position="relative"
        >
            {/* Published overlay indicator */}
            {published && (
                <Box
                    position="absolute" top={0} left={0} w="100%" h="100%"
                    bg={`${meta.color}05`} pointerEvents="none" zIndex={0}
                />
            )}

            {/* Header */}
            <HStack
                p={4}
                borderBottom="1px solid"
                borderColor={cardBorder}
                bg={`${meta.color}08`}
                spacing={3}
                position="relative"
                zIndex={1}
            >
                <Box
                    bg={meta.color}
                    borderRadius="lg"
                    p={2}
                    boxShadow={`0 0 12px ${meta.color}40`}
                >
                    <Icon as={meta.icon} color="white" boxSize={4} />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="700" fontSize="sm" color={textColor}>
                        {meta.label}
                    </Text>
                    {variant.consistencyScore && (
                        <Badge
                            bg="rgba(74,222,128,0.15)"
                            color="#4ADE80"
                            rounded="full"
                            px={2}
                            fontSize="2xs"
                        >
                            {variant.consistencyScore}% match
                        </Badge>
                    )}
                </VStack>

                {/* Publish Toggle */}
                <Tooltip label={published ? '✓ Published!' : 'Publish to library'} hasArrow>
                    <HStack spacing={1.5}>
                        <Icon
                            as={published ? FiCheck : FiUploadCloud}
                            color={published ? '#4ADE80' : 'gray.500'}
                            boxSize={3.5}
                        />
                        <Switch
                            size="sm"
                            colorScheme="green"
                            isChecked={published}
                            onChange={handlePublishToggle}
                            isDisabled={published}
                        />
                    </HStack>
                </Tooltip>
            </HStack>

            {/* Content */}
            <Box p={4} position="relative" zIndex={1}>
                {editing ? (
                    <VStack spacing={3} align="stretch">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            fontSize="sm"
                            lineHeight="1.7"
                            minH="120px"
                            bg={editBg}
                            border="1px solid"
                            borderColor={T.primary}
                            rounded="xl"
                            _focus={{ boxShadow: `0 0 0 1px ${T.primaryGlow}` }}
                        />
                        <HStack justify="flex-end" spacing={2}>
                            <IconButton
                                size="sm"
                                icon={<FiX />}
                                variant="ghost"
                                color="gray.500"
                                onClick={handleCancelEdit}
                                aria-label="Cancel edit"
                            />
                            <IconButton
                                size="sm"
                                icon={<FiCheck />}
                                bg={T.primary}
                                color="white"
                                _hover={{ bg: T.primaryHover }}
                                onClick={handleSaveEdit}
                                aria-label="Save edit"
                            />
                        </HStack>
                    </VStack>
                ) : (
                    <Text
                        fontSize="sm"
                        color={subTextColor}
                        lineHeight="1.7"
                        noOfLines={6}
                        whiteSpace="pre-wrap"
                    >
                        {variant.content || 'No content generated for this platform.'}
                    </Text>
                )}
            </Box>

            {/* Actions */}
            {!editing && (
                <HStack
                    px={4}
                    py={3}
                    borderTop="1px solid"
                    borderColor={cardBorder}
                    justify="space-between"
                    position="relative"
                    zIndex={1}
                >
                    <HStack spacing={1}>
                        {published && (
                            <Badge bg="rgba(74,222,128,0.15)" color="#4ADE80" rounded="full" px={2.5} fontSize="2xs">
                                Published
                            </Badge>
                        )}
                    </HStack>
                    <HStack spacing={1}>
                        <Tooltip label="Edit content" hasArrow>
                            <IconButton
                                size="sm"
                                icon={<FiEdit3 />}
                                variant="ghost"
                                color={subTextColor}
                                _hover={{ color: T.primary, bg: T.primaryFaint }}
                                onClick={() => setEditing(true)}
                                isDisabled={published}
                                aria-label="Edit"
                            />
                        </Tooltip>
                        <Tooltip label={copied ? 'Copied!' : 'Copy to clipboard'} hasArrow>
                            <IconButton
                                size="sm"
                                icon={copied ? <FiCheck /> : <FiCopy />}
                                variant="ghost"
                                color={copied ? '#4ADE80' : subTextColor}
                                _hover={{ color: T.primary, bg: T.primaryFaint }}
                                onClick={handleCopy}
                                aria-label="Copy"
                            />
                        </Tooltip>
                    </HStack>
                </HStack>
            )}
        </MotionBox>
    );
}

export default function PreviewGrid({ variants = [], onUpdateVariant, onPublish }) {
    const headerColor = useColorModeValue('gray.800', 'white');

    if (!variants || variants.length === 0) return null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            {/* Section Header */}
            <HStack mb={5} spacing={3}>
                <Box w="3px" h="24px" bg={T.primary} rounded="full" />
                <Text fontSize="lg" fontWeight="700" color={headerColor}>
                    Platform Previews
                </Text>
                <Badge bg={T.primaryFaint} color={T.primary} rounded="full" px={2.5} fontSize="xs">
                    {variants.length} platforms
                </Badge>
                <Text fontSize="xs" color="gray.500" ml="auto">
                    Toggle the switch to publish each platform
                </Text>
            </HStack>

            {/* Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
                {variants.map((variant, idx) => (
                    <PreviewCard
                        key={variant.platform || idx}
                        variant={variant}
                        onUpdate={onUpdateVariant}
                        onPublish={onPublish}
                    />
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}
