import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import DynamicForm from "../../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../../shared/Components/Modal/NewModal";
import useModal from "../../../shared/hooks/useNewModal";

const NewMaterialProgresslView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const [classData, setClassData] = useState(false);
    const [inputFields, setInputFields] = useState();

    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);
    const classIds = auth.userClassIds;
    const classIdsRef = useRef(classIds);

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    useEffect(() => {
        classIdsRef.current = classIds;
        const loadClasses = async () => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/classes/get-by-ids`;
            const body = JSON.stringify({ classIds: classIdsRef.current });
            console.log("fetching classes this teacher enrolled...");
            console.log(classIdsRef.current);

            try {
                const responseData = await sendRequest(url, "POST", body, {
                    "Content-Type": "application/json",
                });
                setClassData(responseData.classes);

                console.log("fetching classes complete...");
                console.log(responseData.classes);
            } catch (err) {}
        };
        console.log(classIds);
        if (classIds.length === 0) {
            setClassData({ classes: [] });
        } else {
            loadClasses();
        }
    }, [sendRequest, classIds]);

    useEffect(() => {
        if (classData) {
            setInputFields([
                {
                    name: "classId",
                    label: "Kelas",
                    type: "select",
                    required: true,
                    // options: classData
                    //     .map(({ cls }) => ({
                    //         label:
                    //             cls?.teachingGroupId?.branchYearId
                    //                 ?.academicYearId?.isActive === true
                    //                 ? cls.name
                    //                 : "",
                    //         value:
                    //             cls?.teachingGroupId?.branchYearId
                    //                 ?.academicYearId?.isActive === true
                    //                 ? cls._id
                    //                 : "",
                    //     }))
                    //     .filter((option) => option.label && option.value),
                    options: classData.map((cls) => ({
                        label:
                            cls?.teachingGroupId?.branchYearId?.academicYearId
                                ?.isActive === true
                                ? cls.name
                                : "",
                        value:
                            cls?.teachingGroupId?.branchYearId?.academicYearId
                                ?.isActive === true
                                ? cls._id
                                : "",
                    })),
                },
                {
                    name: "category",
                    label: "Kategori",
                    type: "select",
                    required: true,
                    options: [
                        {
                            label: "Membaca Al-Quran/Tilawati",
                            value: "Membaca Al-Quran/Tilawati",
                        },
                        { label: "Menulis Arab", value: "Menulis Arab" },
                        { label: "Tafsir Al-Quran", value: "Tafsir Al-Quran" },
                        { label: "Tafsirt Hadits", value: "Tafsirt Hadits" },
                        { label: "Praktek Ibadah", value: "Praktek Ibadah" },
                        {
                            label: "Akhlak dan Tata Krama",
                            value: "Akhlak dan Tata Krama",
                        },
                        { label: "Hafalan", value: "Hafalan" },
                        {
                            label: "Keilmuan dan Kefahaman Agama",
                            value: "Keilmuan dan Kefahaman Agama",
                        },
                        { label: "Kemandirian", value: "Kemandirian" },
                    ],
                },
                // { name: 'title', label: 'Judul', type: 'text', required: true },
                {
                    name: "material",
                    label: "Materi",
                    type: "textarea",
                    textAreaRows: 2,
                    required: true,
                },
            ]);
        }
    }, [classData]);

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/materialProgress/`;

        const body = JSON.stringify({
            userId: auth.userId,
            classId: data.classId,
            category: data.category,
            material: data.material,
        });

        let responseData;
        try {
            responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });
        } catch (err) {
            setError(err.message);
            openModal(
                err.message,
                "error",
                null,
                "Gagal!",
                false
            );
            return;
        }
        openModal(
            responseData.message,
            "success",
            () => {
                navigate(-1);
                return false; // Prevent immediate redirect
            },
            "Berhasil!",
            false
        );
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

            {error && (
                <div className="mx-2">
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <div className="pb-24 transition-opacity duration-300 opacity-100">
                <DynamicForm
                    // title='Pencapaian Materi'
                    // subtitle={'Sistem Akademik Digital'}
                    subtitle={"Pencapaian Materi"}
                    fields={inputFields || []}
                    onSubmit={handleFormSubmit}
                    disabled={isLoading}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Simpan"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewMaterialProgresslView;
