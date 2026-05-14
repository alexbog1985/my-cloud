import { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useApi } from './useApi';
import { setLoading, setErrors, setUser, setToken, clearErrors } from "../store/slices/authSlice.js";
import { formatApiError } from "../components/utils/formatApiError.js";
import { validateForm } from "../components/utils/authValidators.js";

export const useAuthForm = (formFields, onSuccessRedirectPath = '/files', validation = true) => {
  const { request } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(formFields.reduce((acc, field) => ({
    ...acc,
    [field.name]: ''
  }), {}));

  const errors = useSelector(state => state.auth.errors);

  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    }
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      dispatch(setErrors({ ...errors, [name]: null }))
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
      const response = await request(apiUrl, 'POST', formData);

      if (response.access) {
        dispatch(setToken(response.access))
      }

      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }

      if (response.user) {
        dispatch(setUser(response.user));
      }

      navigate(onSuccessRedirectPath);

    } catch (err) {
      const apiErrors = formatApiError(err);
      dispatch(setErrors(apiErrors));
    }
  }
  return {
    formData,
    handleChange,
    handleSubmit,
  }
};