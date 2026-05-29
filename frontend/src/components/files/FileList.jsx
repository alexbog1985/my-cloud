import { useSelector } from "react-redux";
import FileItem from "./FileItem";
import LoadingIndicator from "../ui/LoadingIndicator.jsx";

const columns = [
  { key: 'name', label: 'Имя файла', sortable: true },
  { key: 'comment', label: 'Комментарий' },
  { key: 'size', label: 'Размер', sortable: true },
  { key: 'uploaded_at', label: 'Загружен', sortable: true },
  { key: 'actions', label: 'Действия' }
];

export default function FileList() {
  const { files, loading } = useSelector((state) => state.files);

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

  return (
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
            <FileItem key={file.id} file={file} />
          ))}
        </tbody>
      </table>
    </div>
  )
}