import { useSelector } from "react-redux";
import AuthForm from "../components/ui/AuthForm.jsx";
import { useAuthForm } from "../hooks/useAuthForm.js";

const formFields = [
  { name: 'username', label: 'Логин', type: 'text' },
  { name: 'password', label: 'Пароль', type: 'password' },
]

export default function LoginPage() {

  const { formData, handleChange, handleSubmit } = useAuthForm(formFields, '/files', false)
  const isLoading = useSelector(state => state.auth.loading);
  const errors = useSelector(state => state.auth.errors);


  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">

          <AuthForm
            title="Вход в аккаунт"
            submitText="Войти"
            fields={formFields}
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={(e) => handleSubmit(e, '/login/')}
            isLoading={isLoading}
            footerLink={{
              text: "Нет учетной записи?",
              to: "/register",
              linkText: "Создать"
            }}
          />
        </div>
      </div>
    </div>
  )

}