import React, { useRef, useState, useEffect, forwardRef } from 'react';

const FileUpload = forwardRef((props, ref) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const filePickerRef = ref || useRef();

  useEffect(() => {
    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickHandler = event => {
    let pickedFile;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      props.onPick(pickedFile); // Notify parent component
    } else {
      setFile(null);
      props.onPick(null); // Notify parent component
    }
  };

  const pickFileHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div>
      <input
        id={props.id}
        ref={filePickerRef}
        type="file"
        accept={props.accept}
        style={{ display: 'none' }}
        onChange={pickHandler}
      />
      <div>
        <img src={previewUrl || props.defaultImageSrc} alt="preview" className={`${props.imgClassName}`} />
        <button className={`${props.buttonClassName}`} onClick={pickFileHandler}>
          {props.buttonLabel}
        </button>
      </div>
    </div>
  );
});

export default FileUpload;