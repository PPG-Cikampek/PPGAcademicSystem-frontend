import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ category, score, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`card-basic mt-3 justify-between items-center transition-all ${score.examinerUserId ? 'ring-green-100 bg-green-100' : ''} `}
        >
            <div className="flex flex-col ">
                <h3 className="text-gray-700">{category.label}</h3>
                {score.examinerUserId && (
                    <div className="font-medium text-gray-500">
                        Telah dinilai oleh: {score.examinerUserId.name}
                    </div>
                )}
            </div>
            {score.examinerUserId ? (
                <div className="font-semibold text-gray-800">
                    {score.score}
                </div>
            ) : (
                <button
                    className='btn-mobile-primary-round-gray'
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick();
                    }}
                >
                    Mulai
                </button>
            )}
        </motion.div>
    );
};

export default ScoreCard;