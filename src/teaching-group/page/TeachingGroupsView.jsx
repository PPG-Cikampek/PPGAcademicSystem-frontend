import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useTeachingGroup } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import Modal from "../../shared/Components/Modal";
import ModalFooter from "../../shared/Components/ModalFooter";
import useModal from "../../shared/hooks/useModal";
import { useTeachingGroupHandlers } from "../hooks/useTeachingGroupHandlers";
import TeachingGroupHeader from "../components/TeachingGroupHeader";
import SubBranchesSection from "../components/SubBranchesSection";
import ClassesSection from "../components/ClassesSection";

const TeachingGroupsView = () => {
    const [error, setError] = useState(null);

    const auth = useContext(AuthContext);
    const teachingGroupId = useParams().teachingGroupId;
    const navigate = useNavigate();

    // React Query hooks
    const {
        data: teachingGroupData,
        isLoading,
        error: queryError,
    } = useTeachingGroup(teachingGroupId);

    // Modal state using the new hook
    const {
        isOpen: modalIsOpen,
        modal,
        openModal,
        closeModal,
        setModal,
    } = useModal({ title: "", message: "", onConfirm: null });

    // Handlers
    const {
        removeSubBranchHandler,
        lockClassHandler,
        removeClassHandler,
        lockTeachingGroupHandler,
        editClassHandler,
        mutations,
    } = useTeachingGroupHandlers(
        teachingGroupId,
        teachingGroupData,
        setModal,
        openModal,
        closeModal,
        setError
    );

    // Handle errors from React Query and manual errors
    const displayError = error || queryError?.message;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                {displayError && (
                    <ErrorCard
                        error={displayError}
                        onClear={() => setError(null)}
                    />
                )}

                {(!teachingGroupData || isLoading) && (
                    <div className="flex flex-col gap-6 mt-16 px-4">
                        <SkeletonLoader
                            variant="text"
                            width="200px"
                            height="32px"
                            className="mb-2"
                        />
                        <SkeletonLoader
                            variant="rectangular"
                            height="100px"
                            className="rounded-lg"
                            count={3}
                        />
                    </div>
                )}

                {teachingGroupData && !isLoading && (
                    <>
                        <TeachingGroupHeader
                            teachingGroupData={teachingGroupData}
                            auth={auth}
                            lockTeachingGroupHandler={lockTeachingGroupHandler}
                            teachingGroupId={teachingGroupId}
                        />

                        <SubBranchesSection
                            teachingGroupData={teachingGroupData}
                            auth={auth}
                            teachingGroupId={teachingGroupId}
                            navigate={navigate}
                            removeSubBranchHandler={removeSubBranchHandler}
                        />

                        <ClassesSection
                            teachingGroupData={teachingGroupData}
                            auth={auth}
                            teachingGroupId={teachingGroupId}
                            lockClassHandler={lockClassHandler}
                            editClassHandler={editClassHandler}
                            removeClassHandler={removeClassHandler}
                        />
                        <Modal
                            isOpen={modalIsOpen}
                            title={modal.title}
                            message={modal.message}
                            onClose={closeModal}
                            onConfirm={modal.onConfirm}
                            footer={
                                <ModalFooter
                                    isLoading={
                                        mutations.removeSubBranchMutation
                                            .isPending ||
                                        mutations.removeClassMutation
                                            .isPending ||
                                        mutations.lockTeachingGroupMutation
                                            .isPending ||
                                        mutations.lockClassMutation.isPending
                                    }
                                    onClose={closeModal}
                                    onConfirm={modal.onConfirm}
                                    showConfirm={!!modal.onConfirm}
                                />
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default TeachingGroupsView;
