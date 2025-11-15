import DataTable from "../../shared/Components/UIElements/DataTable";

const categoryLabels = {
    general: "Umum",
    technical: "Teknis",
    usage: "Penggunaan",
};

const categoryClasses = {
    general: "bg-blue-100 text-blue-700",
    technical: "bg-yellow-100 text-yellow-700",
    usage: "bg-green-100 text-green-700",
};

const FAQTable = ({ data = [], isLoading = false, onEdit, onDelete }) => {
    const columns = [
        {
            key: "question",
            label: "Pertanyaan",
            sortable: true,
            render: (faq) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">
                        {faq.question}
                    </span>
                    <span className="text-gray-500 text-sm">
                        {faq.answer}
                    </span>
                </div>
            ),
        },
        {
            key: "category",
            label: "Kategori",
            sortable: true,
            render: (faq) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        categoryClasses[faq.category] || "bg-gray-100 text-gray-600"
                    }`}
                >
                    {categoryLabels[faq.category] || "Tidak dikategorikan"}
                </span>
            ),
        },
        {
            key: "order",
            label: "Urutan",
            sortable: true,
            cellAlign: "center",
            render: (faq) => (
                <span className="font-medium text-gray-700">
                    {faq.order ?? "-"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            cellAlign: "right",
            render: (faq) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="px-3 py-1 btn-primary-outline text-xs"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(faq);
                        }}
                    >
                        Ubah
                    </button>
                    <button
                        type="button"
                        className="px-3 py-1 btn-danger-outline text-xs"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.(faq);
                        }}
                    >
                        Hapus
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            searchableColumns={["question", "answer"]}
            filterOptions={[
                {
                    key: "category",
                    label: "Kategori",
                    options: [
                        { value: "general", label: "Umum" },
                        { value: "technical", label: "Teknis" },
                        { value: "usage", label: "Penggunaan" },
                    ],
                },
            ]}
            config={{
                showFilter: true,
                showSearch: true,
                showTopEntries: true,
                showBottomEntries: true,
                showPagination: true,
                clickableRows: false,
                entriesOptions: [5, 10, 25, 50],
            }}
            initialSort={{ key: "order", direction: "ascending" }}
        />
    );
};

export default FAQTable;
