export default function LoadingIndicator({ size = "md", text = "Загрузка..."}) {
  const sizeClass = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  return (
    <div className="d-flex align-items-center">
      <div className={`spinner-border text-primary ${sizeClass[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <span className="text-primary">{text}</span>}
    </div>
  )
}
