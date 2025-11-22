import { Link } from "react-router-dom";
import { useQuestionBankByClass } from "../../shared/queries";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import { BookOpen } from "lucide-react";

const QuestionBankByClassView = () => {
    const { data: classes = [], isLoading, error } = useQuestionBankByClass({
        refetchOnMount: 'always',
        // refetchOnWindowFocus: true,
    });

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <main className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Pilih Kelas Bank Soal
                    </h1>
                </div>
                <div className="gap-6 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                    {isLoading
                        ? // Skeleton loaders for loading state
                          [...Array(6)].map((_, index) => (
                              <div
                                  key={index}
                                  className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive"
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
                                  className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive"
                              >
                                  <BookOpen className="size-8 md:size-10" />
                                  <div className="flex flex-col">
                                      <h1 className="font-bold text-xl truncate">
                                          {cls.label.toUpperCase()}
                                      </h1>
                                      <p className="text-sm truncate">
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

export default QuestionBankByClassView;
