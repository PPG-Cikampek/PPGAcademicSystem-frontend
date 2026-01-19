import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate a stable key for a React element
// This prevents AnimatePresence from losing track of elements during re-renders
const getStableKey = (child, index) => {
    if (!child) return null;
    
    // Prefer explicit key if provided
    if (child.key && child.key !== `.${index}`) {
        return child.key;
    }
    
    // Use component displayName or name for stability
    if (child.type) {
        const typeName = child.type.displayName || child.type.name || '';
        if (typeName) {
            return `${typeName}-${index}`;
        }
    }
    
    // Fallback to index (less stable but necessary)
    return `child-${index}`;
};

const SequentialAnimation = ({ variant = 1, children, mode = 'sync' }) => {
    // Define animation variants for staggered entrance effect
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Delay each child by 0.1 seconds
            },
        },
    };

    // Define child animation variants based on the variant prop
    const childVariants = useMemo(() => {
        switch (variant) {
            case 1:
                return {
                    hidden: { opacity: 0, y: -25 },
                    visible: { opacity: 1, y: 0 },
                };
            case 2:
                return {
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0 },
                };
            case 3:
                return {
                    hidden: { opacity: 0, x: -25 },
                    visible: { opacity: 1, x: 0 },
                };
            case 4:
                return {
                    hidden: { opacity: 0, x: 25 },
                    visible: { opacity: 1, x: 0 },
                };
            case 5:
                return {
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                };
            case 6: // Wiggle effect for errors
                return {
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        x: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.5 },
                    },
                };
            default:
                return {
                    hidden: { opacity: 0, y: -25 },
                    visible: { opacity: 1, y: 0 },
                };
        }
    }, [variant]);

    // Memoize children mapping to prevent unnecessary recalculations
    const mappedChildren = useMemo(() => {
        return React.Children.map(children, (child, index) => {
            if (!child) return null;
            
            const stableKey = getStableKey(child, index);
            
            return (
                <motion.div 
                    key={stableKey} 
                    variants={childVariants}
                    // Ensure proper exit animation
                    exit="hidden"
                >
                    {child}
                </motion.div>
            );
        });
    }, [children, childVariants]);

    // Use a stable container key based on children count to help AnimatePresence
    const containerKey = useMemo(() => {
        const childCount = React.Children.count(children);
        return `sequential-container-${childCount}`;
    }, [children]);

    return (
        <AnimatePresence mode={mode}>
            <motion.div
                key={containerKey}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="sequential-animation-container"
            >
                {mappedChildren}
            </motion.div>
        </AnimatePresence>
    );
};

export default SequentialAnimation;
