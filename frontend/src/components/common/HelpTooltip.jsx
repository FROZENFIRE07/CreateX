/**
 * Help Tooltip Component
 * Contextual help tooltips with icon trigger
 */

import React from 'react';
import {
    Tooltip,
    Icon,
    Box,
    Text,
    VStack,
    HStack,
    Badge,
} from '@chakra-ui/react';
import { FiHelpCircle, FiInfo } from 'react-icons/fi';

// Simple help icon with tooltip
export const HelpTooltip = ({ label, placement = 'top' }) => (
    <Tooltip
        label={label}
        placement={placement}
        bg="surface.card"
        color="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="surface.border"
        px={3}
        py={2}
        fontSize="sm"
        hasArrow
        arrowShadowColor="surface.border"
    >
        <span>
            <Icon
                as={FiHelpCircle}
                color="gray.500"
                cursor="help"
                _hover={{ color: 'brand.400' }}
                transition="color 0.2s"
            />
        </span>
    </Tooltip>
);

// Info tooltip with more content
export const InfoTooltip = ({
    title,
    content,
    placement = 'top',
    children
}) => (
    <Tooltip
        label={
            <VStack align="start" spacing={1}>
                {title && <Text fontWeight="600">{title}</Text>}
                <Text fontSize="sm" color="gray.300">{content}</Text>
            </VStack>
        }
        placement={placement}
        bg="surface.card"
        color="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="surface.border"
        px={3}
        py={2}
        hasArrow
        arrowShadowColor="surface.border"
    >
        {children || (
            <span>
                <Icon
                    as={FiInfo}
                    color="gray.500"
                    cursor="help"
                    _hover={{ color: 'brand.400' }}
                    transition="color 0.2s"
                />
            </span>
        )}
    </Tooltip>
);

// Keyboard shortcut hint badge
export const ShortcutHint = ({ keys }) => (
    <HStack spacing={1}>
        {keys.map((key, i) => (
            <Badge
                key={i}
                bg="surface.bg"
                color="gray.400"
                fontSize="xs"
                px={1.5}
                py={0.5}
                borderRadius="md"
                border="1px solid"
                borderColor="surface.border"
            >
                {key}
            </Badge>
        ))}
    </HStack>
);

export default HelpTooltip;
