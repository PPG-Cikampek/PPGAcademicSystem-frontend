import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useTeachingGroup } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
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
    const { modalState, openModal, closeModal, handleConfirm } = useModal();

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
        openModal,
        closeModal,
        setError
    );

    const modalIsLoading =
        mutations.removeSubBranchMutation.isPending ||
        mutations.removeClassMutation.isPending ||
        mutations.lockTeachingGroupMutation.isPending ||
        mutations.lockClassMutation.isPending;

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
                        <NewModal
                            modalState={modalState}
                            onClose={closeModal}
                            isLoading={modalIsLoading}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default TeachingGroupsView;
