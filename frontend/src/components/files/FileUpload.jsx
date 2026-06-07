import { useState } from "react";
import Button from "../ui/Button";
import DragDropZone from "./DragDropZone";
import FileSelector from "./FileSelector";
import FileInfo from "./FileInfo";
import CommentInput from "./CommentInput";
import { validateFile } from "../../utils/fileValidation.js";

export default function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    const { isValid, error } = validateFile(file);

    if (!isValid) {
      setError(error);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
  }

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUploadSuccess(selectedFile, comment);
      setSelectedFile(null);
      setComment('');
    } catch (error) {
      setError('Ошибка загрузки файла');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title mb-4">Загрузить файл</h5>

        <DragDropZone onFileSelect={handleFileSelect}>
          {selectedFile ? (
            <FileInfo file={selectedFile} onRemove={handleRemoveFile} />
          ) : (
            <>
              <p className="mb-0">
                Перетащите файл сюда или <FileSelector onFileSelect={handleFileSelect} accept=".jpg,.jpeg,.png,.gif,.pdf,.txt" />
              </p>
              <small className="text-muted">
                Поддерживаемые форматы: JPG, PNG, GIF, PDF, TXT
              </small>
            </>
          )}
        </DragDropZone>

        {selectedFile && (
          <CommentInput
            value={comment}
            onChange={setComment}
            placeholder="Добавьте описание файла..."
            />
        )}

        {selectedFile && (
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              Загрузить
            </Button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}