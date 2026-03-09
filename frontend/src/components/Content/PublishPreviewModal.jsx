/**
 * Publish Preview Modal
 * Human-in-the-loop confirmation before publishing
 * Shows formatted content for each platform with option to confirm or cancel
 */

import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    VStack,
    HStack,
    Text,
    Button,
    Badge,
    Icon,
    Box,
    Divider,
    Checkbox,
    Alert,
    AlertIcon,
    Spinner,
} from '@chakra-ui/react';
import {
    FiTwitter,
    FiLinkedin,
    FiMail,
    FiInstagram,
    FiFileText,
    FiSend,
    FiCheck,
    FiX,
    FiAlertTriangle,
    FiExternalLink,
} from 'react-icons/fi';
import api from '../../services/api';
import { showToast } from '../common';

const PLATFORM_CONFIG = {
    twitter: { icon: FiTwitter, color: '#1DA1F2', label: 'Twitter/X' },
    linkedin: { icon: FiLinkedin, color: '#0A66C2', label: 'LinkedIn' },
    instagram: { icon: FiInstagram, color: '#E4405F', label: 'Instagram' },
    email: { icon: FiMail, color: '#EA4335', label: 'Email' },
    blog: { icon: FiFileText, color: '#10B981', label: 'Blog' },
};

