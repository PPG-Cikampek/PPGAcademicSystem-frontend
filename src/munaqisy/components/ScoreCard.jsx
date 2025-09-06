import { useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";

const ScoreCard = ({ category, score, onClick }) => {
    const auth = useContext(AuthContext);

    // Use SkeletonLoader for undefined score
    if (!score) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card-basic mt-3 justify-between items-center transition-all bg-gray-100 opacity-60"
            >
                <div className="flex flex-col ">
                    <h3 className="text-gray-700">{category.label}</h3>
                    <SkeletonLoader width={100} height={16} className="mb-1" />
                </div>
                <SkeletonLoader width={60} height={32} />
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`card-basic mt-3 justify-between items-center transition-all ${
                score?.examinerUserId ? "ring-green-100 bg-green-100" : ""
            } `}
        >
            <div className="flex flex-col ">
                <h3 className="text-gray-700">{category.label}</h3>
                {score.examinerUserId && (
                    <div className="font-medium text-gray-500">
                        Telah dinilai oleh:{" "}
                        {score.examinerUserId?.name &&
                            score.examinerUserId?.name
                                .split(" ")
                                .slice(0, 2)
                                .join(" ")}
                    </div>
                )}
            </div>
            {score.examinerUserId ? (
                <div className="flex gap-2 items-center">
                    {score.examinerUserId.id === auth.userId && (
                        <button
                            className="btn-round-gray bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            Edit
                        </button>
                    )}
                    <div className="font-semibold text-gray-800 w-6 text-center">
                        {score.score}
                    </div>
                </div>
            ) : (
                <button
                    className="btn-round-gray"
                    onClick={(e) => {
                        e.stopPropagation();
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
