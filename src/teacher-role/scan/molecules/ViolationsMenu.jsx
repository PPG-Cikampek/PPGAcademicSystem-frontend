import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ViolationsButton from "../atoms/ViolationsButton";
import ViolationCheckbox from "../atoms/ViolationCheckbox";

const ViolationsMenu = ({
    student,
    isOpen,
    onToggle,
    onViolationChange,
    disabled,
}) => {
    const violations = student.violations || {};

    return (
        <div className="relative w-full">
            <ViolationsButton
                onClick={onToggle}
                isOpen={isOpen}
                hidden={
                    student.status === "Sakit" ||
                    student.status === "Izin" ||
                    student.status === "Tanpa Keterangan"
                }
            />
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
                                <ViolationCheckbox
                                    id={`${student.studentId.nis}attribute`}
                                    checked={!!violations.attribute}
                                    onChange={() =>
                                        onViolationChange(
                                            student.studentId.nis,
                                            "Attribute"
                                        )
                                    }
                                    label="Atribut"
                                    disabled={disabled}
                                />
                                <ViolationCheckbox
                                    id={`${student.studentId.nis}attitude`}
                                    checked={!!violations.attitude}
                                    onChange={() =>
                                        onViolationChange(
                                            student.studentId.nis,
                                            "Attitude"
                                        )
                                    }
                                    label="Sikap"
                                    disabled={disabled}
                                />
                                <ViolationCheckbox
                                    id={`${student.studentId.nis}tidiness`}
                                    checked={!!violations.tidiness}
                                    onChange={() =>
                                        onViolationChange(
                                            student.studentId.nis,
                                            "tidiness"
                                        )
                                    }
                                    label="Kerapihan"
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ViolationsMenu;
