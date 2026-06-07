export default function CommentInput({ value, onChange, placeholder = "Добавьте описание файла..."}) {

  const handleChange = (e) => {
     onChange(e.target.value);
  };

  return (
    <div className="mb-3">
      <label htmlFor="comment" className="form-label">
        Комментарий
      </label>
      <textarea
        id="comment"
        className="form-control"
        rows="2"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}