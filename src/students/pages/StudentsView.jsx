import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import WarningCard from "../../shared/Components/UIElements/WarningCard";
import ServerDataTable from "../../shared/Components/UIElements/ServerDataTable";

const StudentsView = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        isActive: "",
        isProfileComplete: "",
        isInternal: "",
        branch: "",
        group: "",
    });
    const [sort, setSort] = useState({ key: "name", direction: "asc" });

    const { data: studentsData, isLoading, isFetching } = useStudents(
        {
            role: auth.userRole,
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            page,
            limit: pageSize,
            search: search || undefined,
            filters: {
                isActive: filters.isActive || undefined,
                isProfileComplete: filters.isProfileComplete || undefined,
                isInternal: filters.isInternal || undefined,
                branch: filters.branch || undefined,
                group: filters.group || undefined,
            },
            sort: {
                key: sort.key,
                direction: sort.direction,
            },
        },
        { keepPreviousData: true }
    );

    const students = studentsData?.students || [];
    const total = studentsData?.total ?? students.length;
    const filterMeta = studentsData?.filterMeta || {};

    const columns = [
        {
            key: "image",
            label: "",
            sortable: false,
            render: (student) =>
                student.image ? (
                    <img
                        src={
                            student.thumbnail
                                ? student.thumbnail
                                : `${import.meta.env.VITE_BACKEND_URL}/${
                                      student.image
                                  }`
                        }
                        alt={student.name}
                        className="bg-white m-auto border border-gray-200 rounded-full size-10 shrink-0"
                    />
                ) : (
                    <StudentInitial
                        studentName={student.name}
                        clsName={`size-10 shrink-0 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`}
                    />
                ),
        },

        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (student) => (!student.isActive ? "Tidak Aktif" : "Aktif"),
            cellStyle: (student) =>
                `py-1 px-2 text-sm text-center w-min border rounded-md ${
                    !student.isActive
                        ? "text-red-500 bg-red-100"
                        : "text-green-500 bg-green-100"
                }`,
        },
        { key: "nis", label: "NIS", sortable: true },
        { key: "name", label: "Nama", sortable: true },
        {
            key: "isInternal",
            label: "Label",
            sortable: true,
            render: (student) =>
                student.isInternal ? "Internal" : "Simpatisan",
            cellStyle: (student) =>
                `py-1 px-2 text-sm text-center w-min border rounded-md ${
                    student.isInternal
                        ? "text-blue-500 bg-blue-100"
                        : "text-gray-500 bg-gray-100"
                }`,
        },
        ...(auth.userRole === "admin"
            ? [
                  {
                      key: "branch",
                      label: "Desa",
                      sortable: true,
                      render: (student) => student.userId?.subBranchId?.branchId?.name || "-",
                  },
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (student) => student.userId?.subBranchId?.name || "-",
                  },
              ]
            : []),
        ...(auth.userRole === "branchAdmin"
            ? [
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (student) => student.userId?.subBranchId?.name || "-",
                  },
              ]
            : []),
        {
            key: "isProfileComplete",
            label: "Profile",
            sortable: true,
            render: (student) =>
                student.isProfileComplete ? "Lengkap" : "Lengkapi",
            cellStyle: (student) =>
                `${
                    student.isProfileComplete
                        ? "text-green-500"
                        : "text-red-500 hover:underline cursor-pointer"
                }`,
        },
    ];

    const filterOptions = useMemo(() => {
        const options = [
            {
                key: "isActive",
                label: "Status",
                options: [
                    { label: "Aktif", value: "true" },
                    { label: "Tidak Aktif", value: "false" },
                ],
            },
            {
                key: "isProfileComplete",
                label: "Kelengkapan Profil",
                options: [
                    { label: "Lengkap", value: "true" },
                    { label: "Lengkapi", value: "false" },
                ],
            },
            {
                key: "isInternal",
                label: "Label",
                options: [
                    { label: "Internal", value: "true" },
                    { label: "Simpatisan", value: "false" },
                ],
            },
        ];

        const branches = filterMeta.branches?.length
            ? filterMeta.branches
            : [
                  ...new Map(
                      students
                          .map((s) => {
                              const id = s?.userId?.subBranchId?.branchId?._id;
                              const name = s?.userId?.subBranchId?.branchId?.name;
                              return id && name ? [id, name] : null;
                          })
                          .filter(Boolean)
                  ).entries(),
              ].map(([id, name]) => ({ id, name }));

        const groups = filterMeta.groups?.length
            ? filterMeta.groups
            : [
                  ...new Map(
                      students
                          .map((s) => {
                              const id = s?.userId?.subBranchId?._id;
                              const name = s?.userId?.subBranchId?.name;
                              return id && name ? [id, name] : null;
                          })
                          .filter(Boolean)
                  ).entries(),
              ].map(([id, name]) => ({ id, name }));

        if (auth.userRole === "admin" && branches.length > 0) {
            options.push({
                key: "branch",
                label: "Desa",
                options: branches.map((b) => ({ label: b.name, value: b.id })),
            });
        }
        if ((auth.userRole === "admin" || auth.userRole === "branchAdmin") && groups.length > 0) {
            options.push({
                key: "group",
                label: "Kelompok",
                options: groups.map((g) => ({ label: g.name, value: g.id })),
            });
        }

        return options;
    }, [auth.userRole, filterMeta, students]);

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar Peserta Didik
                    </h1>
                    <WarningCard
                        className="justify-start items-center"
                        warning="Penambahan peserta didik Baru dapat dilakukan melalui fitur Pendaftaran Akun"
                    />
                </div>
                {students && (
                    <ServerDataTable
                        data={students}
                        columns={columns}
                        total={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={(next) => setPage(next)}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                        search={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        filters={filters}
                        onFiltersChange={(nextFilters) => {
                            setFilters(nextFilters);
                            setPage(1);
                        }}
                        filterOptions={filterOptions}
                        sort={sort}
                        onSortChange={(nextSort) => {
                            setSort(nextSort);
                            setPage(1);
                        }}
                        isLoading={isLoading || isFetching}
                        emptyMessage="Tidak ada peserta didik."
                        onRowClick={(student) =>
                            navigate(`/dashboard/students/${student._id}`)
                        }
                        tableId="students-table"
                    />
                )}
            </div>
        </div>
    );
};

export default StudentsView;
