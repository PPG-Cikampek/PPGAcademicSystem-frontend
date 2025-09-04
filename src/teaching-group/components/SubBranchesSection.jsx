import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import DataTable from "../../shared/Components/UIElements/DataTable.jsx";
import { subBranchColumns } from "../constants/teachingGroupColumns.jsx";

const SubBranchesSection = ({
    teachingGroupData,
    auth,
    teachingGroupId,
    navigate,
    removeSubBranchHandler,
}) => {
    const columns = subBranchColumns(
        teachingGroupId,
        teachingGroupData,
        removeSubBranchHandler
    );

    return (
        <div className="mb-8">
            <div className="mb-2 flex justify-between items-center">
                <div className="flex gap-1 items-center">
                    <h2 className="text-xl font-medium text-gray-800">
                        Kelompok Terdaftar
                    </h2>
                </div>
                {teachingGroupData?.branchYearId?.academicYearId.isActive &&
                    auth.userRole === "branchAdmin" &&
                    teachingGroupData?.isLocked === false && (
                        <button
                            className="button-primary pl-[11px] mt-0"
                            onClick={() => {
                                navigate(
                                    `/dashboard/teaching-groups/${teachingGroupId}/add-sub-branches`,
                                    {
                                        state: {
                                            teachingGroupData:
                                                teachingGroupData,
                                        },
                                    }
                                );
                            }}
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Tambah Kelompok
                        </button>
                    )}
            </div>
            <DataTable
                data={teachingGroupData?.subBranches || []}
                columns={columns}
                searchableColumns={["name"]}
                initialSort={{
                    key: "name",
                    direction: "ascending",
                }}
                initialEntriesPerPage={5}
                onRowClick={(row) => {
                    `/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${row._id}`;
                }}
                config={{
                    showSearch: false,
                    showTopEntries: false,
                    showBottomEntries: false,
                    showPagination: false,
                    clickableRows: false,
                    entriesOptions: [5, 10, 20, 30],
                }}
                tableId={`teaching-group-sub-branches-table-${teachingGroupId}`}
            />
        </div>
    );
};

export default SubBranchesSection;
