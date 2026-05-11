import FormInput from '../ui/FormInput.jsx';
import Button from '../ui/Button.jsx';

export const FormFields = [
  {name: 'username', label: 'Логин', type: 'text', required: true},
  {name: 'first_name', label: 'Имя', type: 'text', required: true},
  {name: 'last_name', label: 'Фамилия', type: 'text', required: true},
  {name: 'email', label: 'Email', type: 'email', required: true},
  {name: 'password', label: 'Пароль', type: 'password', required: true},
  {name: 'password_confirm', label: 'Подтверждение пароля', type: 'password', required: true},
]

export default function RegisterForm({ formData, errors, handleChange, handleSubmit, isLoading }) {
  return (
        <form onSubmit={handleSubmit} noValidate>
      {FormFields.map((field) => (
        <FormInput
          key={field.name}
          name={field.name}
          {...field}
          value={formData[field.name]}
          onChange={handleChange}
          error={errors[field.name]}
        />
      ))}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        extendClass="w-100 mt-3"
        disabled={isLoading}
      >
        {isLoading ? 'Загрузка...' :  'Зарегистрироваться'}
      </Button>
    </form>
  )
}