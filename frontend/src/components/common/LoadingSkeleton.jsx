/**
 * Loading Skeleton Components
 * Skeleton loaders for various content types
 */

import { Box, Skeleton, SkeletonText, SkeletonCircle, HStack, VStack } from '@chakra-ui/react';

// Generic card skeleton
export function CardSkeleton({ height = '200px' }) {
    return (
        <Box
            bg="surface.card"
            borderRadius="xl"
            border="1px solid"
            borderColor="surface.border"
            p={6}
            height={height}
        >
            <Skeleton height="20px" width="60%" mb={4} />
            <SkeletonText noOfLines={3} spacing={3} />
        </Box>
    );
}

// KPI card skeleton
export function KPISkeleton() {
    return (
        <Box
            bg="surface.card"
            borderRadius="xl"
            border="1px solid"
            borderColor="surface.border"
            p={6}
        >
            <Skeleton height="14px" width="80px" mb={3} />
            <Skeleton height="40px" width="100px" mb={2} />
            <Skeleton height="12px" width="60px" />
        </Box>
    );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }) {
    return (
        <HStack spacing={4} py={4} borderBottom="1px solid" borderColor="surface.border">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} height="16px" flex={1} />
            ))}
        </HStack>
    );
}

// Content list item skeleton
export function ContentItemSkeleton() {
    return (
        <Box
            bg="surface.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="surface.border"
            p={4}
            mb={3}
        >
            <HStack justify="space-between" mb={3}>
                <Skeleton height="18px" width="200px" />
                <Skeleton height="24px" width="80px" borderRadius="full" />
            </HStack>
            <HStack spacing={3}>
                <Skeleton height="20px" width="60px" borderRadius="full" />
                <Skeleton height="20px" width="80px" borderRadius="full" />
                <Skeleton height="14px" width="100px" />
            </HStack>
        </Box>
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                    <Skeleton height="32px" width="200px" />
                    <Skeleton height="16px" width="300px" />
                </VStack>
                <Skeleton height="40px" width="120px" borderRadius="lg" />
            </HStack>

            {/* KPI Grid */}
            <HStack spacing={4}>
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
            </HStack>

            {/* Chart placeholder */}
            <Box
                bg="surface.card"
                borderRadius="xl"
                border="1px solid"
                borderColor="surface.border"
                p={6}
                height="300px"
            >
                <Skeleton height="20px" width="150px" mb={6} />
                <Skeleton height="200px" width="100%" />
            </Box>

            {/* Content list */}
            <Box
                bg="surface.card"
                borderRadius="xl"
                border="1px solid"
                borderColor="surface.border"
                p={6}
            >
                <Skeleton height="20px" width="150px" mb={6} />
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                ))}
            </Box>
        </VStack>
    );
}

// Platform preview skeleton
export function PreviewSkeleton() {
    return (
        <Box
            bg="surface.card"
            borderRadius="xl"
            border="1px solid"
            borderColor="surface.border"
            overflow="hidden"
        >
            {/* Avatar and name */}
            <HStack p={4} spacing={3}>
                <SkeletonCircle size="12" />
                <VStack align="start" spacing={1}>
                    <Skeleton height="14px" width="100px" />
                    <Skeleton height="12px" width="80px" />
                </VStack>
            </HStack>

            {/* Content */}
            <Box px={4} pb={4}>
                <SkeletonText noOfLines={4} spacing={3} />
            </Box>

            {/* Image placeholder */}
            <Skeleton height="200px" width="100%" />

            {/* Actions */}
            <HStack p={4} spacing={6}>
                <Skeleton height="16px" width="40px" />
                <Skeleton height="16px" width="40px" />
                <Skeleton height="16px" width="40px" />
            </HStack>
        </Box>
    );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isUser = false }) {
    return (
        <HStack
            spacing={3}
            align="start"
            justify={isUser ? 'flex-end' : 'flex-start'}
            py={2}
        >
            {!isUser && <SkeletonCircle size="8" />}
            <Box
                bg={isUser ? 'brand.500' : 'surface.card'}
                borderRadius="lg"
                p={3}
                maxW="70%"
                opacity={0.5}
            >
                <SkeletonText noOfLines={2} spacing={2} width="200px" />
            </Box>
        </HStack>
    );
}

// Form skeleton
export function FormSkeleton({ fields = 3 }) {
    return (
        <VStack spacing={6} align="stretch">
            {Array.from({ length: fields }).map((_, i) => (
                <VStack key={i} align="start" spacing={2}>
                    <Skeleton height="14px" width="80px" />
                    <Skeleton height="44px" width="100%" borderRadius="lg" />
                </VStack>
            ))}
            <Skeleton height="44px" width="100%" borderRadius="lg" mt={4} />
        </VStack>
    );
}

export default {
    CardSkeleton,
    KPISkeleton,
    TableRowSkeleton,
    ContentItemSkeleton,
    DashboardSkeleton,
    PreviewSkeleton,
    ChatMessageSkeleton,
    FormSkeleton,
};
