import { useSelector } from "react-redux";
import AuthForm from '../components/ui/AuthForm';
import { useAuthForm } from "../hooks/useAuthForm.js";


const formFields = [
  {name: 'username', label: 'Логин', type: 'text', required: true},
  {name: 'first_name', label: 'Имя', type: 'text', required: true},
  {name: 'last_name', label: 'Фамилия', type: 'text', required: true},
  {name: 'email', label: 'Email', type: 'email', required: true},
  {name: 'password', label: 'Пароль', type: 'password', required: true},
  {name: 'password_confirm', label: 'Подтверждение пароля', type: 'password', required: true},
]

export default function RegisterPage() {

  const { formData, handleChange, handleSubmit } = useAuthForm(formFields, '/files')
  const isLoading = useSelector(state => state.auth.loading)
  const errors = useSelector(state => state.auth.errors);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">

          <AuthForm
            title="Регистрация аккаунта"
            submitText="Зарегистрироваться"
            fields={formFields}
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={(e) => handleSubmit(e, '/register/')}
            isLoading={isLoading}
            footerLink={{
              text: "Уже есть аккаунт?",
              to: "/login",
              linkText: "Войти"
            }}
          />
        </div>
      </div>
    </div>
  )
};