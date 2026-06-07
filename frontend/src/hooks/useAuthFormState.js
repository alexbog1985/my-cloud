import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setErrors } from '../store/slices/authSlice';
import { validateForm, validateField } from '../utils/validators';

export const useAuthFormState = (formFields) => {
  const dispatch = useDispatch();
  const { errors } = useSelector(state => state.auth);

  const [formData, setFormData] = useState(() =>
    formFields.reduce((acc, field) => ({
      ...acc,
      [field.name]: '',
    }), {})
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      dispatch(setErrors({ ...errors, [name]: null }));
    }
  };

  const validateFieldLocal = (name, value) => {
    return validateField(name, value, formData);
  };

  const validateFormLocal = () => {
    return validateForm(formData, formFields);
  }

  return {
    formData,
    handleChange,
    errors,
    validateField: validateFieldLocal,
    validateForm: validateFormLocal
  };
};
