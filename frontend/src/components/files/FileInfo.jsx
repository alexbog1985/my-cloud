import Button from '../ui/Button.jsx';

export default function FileInfo( { file, onRemove } ) {

  if (!file) {
    return <div>Нет выбранного файла</div>;
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div className="text-start">
        <div className="fw-medium">{file.name || file.original_name || 'Без имени'}</div>
        <div className="text-muted small">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </div>
      </div>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onRemove}
        aria-label="Удалить файл"
      >
        &times;
      </Button>
    </div>
  )
}