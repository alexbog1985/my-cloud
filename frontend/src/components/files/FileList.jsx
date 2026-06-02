import {useState} from "react";
import {useSelector} from "react-redux";
import FileItem from "./FileItem";
import LoadingIndicator from "../ui/LoadingIndicator.jsx";
import useFiles from "../../hooks/useFiles.js";
import DeleteFileModal from "./DeleteFileModal.jsx";
import LinkModal from "./LinkModal.jsx";

const columns = [
  {key: 'name', label: 'Имя файла', sortable: true},
  {key: 'comment', label: 'Комментарий'},
  {key: 'size', label: 'Размер', sortable: true},
  {key: 'uploaded_at', label: 'Загружен', sortable: true},
  {key: 'actions', label: 'Действия'}
];

export default function FileList() {
  const { files, loading } = useSelector((state) => state.files);
  const { deleteFile, copySpecialLink } = useFiles();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [fileForLink, setFileForLink] = useState(null);

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingIndicator
          size="lg"
          text="Загрузка файлов..."
        />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>У вас пока нет загруженных файлов</p>
      </div>
    )
  }

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFile(fileToDelete.id);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
    }
  }

  const handleCopyLink = async (fileId) => {
    try {
      const link = await copySpecialLink(fileId);
      setFileForLink(link);
      setShowLinkModal(true);
    } catch (error) {
      console.log('Ошибка копирования ссылки:', error);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-light">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
                {column.sortable && (
                  <span className="ms-1 text-muted">
                    <small>&uarr;&darr;</small>
                  </span>
                )}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={handleDeleteClick}
              onCopyLink={handleCopyLink}
            />
          ))}
          </tbody>
        </table>
      </div>

      <DeleteFileModal
        show={showDeleteConfirm}
        file={fileToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <LinkModal
        show={showLinkModal}
        link={fileForLink}
        onClose={() => setShowLinkModal(false)}
      />
    </>
  );
}