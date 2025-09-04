import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import {
    useClass,
    useLockClassMutation,
    useRemoveStudentFromClassMutation,
    useRemoveTeacherFromClassMutation,
} from "../../shared/queries";
import ClassHeader from "../components/ClassHeader";
import ClassSummary from "../components/ClassSummary";
import TeachersTable from "../components/TeachersTable";
import StudentsTable from "../components/StudentsTable";
import useClassActions from "../hooks/useClassActions";

const ClassDetailView = () => {
    const [classData, setClassData] = useState();
    const { modalState, openModal, closeModal } = useNewModal();

    const classId = useParams().classId;
    const auth = useContext(AuthContext);

    const { data: fetchedClass, isLoading, error, refetch } = useClass(classId, { refetchOnMount: true });

    useEffect(() => {
        if (fetchedClass) {
            // just update local state with the fetched class
            setClassData({ class: fetchedClass });
        }
    }, [fetchedClass]);

    const lockMutation = useLockClassMutation();
    const removeTeacherMutation = useRemoveTeacherFromClassMutation();
    const removeStudentMutation = useRemoveStudentFromClassMutation();

    const { lockClassHandler, unlockClassHandler, removeHandler, modalLoading } = useClassActions(
        lockMutation,
        removeTeacherMutation,
        removeStudentMutation,
        openModal,
        classData
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={modalLoading}
                />

                {(!classData || isLoading) && (
                    <div className="flex flex-col gap-6 mt-16 px-4">
                        <SkeletonLoader
                            variant="text"
                            width="200px"
                            height="32px"
                            className="mb-4"
                        />
                        <SkeletonLoader
                            variant="rectangular"
                            height="100px"
                            className="rounded-lg"
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={() => refetch()} />}

                {classData && !isLoading && (
                    <>
                        <ClassHeader
                            classData={classData}
                            auth={auth}
                            lockClassHandler={lockClassHandler}
                            unlockClassHandler={unlockClassHandler}
                        />

                        <ClassSummary classData={classData} />

                        <TeachersTable
                            teachers={classData.class.teachers}
                            auth={auth}
                            classData={classData}
                            removeHandler={(role, name, id) => removeHandler(role, name, id, classId)}
                            classId={classId}
                        />

                        <StudentsTable
                            students={classData.class.students}
                            auth={auth}
                            classData={classData}
                            removeHandler={(role, name, id) => removeHandler(role, name, id, classId)}
                            classId={classId}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassDetailView;
