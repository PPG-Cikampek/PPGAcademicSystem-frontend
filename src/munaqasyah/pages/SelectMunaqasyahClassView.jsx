import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import { BookOpen } from "lucide-react";

const SelectMunaqasyahClassView = () => {
    const [classes, setClasses] = useState([]);

    const { isLoading, error, sendRequest, setError } = useHttp();

    useEffect(() => {
        const fetchClasses = async () => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/munaqasyahs/classes`;
            try {
                const responseData = await sendRequest(url);
                console.log(responseData);
                setClasses(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Pilih Kelas Bank Soal
                    </h1>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                    {isLoading
                        ? // Skeleton loaders for loading state
                          [...Array(6)].map((_, index) => (
                              <div
                                  key={index}
                                  className="card-interactive m-0 rounded-md gap-4 flex items-center justify-start border-0 p-4 md:p-6 lg:p-8 w-full h-full min-h-[120px] overflow-hidden"
                              >
                                  <SkeletonLoader
                                      variant="text"
                                      width="40px"
                                      height="40px"
                                      className="size-8 md:size-10"
                                  />
                                  <div className="flex flex-col">
                                      <SkeletonLoader
                                          variant="text"
                                          width="150px"
                                          height="24px"
                                          className="mb-2"
                                      />
                                      <SkeletonLoader
                                          variant="text"
                                          width="60px"
                                          height="16px"
                                      />
                                  </div>
                              </div>
                          ))
                        : classes.map((cls) => (
                              <Link
                                  key={cls.grade}
                                  to={`/munaqasyah/question-bank/${cls.grade}`}
                                  className="card-interactive m-0 rounded-md gap-4 flex items-center justify-start border-0 p-4 md:p-6 lg:p-8 w-full h-full min-h-[120px] overflow-hidden"
                              >
                                  <BookOpen className="size-8 md:size-10" />
                                  <div className="flex flex-col">
                                      <h1 className="text-xl font-bold truncate">
                                          {cls.label.toUpperCase()}
                                      </h1>
                                      <p className="truncate text-sm">
                                          {cls.questionCount} Soal
                                      </p>
                                  </div>
                              </Link>
                          ))}
                </div>
            </main>
        </div>
    );
};

export default SelectMunaqasyahClassView;
