/**
 * Animated Card Component
 * Card with hover effects and entrance animations using Framer Motion
 */

import { Box, useStyleConfig } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export function AnimatedCard({
    children,
    variant = 'default',
    hoverScale = 1.02,
    hoverY = -4,
    delay = 0,
    onClick,
    cursor,
    ...props
}) {
    const styles = useStyleConfig('Card', { variant });

    return (
        <MotionBox
            bg="surface.card"
            borderRadius="xl"
            border="1px solid"
            borderColor="surface.border"
            overflow="hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                scale: hoverScale,
                y: hoverY,
                borderColor: 'rgba(99, 102, 241, 0.3)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)',
            }}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            cursor={onClick ? 'pointer' : cursor}
            {...props}
        >
            {children}
        </MotionBox>
    );
}

// KPI Card variant with glow effect
export function KPICard({
    label,
    value,
    unit,
    change,
    positive,
    icon,
    delay = 0,
    ...props
}) {
    return (
        <AnimatedCard delay={delay} p={6} {...props}>
            <Box color="gray.400" fontSize="sm" fontWeight="500" mb={2}>
                {icon && <Box as="span" mr={2}>{icon}</Box>}
                {label}
            </Box>
            <Box
                fontSize="3xl"
                fontWeight="700"
                color="white"
                letterSpacing="-0.02em"
            >
                {value}
                {unit && (
                    <Box as="span" fontSize="lg" fontWeight="500" color="gray.400" ml={1}>
                        {unit}
                    </Box>
                )}
            </Box>
            {change && (
                <Box
                    fontSize="sm"
                    mt={2}
                    color={positive ? 'success.400' : positive === false ? 'error.400' : 'gray.500'}
                >
                    {positive && '↑ '}{positive === false && '↓ '}{change}
                </Box>
            )}
        </AnimatedCard>
    );
}

// Glassmorphism card variant
export function GlassCard({ children, blur = '20px', ...props }) {
    return (
        <AnimatedCard
            bg="rgba(255, 255, 255, 0.05)"
            backdropFilter={`blur(${blur})`}
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            {...props}
        >
            {children}
        </AnimatedCard>
    );
}

// Interactive list item card
export function ListItemCard({ children, onClick, ...props }) {
    return (
        <MotionBox
            bg="surface.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="surface.border"
            p={4}
            cursor={onClick ? 'pointer' : 'default'}
            onClick={onClick}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{
                x: 4,
                borderColor: 'rgba(99, 102, 241, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </MotionBox>
    );
}

export default AnimatedCard;
