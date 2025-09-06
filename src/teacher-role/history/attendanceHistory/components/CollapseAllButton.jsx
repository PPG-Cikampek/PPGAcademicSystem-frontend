import { motion } from "framer-motion";
import { X } from "lucide-react";

const CollapseAllButton = ({ onClick, isVisible }) => {
    if (!isVisible) return null;

    return (
        <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
            onClick={onClick}
        >
            <X size={16} />
            Collapse All
        </motion.button>
    );
};

export default CollapseAllButton;
