import { useState } from 'react';
import {validateFile} from "../utils/fileValidation.js";

export default function DragDropZone({ onFileSelect, children, acceptTypes, maxSize }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    const { valid } = validateFile(file);

    if (valid) {
      onFileSelect(file);
    }

  };

  return (
    <div
      className={`border-2 border-dashed rounded-3 p-5 text-center ${
        isDragging
          ? 'border-primary bg-light-primary'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ minHeight: '120px'}}
    >
      {children}
    </div>
  );
}
