
import { useSelector } from "react-redux";
import AuthForm from "../components/ui/AuthForm.jsx";
import AuthFormLink from "../components/ui/AuthFormLink.jsx";
import {useAuthForm} from "../hooks/useAuthForm.js";

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
          />

          <AuthFormLink
            to="/register"
            askText="Нет учетной записи?"
            linkText="Создать"
          />
        </div>
      </div>
    </div>
  )

}