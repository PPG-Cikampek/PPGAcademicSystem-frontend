import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedComponent = ({ children, animationType = "fadeIn" }) => {
    const controls = useAnimation();
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const variants = {
        fadeIn: { opacity: 1, y: 0 },
        slideInLeft: { opacity: 1, x: 0 },
        slideInRight: { opacity: 1, x: 0 },
        zoomIn: { opacity: 1, scale: 1 },
    };

    const initialStates = {
        fadeIn: { opacity: 0, y: 50 },
        slideInLeft: { opacity: 0, x: -50 },
        slideInRight: { opacity: 0, x: 50 },
        zoomIn: { opacity: 0, scale: 0.5 },
    };

    React.useEffect(() => {
        if (inView) {
            controls.start(variants[animationType]);
        }
    }, [controls, inView, animationType]);

    return (
        <motion.div
            ref={ref}
            initial={initialStates[animationType]}
            animate={controls}
            transition={{ duration: 1.5 }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedComponent;