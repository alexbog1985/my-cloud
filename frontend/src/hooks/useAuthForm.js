import { useNavigate } from 'react-router-dom';
import { useAuthFormState } from './useAuthFormState';
import { useAuthSubmit } from './useAuthSubmit';

export const useAuthForm = (formFields, onSuccessRedirectPath = '/files', validation = true) => {
  const { formData, handleChange, errors, validateForm: validateFormLocal } = useAuthFormState(formFields);
  const handleSubmitRequest = useAuthSubmit(onSuccessRedirectPath);
  const navigate = useNavigate();

  const handleSubmit = async (e, apiUrl) => {
    e.preventDefault();

    if (validation) {
      const { errors: clientErrors, isValid } = validateFormLocal();

      if (!isValid) {
        // Ошибки уже установлены в useAuthFormState через dispatch
        return;
      }
    }

    try {
      await handleSubmitRequest(apiUrl, formData, navigate);
    } catch (err) {
      // Ошибки уже обработаны в useAuthSubmit
    }
  };

  return {
    formData,
    handleChange,
    errors,
    handleSubmit
  };
};
