import React from 'react';
import { motion } from 'framer-motion';
import SequentialAnimation from '../../teacher-role/shared/Components/Animation/SequentialAnimation';
import ScoreCard from './ScoreCard';

const ScoreList = ({ categories, studentScore, onCategoryClick }) => {
    return (
        <div className="flex flex-col px-4">
            <SequentialAnimation variant={2}>
                {categories.map((category) => (
                    <ScoreCard
                        key={category.key}
                        category={category}
                        score={studentScore && studentScore[category.key]}
                        onClick={() => onCategoryClick(category)}
                    />
                ))}
            </SequentialAnimation>
        </div>
    );
};

export default ScoreList;
