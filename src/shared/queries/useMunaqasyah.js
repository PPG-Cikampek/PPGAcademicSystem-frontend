import { useQuery } from "@tanstack/react-query";
import api from "./api";

export const useBranchSubBranchSummary = (
	branchId,
	branchYearId,
	options = {}
) => {
	return useQuery({
		queryKey: [
			"branchSubBranchSummary",
			{ branchId, branchYearId },
		],
		queryFn: async () => {
			const response = await api.get(
				`/scores/branch/${branchId}/sub-branches/summary`,
				{
					params: { branchYearId },
				}
			);
			return response.data;
		},
		enabled: Boolean(branchId && branchYearId),
		staleTime: 2000,
		refetchOnWindowFocus: false,
		...options,
	});
};

export default useBranchSubBranchSummary;


