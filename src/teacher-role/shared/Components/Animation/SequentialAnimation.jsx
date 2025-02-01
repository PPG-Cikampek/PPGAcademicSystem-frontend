import React from 'react';
import { motion } from 'framer-motion';

const SequentialAnimation = ({ variant = 1, children }) => {
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
    let childVariants;
    switch (variant) {
        case 1:
            childVariants = {
                hidden: { opacity: 0, y: -25 },
                visible: { opacity: 1, y: 0 },
            };
            break;
        case 2:
            childVariants = {
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
            };
            break;
        case 3:
            childVariants = {
                hidden: { opacity: 0, x: -25 },
                visible: { opacity: 1, x: 0 },
            };
            break;
        case 4:
            childVariants = {
                hidden: { opacity: 0, x: 25 },
                visible: { opacity: 1, x: 0 },
            };
            break;
        case 5:
            childVariants = {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
            };
            break;
        case 6: // New variant for wiggle-error-read-this-error
            childVariants = {
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    x: [0, -10, 10, -10, 10, 0], // Wiggle effect
                    transition: { duration: 0.5 },
                },
            };
            break;
        default:
            childVariants = {
                hidden: { opacity: 0, y: -25 },
                visible: { opacity: 1, y: 0 },
            };
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="sequential-animation-container"
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={childVariants}>{child}</motion.div>
            ))}
        </motion.div>
    );
};

export default SequentialAnimation;
