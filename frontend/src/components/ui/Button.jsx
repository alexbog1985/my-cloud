import { Link } from 'react-router-dom';

export default function Button({ type = 'button',
                                 to,
                                 variant = 'primary',
                                 children, size = 'lg',
                                 extendClass = '',
                                 ...props
}) {
  const baseClass = `btn btn-${variant} btn-${size} px-4`;
  if (to) {
    return (
      <Link to={to} className={`${baseClass} ${extendClass}`} {...props}>
        {children}
      </Link>
    );
  }

  // Иначе — обычный button
  return (
    <button type={type} className={`${baseClass} ${extendClass}`} {...props}>
      {children}
    </button>
  );
}