import FormError from "./FormError.jsx";

export default function FormInput({
                                    label,
                                    name,
                                    value,
                                    onChange,
                                    type = 'text',
                                    required = false,
                                    error
                                  }) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="text-danger">*</span> }
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-control ${error ? 'is-invalid' : ''}`}
      />
      <FormError error={error} />
    </div>
  );
};
