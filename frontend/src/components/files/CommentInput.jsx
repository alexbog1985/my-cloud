import { useState, useEffect } from "react";

export default function CommentInput({ value, onChange, placeholder = "Добавьте описание файла..."}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
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
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}