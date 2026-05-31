import { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setErrors, setUser, setToken, clearErrors } from "../store/slices/authSlice.js";
import { formatApiError } from "../utils/formatApiError.js";
import { validateForm } from "../utils/authValidators.js";
import { useApi } from "./useApi.js";

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
      const response = await request({ url: apiUrl, method: 'POST', data: formData });

      if (response.data.access) {
        dispatch(setToken(response.data.access))
      }

      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }

      navigate(onSuccessRedirectPath);

    } catch (err) {
      const apiErrors = formatApiError(err);
      dispatch(setErrors(apiErrors.response.data));
    }
  }
  return {
    formData,
    handleChange,
    handleSubmit,
  }
};