import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from "../hooks/useApi.js";
import { useDispatch, useSelector } from "react-redux";
import AuthForm from '../components/ui/AuthForm';
import { validateForm } from "../components/utils/validationRegister.js";
import AuthFormLink from "../components/ui/AuthFormLink.jsx";
import {
  setLoading,
  setErrors,
  setUser,
  setToken,
  clearErrors } from "../store/slices/authSlice.js";
import {formatApiError} from "../components/utils/formatApiError.js";


export const formFields = [
  {name: 'username', label: 'Логин', type: 'text', required: true},
  {name: 'first_name', label: 'Имя', type: 'text', required: true},
  {name: 'last_name', label: 'Фамилия', type: 'text', required: true},
  {name: 'email', label: 'Email', type: 'email', required: true},
  {name: 'password', label: 'Пароль', type: 'password', required: true},
  {name: 'password_confirm', label: 'Подтверждение пароля', type: 'password', required: true},
]

export default function RegisterPage() {
  const { request } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(state => state.auth.loading)
  const errors = useSelector(state => state.auth.errors);

  const [formData, setFormData] = useState( {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: ''
  })

  useEffect(() => {
    return () => {
      dispatch(clearErrors())
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
    setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(formData, formFields);

    if (isValid) {
      dispatch(setLoading());
      dispatch(clearErrors());

      try {
        const response = await request('/register/', 'POST', formData);
        dispatch(setUser(response.user));
        dispatch(setToken(response.access));
        navigate('/files');
      } catch (err) {
        const apiErrors = formatApiError(err);
        dispatch(setErrors(apiErrors));
      }
    } else {
      dispatch(setErrors(validationErrors));
    }
  };

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
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <AuthFormLink
            to="/login"
            askText="Уже есть аккаунт?"
            linkText="Войти"
          />
        </div>
      </div>
    </div>
  )
};