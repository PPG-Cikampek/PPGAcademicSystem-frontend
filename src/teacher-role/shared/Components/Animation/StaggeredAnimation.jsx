import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Delay between each child’s animation
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
};

const StaggeredAnimation = ({ children }) => {
  return (
    <motion.div
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          className="item"
          variants={itemVariants}
          transition={{ duration: 0.5 }}
        >
          <h2>Section {index + 1}</h2>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredAnimation;
