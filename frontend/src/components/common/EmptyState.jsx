/**
 * Empty State Component
 * Beautiful empty states with illustrations and call-to-action
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    VStack,
    Text,
    Button,
    Icon,
    Box,
    Heading,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiUploadCloud,
    FiFileText,
    FiSettings,
    FiPlusCircle,
    FiSearch,
    FiInbox,
    FiZap,
} from 'react-icons/fi';

const MotionBox = motion(Box);

// Illustrated icon component
const IllustratedIcon = ({ icon: IconComponent, color = 'brand.500' }) => (
    <MotionBox
        position="relative"
        animate={{
            y: [0, -8, 0],
        }}
        transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        {/* Background glow */}
        <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w={32}
            h={32}
            bg={color}
            opacity={0.1}
            borderRadius="full"
            filter="blur(20px)"
        />
        {/* Outer ring */}
        <Box
            w={24}
            h={24}
            borderRadius="full"
            border="2px dashed"
            borderColor="surface.border"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            bg="surface.card"
        >
            {/* Inner icon */}
            <Box
                bg="surface.bg"
                borderRadius="xl"
                p={4}
            >
                <Icon as={IconComponent} boxSize={10} color={color} />
            </Box>
        </Box>
    </MotionBox>
);

// Empty state presets
const presets = {
    noContent: {
        icon: FiFileText,
        title: 'No Content Yet',
        description: 'Upload your first piece of content to get started with AI-powered transformation.',
        actionLabel: 'Upload Content',
        actionLink: '/upload',
        color: 'brand.500',
    },
    noVariants: {
        icon: FiZap,
        title: 'No Variants Generated',
        description: 'AI agents are standing by to transform your content for multiple platforms.',
        actionLabel: 'Generate Variants',
        color: 'accent.500',
    },
    noResults: {
        icon: FiSearch,
        title: 'No Results Found',
        description: 'Try adjusting your search or filters to find what you\'re looking for.',
        color: 'gray.500',
    },
    emptyInbox: {
        icon: FiInbox,
        title: 'All Caught Up',
        description: 'You\'re all caught up! No new notifications or updates.',
        color: 'success.500',
    },
    noBrand: {
        icon: FiSettings,
        title: 'Brand Not Configured',
        description: 'Set up your brand DNA to ensure consistent content across all platforms.',
        actionLabel: 'Configure Brand',
        actionLink: '/brand',
        color: 'warning.500',
    },
};

function EmptyState({
    preset,
    icon,
    title,
    description,
    actionLabel,
    actionLink,
    onAction,
    color = 'brand.500',
}) {
    // Use preset values if provided
    const config = preset ? { ...presets[preset] } : {};
    const finalIcon = icon || config.icon || FiInbox;
    const finalTitle = title || config.title || 'Nothing Here';
    const finalDescription = description || config.description || 'Get started by adding something.';
    const finalActionLabel = actionLabel || config.actionLabel;
    const finalActionLink = actionLink || config.actionLink;
    const finalColor = color || config.color || 'brand.500';

    return (
        <VStack py={12} spacing={6} textAlign="center" maxW="400px" mx="auto">
            <IllustratedIcon icon={finalIcon} color={finalColor} />

            <VStack spacing={2}>
                <Heading size="md" color="white">
                    {finalTitle}
                </Heading>
                <Text color="gray.400" fontSize="sm" lineHeight="1.7">
                    {finalDescription}
                </Text>
            </VStack>

            {(finalActionLabel || onAction) && (
                finalActionLink ? (
                    <Link to={finalActionLink}>
                        <Button
                            leftIcon={<FiPlusCircle />}
                            bg="brand.500"
                            color="white"
                            _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
                        >
                            {finalActionLabel}
                        </Button>
                    </Link>
                ) : onAction ? (
                    <Button
                        leftIcon={<FiPlusCircle />}
                        bg="brand.500"
                        color="white"
                        _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
                        onClick={onAction}
                    >
                        {finalActionLabel}
                    </Button>
                ) : null
            )}
        </VStack>
    );
}

export default EmptyState;
