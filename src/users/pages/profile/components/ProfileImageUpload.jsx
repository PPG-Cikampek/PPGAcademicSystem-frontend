import { useRef, useCallback } from "react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

import DynamicForm from "../../../../shared/Components/UIElements/DynamicForm";
import FileUpload from "../../../../shared/Components/FormElements/FileUpload";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";

const ProfileImageUpload = ({ 
    userData, 
    isLoading, 
    isSubmitting, 
    onImageSave,
    pickedFileRef
}) => {
    const fileInputRef = useRef();

    const handleImageCropped = useCallback((croppedImage) => {
        pickedFileRef.current = croppedImage;
    }, [pickedFileRef]);

    return (
        <DynamicForm
            className={"border-0 ring-0"}
            customDescription={
                <div className="relative">
                    <div className="">
                        <FileUpload
                            ref={fileInputRef}
                            accept=".jpg,.jpeg,.png"
                            buttonLabel={
                                <Icon
                                    icon="jam:upload"
                                    width="24"
                                    height="24"
                                />
                            }
                            buttonClassName={`${
                                isLoading && "hidden"
                            } border border-gray-600 bg-gray-50 size-9 rounded-full absolute offset bottom-7 right-7 md:bottom-9 md:right-9 translate-x-1/2 translate-y-1/2`}
                            imgClassName={`${
                                isLoading && "animate-pulse"
                            } mt-2 rounded-full size-48 md:size-64 shrink-0`}
                            defaultImageSrc={
                                userData?.image
                                    ? `${
                                          import.meta.env
                                              .VITE_BACKEND_URL
                                      }/${userData.image}`
                                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                            }
                            onImageCropped={handleImageCropped}
                        />
                    </div>
                </div>
            }
            onSubmit={onImageSave}
            disabled={isLoading}
            reset={false}
            footer={false}
            button={
                pickedFileRef.current && (
                    <div className="flex flex-col justify-stretch mt-4">
                        <button
                            type="submit"
                            className={`button-primary ${
                                isLoading || isSubmitting
                                    ? "opacity-50 hover:cursor-not-allowed"
                                    : ""
                            }`}
                            disabled={isLoading || isSubmitting}
                        >
                            {isLoading || isSubmitting ? (
                                <LoadingCircle>
                                    Processing...
                                </LoadingCircle>
                            ) : (
                                "Simpan Gambar"
                            )}
                        </button>
                    </div>
                )
            }
        />
    );
};

export default ProfileImageUpload;