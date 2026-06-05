import { Fragment } from "react";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";

function BiWarning() {
  return null;
}

export default function NotificationContainer({ notifications, onRemove }) {
  if (!notifications || notifications.length === 0) return null;

  const getAlertClass = (type) => {
    const classes = {
      error: 'alert-danger',
      success: 'alert-success',
      warning: 'alert-warning'
    };
    return classes[type] || 'alert-secondary';
  }


  const iconMap = {
    success: <BiCheckCircle className="text-success me-2" size={20} />,
    error: <BiXCircle className="text-danger me-2" size={20} />,
    warning: <BiWarning className="text-warning me-2" size={20} />,
  };

  return (
    <div
      className="position-fixed top-0 end-0 p-3 z-index-1050"
      style={{ zIndex: 1050}}
    >
      <div className={"d-flex flex-column gap-2"}>
        {notifications.map((notification) => (
          <Fragment key={notification.id}>
            <div
              className={`alert ${getAlertClass(notification.type)} d-flex justify-content-between align-items-center shadow-sm`}
              role="alert"
            >
              <div className="me-2">
                <strong>
                  {iconMap[notification.type] || null}
                  {notification.message}
                </strong>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => onRemove(notification.id)}
                aria-label="Закрыть"
              ></button>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
};
