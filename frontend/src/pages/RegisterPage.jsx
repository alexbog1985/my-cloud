import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useApi } from "../hooks/useApi.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, setUser, setToken } from "../store/slices/authSlice.js";
import RegisterForm, { FormFields } from '../components/auth/RegisterForm.jsx'
import { validateForm } from "../components/utils/validationRegister.js";

export default function RegisterPage() {
  const { request } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.auth.loading)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState( {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: ''
  })

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
    const { errors: formErrors, isValid } = validateForm(formData, FormFields);

    if (isValid) {
      dispatch(setLoading())

      try {
        const response = await request('/register/', 'POST', formData);
        dispatch(setUser(response.user));
        navigate('/files')
      } catch (err) {
        dispatch(setError('Ошибка регистрации'))
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Создайте аккаунт</h2>

          <RegisterForm
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <div className="text-center mt-3">
            <small className="text-muted">
              Уже есть аккаунт?
              <Link to={"/login"} className="text-primary text-decoration-none"> Войти.</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  )
};