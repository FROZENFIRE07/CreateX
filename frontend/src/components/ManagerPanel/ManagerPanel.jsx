/**
 * Manager Panel Component - Redesigned
 * 
 * AI assistant panel with typing indicators, quick actions, and modern UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Heading,
    Textarea,
    Button,
    Badge,
    IconButton,
    Tooltip,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend,
    FiZap,
    FiEdit3,
    FiRefreshCw,
    FiMessageCircle,
    FiUser,
    FiCpu,
    FiAlertCircle,
    FiCheckCircle,
} from 'react-icons/fi';
import api from '../../services/api';
import ConfirmationModal from './ConfirmationModal';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Quick action suggestions
const QUICK_ACTIONS = [
    { label: 'Make shorter', icon: FiEdit3, prompt: 'Make this more concise' },
    { label: 'Add hashtags', icon: FiZap, prompt: 'Add relevant hashtags' },
    { label: 'More formal', icon: FiMessageCircle, prompt: 'Make the tone more professional' },
    { label: 'Regenerate', icon: FiRefreshCw, prompt: 'Regenerate this variant with a fresh approach' },
];

// Typing indicator component
const TypingIndicator = () => (
    <HStack spacing={1} px={4} py={3}>
        <MotionBox
            w={2}
            h={2}
            borderRadius="full"
            bg="brand.400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <MotionBox
            w={2}
            h={2}
            borderRadius="full"
            bg="brand.400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <MotionBox
            w={2}
            h={2}
            borderRadius="full"
            bg="brand.400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
    </HStack>
);

// Message bubble component
const MessageBubble = ({ message, index }) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';
    const isConfirm = message.type === 'confirm';

    const getIcon = () => {
        if (isUser) return FiUser;
        if (isError) return FiAlertCircle;
        if (isConfirm) return FiCheckCircle;
        return FiCpu;
    };

    const getBg = () => {
        if (isUser) return 'brand.500';
        if (isError) return 'rgba(239, 68, 68, 0.15)';
        if (isConfirm) return 'rgba(245, 158, 11, 0.15)';
        return 'surface.bg';
    };

    const getBorderColor = () => {
        if (isError) return 'error.500';
        if (isConfirm) return 'warning.500';
        return 'surface.border';
    };

    return (
        <MotionFlex
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            justify={isUser ? 'flex-end' : 'flex-start'}
            w="full"
            px={2}
        >
            <HStack
                align="start"
                spacing={2}
                maxW="90%"
                flexDir={isUser ? 'row-reverse' : 'row'}
            >
                {!isUser && (
                    <Box
                        bg={isError ? 'error.500' : isConfirm ? 'warning.500' : 'brand.500'}
                        borderRadius="full"
                        p={1.5}
                        flexShrink={0}
                    >
                        <Box as={getIcon()} color="white" size={12} />
                    </Box>
                )}
                <Box
                    bg={getBg()}
                    border={!isUser ? '1px solid' : 'none'}
                    borderColor={getBorderColor()}
                    borderRadius={isUser ? 'xl' : 'lg'}
                    borderTopLeftRadius={!isUser ? 'sm' : undefined}
                    borderTopRightRadius={isUser ? 'sm' : undefined}
                    px={4}
                    py={2.5}
                >
                    <Text
                        fontSize="sm"
                        color={isUser ? 'white' : isError ? 'error.400' : 'gray.200'}
                        lineHeight="1.5"
                    >
                        {message.content}
                    </Text>
                </Box>
            </HStack>
        </MotionFlex>
    );
};

const ManagerPanel = ({ contentId, onVariantsUpdated }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('idle');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const onVariantsUpdatedRef = useRef(onVariantsUpdated);

    // Keep callback ref updated
    useEffect(() => {
        onVariantsUpdatedRef.current = onVariantsUpdated;
    }, [onVariantsUpdated]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (content, type = 'system') => {
        setMessages(prev => [...prev, { content, type }]);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || status !== 'idle') return;

        const userMessage = input.trim();
        setInput('');
        addMessage(userMessage, 'user');
        setStatus('thinking');

        try {
            const response = await api.post('/manager/interact', {
                contentId,
                message: userMessage
            });

            if (response.data.success) {
                if (response.data.requiresConfirmation) {
                    setConfirmModal({
                        isOpen: true,
                        message: response.data.confirmationMessage,
                        pendingAction: response.data.classification,
                        dryRunSummary: response.data.validation?.dryRunSummary,
                        skippedVariants: response.data.validation?.skippedVariants || [],
                        allowForceOverwrite: response.data.validation?.skippedVariants?.length > 0
                    });
                    addMessage(response.data.confirmationMessage, 'confirm');
                    setStatus('idle');
                } else {
                    const resultMsg = response.data.result?.message ||
                        response.data.message ||
                        'Done!';
                    addMessage(resultMsg, 'assistant');
                    setStatus('idle');

                    if (response.data.result?.action &&
                        ['pipeline_complete', 'images_regenerated', 'variant_refined'].includes(response.data.result.action)) {
                        if (onVariantsUpdatedRef.current) {
                            onVariantsUpdatedRef.current();
                        }
                    }
                }
            } else {
                addMessage(`Error: ${response.data.error}`, 'error');
                setStatus('idle');
            }
        } catch (err) {
            console.error('[ManagerPanel] Submit error:', err);
            addMessage(`Failed to process request: ${err.message}`, 'error');
            setStatus('idle');
        }
    };

    const handleQuickAction = (prompt) => {
        setInput(prompt);
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e);
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'thinking':
                return <Badge colorScheme="purple" variant="subtle">Thinking...</Badge>;
            case 'executing':
                return <Badge colorScheme="orange" variant="subtle">Executing...</Badge>;
            default:
                return <Badge colorScheme="green" variant="subtle">Ready</Badge>;
        }
    };

    return (
        <Box
            bg="surface.card"
            borderRadius="xl"
            border="1px solid"
            borderColor="surface.border"
            overflow="hidden"
            position="sticky"
            top="80px"
            maxH="calc(100vh - 100px)"
            display="flex"
            flexDirection="column"
        >
            {/* Header */}
            <HStack
                justify="space-between"
                p={4}
                borderBottom="1px solid"
                borderColor="surface.border"
                bg="surface.bg"
            >
                <HStack spacing={3}>
                    <Box
                        bg="brand.500"
                        borderRadius="lg"
                        p={2}
                        boxShadow="0 0 15px rgba(99, 102, 241, 0.3)"
                    >
                        <FiCpu color="white" size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Heading size="sm" color="white">Manager Agent</Heading>
                        <Text fontSize="xs" color="gray.500">AI-powered assistant</Text>
                    </VStack>
                </HStack>
                {getStatusBadge()}
            </HStack>

            {/* Messages */}
            <VStack
                flex={1}
                spacing={3}
                py={4}
                overflowY="auto"
                minH="200px"
                maxH="350px"
                align="stretch"
                css={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: '#4B5563', borderRadius: '4px' },
                }}
            >
                {messages.length === 0 ? (
                    <VStack py={6} px={4} spacing={3}>
                        <Box
                            bg="rgba(99, 102, 241, 0.1)"
                            borderRadius="full"
                            p={4}
                        >
                            <FiMessageCircle size={28} color="#6366f1" />
                        </Box>
                        <Text color="gray.400" textAlign="center" fontSize="sm">
                            Hi! I can help you transform and refine your content.
                        </Text>
                        <Text color="gray.600" textAlign="center" fontSize="xs">
                            Try: "Make this shorter" or "Add more hashtags"
                        </Text>
                    </VStack>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} message={msg} index={idx} />
                        ))}
                    </AnimatePresence>
                )}

                {/* Typing Indicator */}
                <AnimatePresence>
                    {status === 'thinking' && (
                        <MotionBox
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <TypingIndicator />
                        </MotionBox>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </VStack>

            {/* Quick Actions */}
            <Box px={4} pb={2}>
                <Wrap spacing={2}>
                    {QUICK_ACTIONS.map((action, idx) => (
                        <WrapItem key={idx}>
                            <Tooltip label={action.prompt} placement="top">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    leftIcon={<action.icon size={12} />}
                                    onClick={() => handleQuickAction(action.prompt)}
                                    isDisabled={status !== 'idle'}
                                    borderColor="surface.border"
                                    color="gray.400"
                                    _hover={{ bg: 'whiteAlpha.100', color: 'white', borderColor: 'brand.400' }}
                                >
                                    {action.label}
                                </Button>
                            </Tooltip>
                        </WrapItem>
                    ))}
                </Wrap>
            </Box>

            {/* Input */}
            <Box p={4} borderTop="1px solid" borderColor="surface.border" bg="surface.bg">
                <form onSubmit={handleSubmit}>
                    <HStack spacing={2}>
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What would you like to do?"
                            rows={2}
                            disabled={status !== 'idle'}
                            bg="surface.card"
                            border="1px solid"
                            borderColor="surface.border"
                            resize="none"
                            _hover={{ borderColor: 'surface.borderHover' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #6366f1' }}
                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        />
                        <IconButton
                            type="submit"
                            icon={<FiSend />}
                            colorScheme="purple"
                            isDisabled={!input.trim() || status !== 'idle'}
                            isLoading={status !== 'idle'}
                            aria-label="Send message"
                            h="auto"
                            py={6}
                        />
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mt={2}>
                        Press Ctrl+Enter to send
                    </Text>
                </form>
            </Box>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                onConfirm={(result) => {
                    addMessage('Action confirmed, executing...', 'system');
                    setStatus('executing');
                    setTimeout(() => {
                        setStatus('idle');
                        if (onVariantsUpdated) {
                            onVariantsUpdated();
                        }
                    }, 1000);
                }}
                contentId={contentId}
                pendingAction={confirmModal.pendingAction}
                message={confirmModal.message}
                dryRunSummary={confirmModal.dryRunSummary}
                skippedVariants={confirmModal.skippedVariants}
                allowForceOverwrite={confirmModal.allowForceOverwrite}
            />
        </Box>
    );
};

export default ManagerPanel;
