/**
 * Keyboard Shortcuts Modal Component
 * Displays available keyboard shortcuts to users
 */

import React, { useEffect, useCallback } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack,
    HStack,
    Text,
    Box,
    Badge,
    Divider,
    Kbd,
    SimpleGrid,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Keyboard shortcut definitions
const SHORTCUTS = [
    {
        category: 'Navigation', items: [
            { keys: ['G', 'H'], description: 'Go to Dashboard' },
            { keys: ['G', 'U'], description: 'Go to Upload' },
            { keys: ['G', 'B'], description: 'Go to Brand Settings' },
            { keys: ['G', 'S'], description: 'Go to Settings' },
        ]
    },
    {
        category: 'Actions', items: [
            { keys: ['N'], description: 'New Content' },
            { keys: ['⌘/Ctrl', 'K'], description: 'Quick Search' },
            { keys: ['Esc'], description: 'Close Modal' },
        ]
    },
    {
        category: 'Content', items: [
            { keys: ['⌘/Ctrl', 'C'], description: 'Copy Selected' },
            { keys: ['⌘/Ctrl', 'Enter'], description: 'Submit Form' },
        ]
    },
];

const ShortcutItem = ({ keys, description }) => (
    <HStack justify="space-between" py={2}>
        <Text color="gray.300" fontSize="sm">{description}</Text>
        <HStack spacing={1}>
            {keys.map((key, i) => (
                <React.Fragment key={i}>
                    <Kbd
                        bg="surface.bg"
                        borderColor="surface.border"
                        color="white"
                        fontSize="xs"
                        px={2}
                        py={1}
                    >
                        {key}
                    </Kbd>
                    {i < keys.length - 1 && <Text color="gray.600">+</Text>}
                </React.Fragment>
            ))}
        </HStack>
    </HStack>
);

function KeyboardShortcutsModal({ isOpen, onClose }) {
    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
            <ModalContent bg="surface.card" border="1px solid" borderColor="surface.border">
                <ModalHeader color="white">
                    <HStack justify="space-between">
                        <Text>Keyboard Shortcuts</Text>
                        <Badge colorScheme="purple" fontSize="xs">Press ? anytime</Badge>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="gray.500" />
                <ModalBody pb={6}>
                    <VStack spacing={6} align="stretch">
                        {SHORTCUTS.map((section, idx) => (
                            <MotionBox
                                key={section.category}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Text
                                    color="gray.500"
                                    fontSize="xs"
                                    fontWeight="600"
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                    mb={2}
                                >
                                    {section.category}
                                </Text>
                                <Box
                                    bg="surface.bg"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="surface.border"
                                    px={4}
                                    py={2}
                                >
                                    {section.items.map((item, i) => (
                                        <React.Fragment key={i}>
                                            <ShortcutItem {...item} />
                                            {i < section.items.length - 1 && (
                                                <Divider borderColor="surface.border" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </MotionBox>
                        ))}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

// Hook to use keyboard shortcuts globally
export function useKeyboardShortcuts(navigate) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleKeyDown = useCallback((e) => {
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // ? to show shortcuts
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            onOpen();
            return;
        }

        // G + key for navigation
        if (e.key === 'g' || e.key === 'G') {
            const nextKey = (e2) => {
                if (e2.key === 'h' || e2.key === 'H') navigate('/');
                if (e2.key === 'u' || e2.key === 'U') navigate('/upload');
                if (e2.key === 'b' || e2.key === 'B') navigate('/brand');
                if (e2.key === 's' || e2.key === 'S') navigate('/settings');
                window.removeEventListener('keydown', nextKey);
            };
            window.addEventListener('keydown', nextKey);
            setTimeout(() => window.removeEventListener('keydown', nextKey), 1000);
        }

        // N for new content
        if (e.key === 'n' || e.key === 'N') {
            navigate('/upload');
        }
    }, [navigate, onOpen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { isOpen, onOpen, onClose };
}

export default KeyboardShortcutsModal;