function PublishPreviewModal({ isOpen, onClose, contentId, variants, mode = 'mock' }) {
    const [selectedPlatforms, setSelectedPlatforms] = useState(
        variants.filter(v => v.status === 'approved').map(v => v.platform)
    );
    const [publishing, setPublishing] = useState(false);
    const [results, setResults] = useState(null);

    const approvedVariants = variants.filter(v => v.status === 'approved');

    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handlePublish = async () => {
        if (selectedPlatforms.length === 0) {
            showToast.warning('Select at least one platform to publish');
            return;
        }

        setPublishing(true);
        try {
            const res = await api.post('/publish/confirm', {
                contentId,
                platforms: selectedPlatforms,
                mode,
            });

            setResults(res.data);

            const successCount = res.data.published?.length || 0;
            const failCount = res.data.failed?.length || 0;

            if (successCount > 0 && failCount === 0) {
                showToast.celebrate(`Published to ${successCount} platform(s)!`);
            } else if (successCount > 0) {
                showToast.success(`Published ${successCount}, failed ${failCount}`);
            } else {
                showToast.error('Publishing failed for all platforms');
            }
        } catch (err) {
            showToast.error(err.response?.data?.error || 'Publishing failed');
        } finally {
            setPublishing(false);
        }
    };

    const isLive = mode === 'live';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
            <ModalContent bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="2xl">
                <ModalHeader pb={2}>
                    <VStack align="start" spacing={1}>
                        <HStack>
                            <Icon as={FiSend} color="brand.400" />
                            <Text color="app.text">
                                {results ? 'Publish Results' : 'Review & Publish'}
                            </Text>
                        </HStack>
                        <HStack spacing={2}>
                            <Badge
                                colorScheme={isLive ? 'red' : 'gray'}
                                variant="subtle"
                                fontSize="xs"
                                rounded="full"
                            >
                                {isLive ? '● LIVE' : '○ MOCK'}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                                {isLive ? 'Will publish to real accounts' : 'Simulated — no real posts'}
                            </Text>
                        </HStack>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton color="gray.500" />

                <ModalBody>
                    {!results ? (
                        // Preview state
                        <VStack spacing={4} align="stretch">
                            {isLive && (
                                <Alert
                                    status="warning"
                                    bg="rgba(251, 191, 36, 0.08)"
                                    rounded="xl"
                                    border="1px solid"
                                    borderColor="rgba(251, 191, 36, 0.2)"
                                >
                                    <AlertIcon color="#FBBF24" />
                                    <Text fontSize="sm" color="gray.300">
                                        Live mode — content will be posted to your connected social media accounts.
                                    </Text>
                                </Alert>
                            )}

                            {approvedVariants.map((variant) => {
                                const config = PLATFORM_CONFIG[variant.platform] || PLATFORM_CONFIG.blog;
                                const isSelected = selectedPlatforms.includes(variant.platform);

                                return (
                                    <Box
                                        key={variant.platform}
                                        bg="surface.bg"
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={isSelected ? config.color : 'surface.border'}
                                        p={4}
                                        opacity={isSelected ? 1 : 0.6}
                                        transition="all 0.2s"
                                    >
                                        <HStack justify="space-between" mb={3}>
                                            <HStack spacing={3}>
                                                <Checkbox
                                                    colorScheme="orange"
                                                    isChecked={isSelected}
                                                    onChange={() => togglePlatform(variant.platform)}
                                                />
                                                <Box
                                                    bg={`${config.color}20`}
                                                    p={1.5}
                                                    rounded="lg"
                                                >
                                                    <Icon as={config.icon} color={config.color} boxSize={4} />
                                                </Box>
                                                <Text fontWeight="600" color="app.text" fontSize="sm">
                                                    {config.label}
                                                </Text>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="green" fontSize="2xs" rounded="full">
                                                    {variant.consistencyScore}%
                                                </Badge>
                                                <Text fontSize="xs" color="gray.500">
                                                    {variant.content?.length || 0} chars
                                                </Text>
                                            </HStack>
                                        </HStack>

                                        <Box
                                            bg="rgba(0,0,0,0.2)"
                                            p={3}
                                            borderRadius="lg"
                                            maxH="120px"
                                            overflowY="auto"
                                        >
                                            <Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
                                                {variant.content?.substring(0, 300)}
                                                {(variant.content?.length || 0) > 300 ? '...' : ''}
                                            </Text>
                                        </Box>

                                        {variant.image?.url && (
                                            <HStack mt={2} spacing={2}>
                                                <Badge variant="outline" colorScheme="purple" fontSize="2xs">
                                                    Image attached
                                                </Badge>
                                            </HStack>
                                        )}
                                    </Box>
                                );
                            })}
                        </VStack>
                    ) : (
                        // Results state
                        <VStack spacing={4} align="stretch">
                            {results.published?.map((item) => {
                                const config = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.blog;
                                return (
                                    <HStack
                                        key={item.platform}
                                        bg="rgba(74, 222, 128, 0.08)"
                                        p={3}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="rgba(74, 222, 128, 0.2)"
                                        justify="space-between"
                                    >
                                        <HStack spacing={3}>
                                            <Icon as={FiCheck} color="#4ADE80" boxSize={4} />
                                            <Icon as={config.icon} color={config.color} boxSize={4} />
                                            <Text fontSize="sm" color="app.text" fontWeight="500">
                                                {config.label}
                                            </Text>
                                            <Badge fontSize="2xs" colorScheme="gray" rounded="full">
                                                {item.mode}
                                            </Badge>
                                        </HStack>
                                        {item.postUrl && (
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                rightIcon={<FiExternalLink />}
                                                color="brand.400"
                                                onClick={() => window.open(item.postUrl, '_blank', 'noopener,noreferrer')}
                                            >
                                                View
                                            </Button>
                                        )}
                                    </HStack>
                                );
                            })}

                            {results.failed?.map((item) => {
                                const config = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.blog;
                                return (
                                    <HStack
                                        key={item.platform}
                                        bg="rgba(248, 113, 113, 0.08)"
                                        p={3}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="rgba(248, 113, 113, 0.2)"
                                    >
                                        <Icon as={FiX} color="#F87171" boxSize={4} />
                                        <Icon as={config.icon} color={config.color} boxSize={4} />
                                        <VStack align="start" spacing={0} flex={1}>
                                            <Text fontSize="sm" color="app.text" fontWeight="500">
                                                {config.label}
                                            </Text>
                                            <Text fontSize="xs" color="error.400">
                                                {item.error || 'Unknown error'}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                );
                            })}

                            {results.summary && (
                                <Box bg="surface.bg" p={3} borderRadius="lg">
                                    <Text fontSize="xs" color="gray.500">
                                        {results.summary.publishedCount}/{results.summary.totalVariants} published
                                        {results.summary.mode === 'mock' && ' (mock mode)'}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter>
                    {!results ? (
                        <HStack spacing={3}>
                            <Button
                                variant="ghost"
                                color="gray.400"
                                onClick={onClose}
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="brand.500"
                                color="white"
                                leftIcon={publishing ? <Spinner size="sm" /> : <FiSend />}
                                isLoading={publishing}
                                loadingText="Publishing..."
                                onClick={handlePublish}
                                isDisabled={selectedPlatforms.length === 0}
                                _hover={{ bg: 'brand.600' }}
                            >
                                {isLive ? 'Publish Live' : 'Publish (Mock)'}
                            </Button>
                        </HStack>
                    ) : (
                        <Button
                            bg="brand.500"
                            color="white"
                            onClick={onClose}
                            _hover={{ bg: 'brand.600' }}
                        >
                            Done
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default PublishPreviewModal;
