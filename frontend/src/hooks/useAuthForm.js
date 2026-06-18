import { useAuthFormState } from './useAuthFormState';
import { useAuthSubmit } from './useAuthSubmit';
import { useDispatch } from 'react-redux';
import { setErrors, clearErrors } from '../store/slices/authSlice';

export const useAuthForm = (formFields, onSuccessRedirectPath = '/files', validation = true) => {
  const dispatch = useDispatch();
  const { formData, handleChange, errors, validateForm: validateFormLocal } = useAuthFormState(formFields);
  const handleSubmitRequest = useAuthSubmit(onSuccessRedirectPath);

  const handleSubmit = async (e, apiUrl) => {
    e.preventDefault();

    if (validation) {
      const { isValid, errors: validationErrors } = validateFormLocal();

      if (!isValid) {
        dispatch(setErrors(validationErrors));
        return;
      }
    }

    try {
      await handleSubmitRequest(apiUrl, formData);
    } catch {
      // Ошибки уже обработаны в useAuthSubmit
    }
  };

  const clearFormErrors = () => {
    dispatch(clearErrors());
  };

  return {
    formData,
    handleChange,
    errors,
    handleSubmit,
    clearFormErrors
  };
};
