import { useCallback, useContext } from "react";
import { AuthContext } from "../Components/Context/auth-context";

/**
 * Fetches branch year + teacher data after IAM login provides the basic profile.
 * Called from AuthCallbackView after handleCallback returns a profile.
 */
const usePostLoginSetup = () => {
    const auth = useContext(AuthContext);

    const runSetup = useCallback(
        async (profile) => {
            // If there's no branchId, skip (admin without branch assignment)
            if (!profile.branchId && !profile.subBranchId) return profile;

            let activeBranchYear = null;
            let activeBranchYearId = null;
            let classIds = [];

            // Fetch branch year data
            if (profile.branchId) {
                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${profile.branchId}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const active = data.branchYears?.find(
                            (y) => y.academicYearId?.isActive
                        );
                        if (active) {
                            activeBranchYear = active.academicYearId.name;
                            activeBranchYearId = active._id;
                        }
                    }
                } catch {
                    // non-critical
                }
            }

            // Fetch teacher data for teacher/munaqisy roles
            if (profile.role === "teacher" || profile.role === "munaqisy") {
                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/teachers/user/${profile.userId}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        classIds =
                            data.teacher?.classIds?.map((item) =>
                                typeof item === "object" ? item._id : item
                            ) || [];
                    }
                } catch {
                    // non-critical
                }
            }

            const enriched = {
                ...profile,
                currentBranchYear: activeBranchYear,
                currentBranchYearId: activeBranchYearId,
                userClassIds: classIds,
            };

            // Update auth state with enriched data
            auth.setAttributes(
                profile.branchId,
                profile.subBranchId,
                classIds,
                activeBranchYear,
                activeBranchYearId
            );

            return enriched;
        },
        [auth]
    );

    return runSetup;
};

export default usePostLoginSetup;
