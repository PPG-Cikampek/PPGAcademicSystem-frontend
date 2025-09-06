export {
    useAttendancePerformance,
    useAttendancePerformanceMutation,
} from "./useAttendancePerformances";

export { useDashboard } from "./useDashboard";

export {
    useBranchYears,
    useActivateBranchYearMutation,
    useDeactivateBranchYearMutation,
    useDeleteBranchYearMutation,
    useDeleteTeachingGroupMutation,
} from "./useBranchYears";

export {
    useAttendanceData,
    useClassData,
    useCreateAttendanceMutation,
    useAttendancesByClass,
    useDeleteAttendanceMutation,
    useAttendance,
    useUpdateAttendanceMutation,
} from "./useAttendance";

export { useMaterialProgress } from "./useMaterialProgress";

export { useJournal } from "./useJournal";

export {
    useTeachingGroup,
    useRemoveSubBranchMutation,
    useRemoveClassMutation,
    useLockTeachingGroupMutation,
    useLockClassMutation,
} from "./useTeachingGroups";

export { useClass, useUpdateClassMutation, useRegisterTeacherToClassMutation, useRemoveTeacherFromClassMutation, useRemoveStudentFromClassMutation, useRegisterStudentToClassMutation } from "./useClasses";

export { useTeachers, useTeacher, useUpdateTeacherMutation } from "./useTeachers";

export { useStudents, useStudent, useUpdateStudentMutation } from "./useStudents";

export {
    useBranches,
    useDeleteBranchMutation,
    useDeleteSubBranchMutation,
} from "./useLevels";