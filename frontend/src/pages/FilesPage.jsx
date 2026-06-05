import { useSelector } from "react-redux";
import { useFiles } from "../hooks/useFiles";
import FileUpload from "../components/files/FileUpload";
import FileList from "../components/files/FileList";
import { useFetchOnMount } from "../hooks/useFetchOnMount";

export default function FilesPage() {
  const { fetchFiles, uploadFile } = useFiles();
  const { files, uploadProgress, isUploading } = useSelector((state) => state.files);

  useFetchOnMount(fetchFiles);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Мои файлы</h1>
        <div className="text-muted">
          {files.length} {files.length === 1 ? 'файл' : files.length < 5 ? 'файла' : 'файлов'}
        </div>
      </div>

      {/* Прогресс загрузки */}
      {isUploading && (
        <div className="progress mb-4" style={{ height: '4px' }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: `${uploadProgress}%` }}
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}

      {/* Форма загрузки файла */}
      <FileUpload onUploadSuccess={uploadFile} />

      {/* Список файлов */}
      <FileList />
    </div>
  )
}