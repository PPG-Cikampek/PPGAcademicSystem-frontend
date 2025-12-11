import { useContext, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import WarningCard from "../../shared/Components/UIElements/WarningCard";
import ServerDataTable from "../../shared/Components/UIElements/ServerDataTable";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";
import { bulkGenerateIdCards, downloadBlob } from "../utilities/bulkIdCardGenerator";
import { IdCard } from "lucide-react";

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

    // Selection state for bulk operations - store both IDs (for UI) and full data (for download)
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const selectedStudentsDataRef = useRef(new Map()); // Map of studentId -> studentData

    // Modal state for progress feedback
    const { modalState, openModal, closeModal } = useNewModal();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const abortControllerRef = useRef(null);

    // Check if user can bulk download (admin or subBranchAdmin only)
    const canBulkDownload = auth.userRole === "admin" || auth.userRole === "subBranchAdmin";

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

    // Handle selection change - store student data for cross-page access
    const handleSelectionChange = useCallback((newSelectedIds) => {
        // Find newly selected students from current page and add to map
        const currentStudentsMap = new Map(students.map(s => [s._id, s]));
        
        // Add newly selected students to the ref
        newSelectedIds.forEach(id => {
            if (currentStudentsMap.has(id) && !selectedStudentsDataRef.current.has(id)) {
                selectedStudentsDataRef.current.set(id, currentStudentsMap.get(id));
            }
        });
        
        // Remove deselected students from the ref
        const newSelectedSet = new Set(newSelectedIds);
        for (const id of selectedStudentsDataRef.current.keys()) {
            if (!newSelectedSet.has(id)) {
                selectedStudentsDataRef.current.delete(id);
            }
        }
        
        setSelectedStudentIds(newSelectedIds);
    }, [students]);

    // Handle quality selection and start download
    const startBulkDownload = useCallback(async (useHighQuality) => {
        // Get the selected students data from our stored map (supports cross-page selection)
        const selectedStudents = selectedStudentIds
            .map(id => selectedStudentsDataRef.current.get(id))
            .filter(Boolean);

        if (selectedStudents.length === 0) {
            openModal(
                "Data peserta didik tidak ditemukan. Silakan pilih kembali.",
                "warning",
                null,
                "Data tidak ditemukan"
            );
            return;
        }

        // Open progress modal
        const qualityText = useHighQuality ? "Kualitas Tinggi" : "Kualitas Rendah";
        openModal(
            `Memproses ${selectedStudents.length} ID Card (${qualityText})...`,
            "info",
            null,
            "Mengunduh ID Card"
        );
        setIsGenerating(true);
        setProgress(0);

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        try {
            const result = await bulkGenerateIdCards(
                selectedStudents,
                (progressValue) => setProgress(progressValue),
                abortControllerRef.current.signal,
                useHighQuality
            );

            if (result.success && result.zipBlob) {
                // Download the zip file
                const date = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
                downloadBlob(result.zipBlob, `IDCards_${date}.zip`);

                // Show success message
                closeModal();
                setTimeout(() => {
                    openModal(
                        `Berhasil mengunduh ${result.completed} ID Card${
                            result.failed > 0
                                ? `\n${result.failed} ID Card gagal diproses.`
                                : ""
                        }`,
                        "success",
                        null,
                        "Berhasil!"
                    );
                    // Clear selection after successful download
                    setSelectedStudentIds([]);
                    selectedStudentsDataRef.current.clear();
                }, 100);
            } else {
                closeModal();
                setTimeout(() => {
                    openModal(
                        result.error || "Terjadi kesalahan saat memproses ID Card.",
                        "error",
                        null,
                        "Gagal"
                    );
                }, 100);
            }
        } catch (error) {
            console.error("Bulk download error:", error);
            closeModal();
            setTimeout(() => {
                openModal(
                    "Terjadi kesalahan saat mengunduh ID Card.",
                    "error",
                    null,
                    "Gagal"
                );
            }, 100);
        } finally {
            setIsGenerating(false);
            setProgress(0);
            abortControllerRef.current = null;
        }
    }, [selectedStudentIds, openModal, closeModal]);

    // Handle bulk download button click - show quality selection modal
    const handleBulkDownload = useCallback(() => {
        if (selectedStudentIds.length === 0) {
            openModal(
                "Silakan pilih peserta didik terlebih dahulu dengan mencentang checkbox pada tabel.",
                "warning",
                null,
                "Tidak ada yang dipilih"
            );
            return;
        }

        // Show quality selection modal with custom content
        openModal(
            `Pilih kualitas gambar untuk ${selectedStudentIds.length} ID Card yang akan diunduh:`,
            "confirmation",
            null,
            "Pilih Kualitas ID Card",
            false,
            "md"
        );
    }, [selectedStudentIds, openModal]);

    // Handle modal close with cancellation
    const handleModalClose = useCallback(() => {
        if (isGenerating && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        closeModal();
    }, [isGenerating, closeModal]);

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
                        selectable={canBulkDownload}
                        selectedRows={selectedStudentIds}
                        onSelectionChange={handleSelectionChange}
                        topRightSlot={
                            canBulkDownload && (
                                <button
                                    onClick={handleBulkDownload}
                                    disabled={selectedStudentIds.length === 0 || isGenerating}
                                    className={`flex items-center gap-2 m-0 btn-mobile-primary ${
                                        selectedStudentIds.length === 0 || isGenerating
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    title={
                                        selectedStudentIds.length === 0
                                            ? "Pilih peserta didik terlebih dahulu"
                                            : `Download ${selectedStudentIds.length} ID Card`
                                    }
                                >
                                    <IdCard size={16} />
                                    <span className="hidden md:inline">
                                        Download ID Card
                                        {selectedStudentIds.length > 0 &&
                                            ` (${selectedStudentIds.length})`}
                                    </span>
                                    <span className="md:hidden">
                                        {selectedStudentIds.length > 0
                                            ? selectedStudentIds.length
                                            : "ID"}
                                    </span>
                                </button>
                            )
                        }
                    />
                )}
            </div>
            <NewModal
                modalState={modalState}
                onClose={handleModalClose}
                isLoading={isGenerating}
                loadingVariant="bar"
                progress={progress}
            >
                {modalState.type === "confirmation" && modalState.title === "Pilih Kualitas ID Card" && (
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={() => {
                                closeModal();
                                setTimeout(() => startBulkDownload(true), 100);
                            }}
                            className="hover:bg-blue-50 px-4 py-3 rounded-md btn-primary-outline w-full transition-colors"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-base">Kualitas Tinggi (High Quality)</span>
                                <span className="text-gray-600 text-sm">
                                    Menggunakan gambar asli. Ukuran file lebih besar, proses lebih lama.
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                closeModal();
                                setTimeout(() => startBulkDownload(false), 100);
                            }}
                            className="hover:bg-blue-50 px-4 py-3 rounded-md btn-primary-outline w-full transition-colors"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-base">Kualitas Rendah (Low Quality)</span>
                                <span className="text-gray-600 text-sm">
                                    Menggunakan thumbnail. Ukuran file lebih kecil, proses lebih cepat.
                                </span>
                            </div>
                        </button>
                    </div>
                )}
            </NewModal>
        </div>
    );
};

export default StudentsView;
