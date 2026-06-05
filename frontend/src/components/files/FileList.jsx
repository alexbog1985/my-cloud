import { useState } from "react";
import { useSelector } from "react-redux";
import FileItem from "./FileItem";
import LoadingIndicator from "../ui/LoadingIndicator";
import useFiles from "../../hooks/useFiles";
import DeleteFileModal from "./DeleteFileModal";
import LinkModal from "./LinkModal";
import useRenameFile from "../../hooks/useRenameFile";
import RenameModal from "./RenameModal";
import { useNotifications } from "../../hooks/useNotifications";

const columns = [
  {key: 'name', label: 'Имя файла', sortable: true},
  {key: 'comment', label: 'Комментарий'},
  {key: 'size', label: 'Размер', sortable: true},
  {key: 'uploaded_at', label: 'Загружен', sortable: true},
  {key: 'last_download_at', label: 'Скачан', sortable: true},
  {key: 'actions', label: 'Действия'}
];

export default function FileList() {
  const { files, loading } = useSelector((state) => state.files);
  const { deleteFile, copySpecialLink } = useFiles();
  const { renameFile } = useRenameFile();
  const { error } = useNotifications();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [fileForLink, setFileForLink] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);

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
    } catch (err) {
      error(err.response?.data?.detail || 'Ошибка удаления файла');
    }
  }

  const handleCopyLink = async (fileId) => {
    try {
      const link = await copySpecialLink(fileId);
      setFileForLink(link);
      setShowLinkModal(true);
    } catch (err) {
      error(err.response?.data?.detail || 'Ошибка копирования ссылки');
    }
  };

  const handleRenameClick = (file) => {
    setFileToRename(file);
    setShowRenameModal(true);
  }

  const handleRename = async (fileId, data) => {
    try {
      await renameFile(fileId, data);
      setShowRenameModal(false);
      setFileToRename(null);
    } catch (err) {
      error(err.response?.data?.detail || 'Ошибка переименования');
    }
  }

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
              onRename={handleRenameClick}
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

      <RenameModal
        show={showRenameModal}
        file={fileToRename}
        onRename={handleRename}
        onClose={() => setShowRenameModal(false)}
      />
    </>
  );
}