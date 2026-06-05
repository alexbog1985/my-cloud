import { useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {setLoading, setUser, setToken, setErrors, clearErrors} from "../store/slices/authSlice";
import { formatApiError } from "../utils/formatApiError";
import { validateForm } from "../utils/authValidators";
import { useApi } from "./useApi";
import { useNotifications } from "./useNotifications";

export const useAuthForm = (formFields, onSuccessRedirectPath = '/files', validation = true) => {
  const { request } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, success } = useNotifications();
  const errors = useSelector(state => state.auth.errors);

  const [formData, setFormData] = useState(formFields.reduce((acc, field) => ({
    ...acc,
    [field.name]: ''
  }), {}));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      dispatch(setErrors({ ...errors, [name]: null }));
    }
  };

  const handleSubmit = async (e, apiUrl) => {
    e.preventDefault();

    if (validation) {
      const { errors: clientErrors, isValid } = validateForm(formData, formFields);

      if (!isValid) {
        dispatch(setErrors(clientErrors));
        return;
      }
    }

    dispatch(setLoading());
    dispatch(clearErrors());

    try {
      const response = await request({ url: apiUrl, method: 'POST', data: formData });

      if (response.data.access) {
        dispatch(setToken(response.data.access));
      }

      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }

      if (apiUrl.includes('/login')) {
        success('Вы успешно вошли в систему');
      } else if (apiUrl.includes('/register')) {
        success('Регистрация прошла успешно! Теперь вы можете войти.');
      }

      navigate(onSuccessRedirectPath);

    } catch (err) {
      const apiErrors = formatApiError(err.response?.data);
      dispatch(setErrors(apiErrors));


      if (apiErrors.detail) {
        error(apiErrors.detail);
      } else {
        dispatch(setErrors(apiErrors));
        error("Ошибка авторизации")
      }
    }
  }
  return {
    formData,
    handleChange,
    handleSubmit,
  }
};