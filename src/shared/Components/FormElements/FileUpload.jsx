import { useRef, useState, useEffect, forwardRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../Utilities/getCroppedImg";
import CropperModal from "../UIElements/CropperModal";

const FileUpload = forwardRef((props, ref) => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [croppedImage, setCroppedImage] = useState(null);
    const filePickerRef = ref || useRef();

    useEffect(() => {
        if (!file) {
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
            setShowCropper(true);
        };
        fileReader.readAsDataURL(file);
    }, [file]);

    const pickHandler = (event) => {
        let pickedFile;
        if (event.target.files && event.target.files.length === 1) {
            pickedFile = event.target.files[0];
            setFile(pickedFile);
        } else {
            setFile(null);
        }
    };

    const pickFileHandler = () => {
        filePickerRef.current.click();
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const cropImageHandler = async () => {
        try {
            const croppedImage = await getCroppedImg(
                previewUrl,
                croppedAreaPixels
            );
            setCroppedImage(croppedImage);
            setPreviewUrl(croppedImage);
            setShowCropper(false);

            // Convert base64 to Blob
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            const file = new File([blob], "croppedImage.png", {
                type: "image/png",
            });

            if (props.onImageCropped) {
                props.onImageCropped(file);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <input
                id={props.id}
                ref={filePickerRef}
                type="file"
                accept={props.accept}
                style={{ display: "none" }}
                onChange={pickHandler}
            />
            <div>
                {showCropper ? (
                    <CropperModal
                        isOpen={showCropper}
                        onClose={() => setShowCropper(false)}
                    >
                        <div className="size-64 md:size-96 relative mb-8">
                            <Cropper
                                image={previewUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                            <button
                                onClick={cropImageHandler}
                                className="button-primary absolute z-99 left-1/2 -translate-x-1/2 -bottom-12"
                            >
                                Pilih
                            </button>
                        </div>
                    </CropperModal>
                ) : (
                    <div>
                        <img
                            src={previewUrl || props.defaultImageSrc}
                            alt="preview"
                            className={`${props.imgClassName}`}
                        />
                        <button
                            className={`${props.buttonClassName}`}
                            onClick={pickFileHandler}
                        >
                            {props.buttonLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default FileUpload;
