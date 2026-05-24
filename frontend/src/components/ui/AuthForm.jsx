import FormInput from '../ui/FormInput.jsx';
import Button from '../ui/Button.jsx';
import FormError from "./FormError.jsx";

export default function AuthForm({
                                       title,
                                       submitText,
                                       fields,
                                       formData,
                                       errors,
                                       onChange,
                                       onSubmit,
                                       isLoading,
                                       children,
                                     }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <h3 className="text-center mb-4">{title}</h3>

      {errors.general && (
        <div className="alert alert-danger alert-sm mb-3">
          {errors.general}
        </div>
      )}

      {fields.map((field) => (
        <FormInput
          key={field.name}
          name={field.name}
          {...field}
          value={formData[field.name]}
          onChange={onChange}
          error={errors[field.name]}
        />
      ))}

      <FormError error={errors.detail} />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        extendClass="w-100 mt-3"
        disabled={isLoading}
      >
        {isLoading ? 'Загрузка...' : submitText}
      </Button>

      {children && <div className="mt-3">{children}</div>}
    </form>
  )
}