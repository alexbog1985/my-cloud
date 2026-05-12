import {Link} from "react-router-dom";

export default function AuthFormLink({ askText, to, linkText}) {
  return (
    <div className="text-center mt-3">
      <small className="text-muted">
        {askText}
        <Link to={to} className="text-primary text-decoration-none">{' '}{linkText}</Link>
      </small>
    </div>
  )
}