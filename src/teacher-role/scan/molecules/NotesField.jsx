import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotesButton from "../atoms/NotesButton";

const NotesField = ({ student, isOpen, onToggle, onChange, value }) => {
    return (
        <div className="relative w-full">
            <NotesButton onClick={onToggle} isOpen={isOpen} />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "backInOut" }}
                    >
                        <div className="mt-2 mr-4 rounded-md bg-white ring-opacity-5">
                            <div className="flex flex-col py-2">
                                <div className="px-2 inline-flex items-center">
                                    <input
                                        type="text"
                                        onChange={onChange}
                                        value={value}
                                        className="w-full p-2 mb-1 border rounded-xs shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(NotesField);
