import React from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedComponent = ({ children }) => {
    const controls = useAnimation();
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    React.useEffect(() => {
        if (inView) {
            controls.start({ opacity: 1, x: 0 });
        }
    }, [controls, inView]);

    return (
        <AnimatePresence>
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 50 }
            }
            animate={controls}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
        </AnimatePresence>
    );
};

export default AnimatedComponent;
