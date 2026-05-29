import { useRef } from "react";
import Button from "../ui/Button";

export default function FileSelector({ onFileSelect, accept = "" }) {
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="d-none"
        onChange={handleFileInputChange}
        accept={accept}
      />
      <Button
        variant="link"
        onClick={handleBrowseClick}
        extendClass="p-0"
      >
        выберите файл
      </Button>
    </>
  );
}