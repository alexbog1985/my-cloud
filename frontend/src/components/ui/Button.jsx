import { Link } from 'react-router-dom';

export default function Button({ to, variant = 'primary', children, size = 'lg', ...props}) {
  const baseClass = `btn btn-${variant} btn-${size} px-4`;
  return (
    <Link to={to} className={baseClass} {...props}>
      {children}
    </Link>
  )
}