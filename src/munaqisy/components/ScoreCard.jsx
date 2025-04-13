import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ category, score, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="card-basic mt-3 justify-between transition-all"
        >
            <h3 className="text-gray-600">{category.label}</h3>
            <div className="font-medium text-gray-800">
                {score && score.score}
            </div>
        </motion.div>
    );
};

export default ScoreCard;