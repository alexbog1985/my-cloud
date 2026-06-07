/**
 * Тесты утилит валидации
 * Юнит-тесты для validators.js без React зависимостей
 */

const {
  validateField,
  validateForm,
  AUTH_FIELD_NAMES,
  PATTERN_USERNAME,
  PATTERN_EMAIL,
  PATTERN_PASSWORD,
  MESSAGES,
} = require('../../src/utils/validators');

describe('Validators', () => {
  describe('AUTH_FIELD_NAMES', () => {
    test('должен содержать все обязательные поля', () => {
      expect(AUTH_FIELD_NAMES).toEqual([
        'username', 'first_name', 'last_name', 'email', 'password', 'password_confirm'
      ]);
    });
  });

  describe('PATTERN_USERNAME', () => {
    test('должен принимать валидный логин', () => {
      expect(PATTERN_USERNAME.test('alex123')).toBe(true);
      expect(PATTERN_USERNAME.test('JohnDoe')).toBe(true);
      expect(PATTERN_USERNAME.test('a1234567890123456789')).toBe(true);
    });

    test('должен отклонять невалидный логин', () => {
      expect(PATTERN_USERNAME.test('1alex')).toBe(false); // начинается с цифры
      expect(PATTERN_USERNAME.test('ab')).toBe(false); // слишком короткий
      expect(PATTERN_USERNAME.test('a'.repeat(21))).toBe(false); // слишком длинный
      expect(PATTERN_USERNAME.test('alex_123')).toBe(false); // содержит недопустимые символы
      expect(PATTERN_USERNAME.test('alex-123')).toBe(false); // содержит дефис
    });
  });

  describe('PATTERN_EMAIL', () => {
    test('должен принимать валидный email', () => {
      expect(PATTERN_EMAIL.test('test@example.com')).toBe(true);
      expect(PATTERN_EMAIL.test('user.name@domain.org')).toBe(true);
      expect(PATTERN_EMAIL.test('user123@test.co.uk')).toBe(true);
    });

    test('должен отклонять невалидный email', () => {
      expect(PATTERN_EMAIL.test('invalid')).toBe(false);
      expect(PATTERN_EMAIL.test('invalid@')).toBe(false);
      expect(PATTERN_EMAIL.test('@example.com')).toBe(false);
      expect(PATTERN_EMAIL.test('user@ domain.com')).toBe(false);
    });
  });

  describe('PATTERN_PASSWORD', () => {
    test('должен принимать валидный пароль', () => {
      expect(PATTERN_PASSWORD.test('Password1@')).toBe(true);
      expect(PATTERN_PASSWORD.test('Test1234!')).toBe(true);
      expect(PATTERN_PASSWORD.test('MyP@ssw0rd')).toBe(true);
    });

    test('должен отклонять невалидный пароль', () => {
      expect(PATTERN_PASSWORD.test('password123')).toBe(false); // нет заглавной буквы
      expect(PATTERN_PASSWORD.test('PASSWORD1@')).toBe(false); // нет строчной буквы
      expect(PATTERN_PASSWORD.test('Password@')).toBe(false); // нет цифры
      expect(PATTERN_PASSWORD.test('Password123')).toBe(false); // нет специального символа
    });
  });

  describe('MESSAGES', () => {
    test('должен содержать все сообщения об ошибках', () => {
      expect(MESSAGES.required).toBeDefined();
      expect(MESSAGES.username).toBeDefined();
      expect(MESSAGES.email).toBeDefined();
      expect(MESSAGES.password).toBeDefined();
      expect(MESSAGES.password_match).toBeDefined();
    });

    test('сообщения должны быть на русском языке', () => {
      expect(MESSAGES.required).toBe('Это поле обязательно для заполнения');
      expect(MESSAGES.username).toBe('Логин должен содержать 4-20 символов, начинаться с буквы и содержать только латинские буквы и цифры');
      expect(MESSAGES.email).toBe('Введите корректный email адрес');
      expect(MESSAGES.password).toBe('Пароль должен содержать минимум 6 символов, одну заглавную букву, одну цифру и один специальный символ');
      expect(MESSAGES.password_match).toBe('Пароли не совпадают');
    });
  });

  describe('validateField', () => {
    describe('required validation', () => {
      test('должен вернуть ошибку для пустого значения', () => {
        expect(validateField('username', '')).toBe(MESSAGES.required);
        expect(validateField('email', '')).toBe(MESSAGES.required);
        expect(validateField('password', '')).toBe(MESSAGES.required);
      });

      test('должен вернуть ошибку для значения только из пробелов', () => {
        expect(validateField('username', '   ')).toBe(MESSAGES.required);
      });

      test('должен вернуть null для валидного значения', () => {
        expect(validateField('username', 'alex123')).toBeNull();
        expect(validateField('email', 'test@example.com')).toBeNull();
      });
    });

    describe('username validation', () => {
      test('должен вернуть ошибку для невалидного логина', () => {
        expect(validateField('username', '1alex')).toBe(MESSAGES.username);
        expect(validateField('username', 'ab')).toBe(MESSAGES.username);
        expect(validateField('username', 'alex_123')).toBe(MESSAGES.username);
      });

      test('должен вернуть null для валидного логина', () => {
        expect(validateField('username', 'alex123')).toBeNull();
        expect(validateField('username', 'JohnDoe')).toBeNull();
      });
    });

    describe('email validation', () => {
      test('должен вернуть ошибку для невалидного email', () => {
        expect(validateField('email', 'invalid')).toBe(MESSAGES.email);
        expect(validateField('email', 'invalid@')).toBe(MESSAGES.email);
      });

      test('должен вернуть null для валидного email', () => {
        expect(validateField('email', 'test@example.com')).toBeNull();
        expect(validateField('email', 'user.name@domain.org')).toBeNull();
      });
    });

    describe('password validation', () => {
      test('должен вернуть ошибку для невалидного пароля', () => {
        expect(validateField('password', 'password123')).toBe(MESSAGES.password);
      });

      test('должен вернуть null для валидного пароля', () => {
        expect(validateField('password', 'Password1@')).toBeNull();
        expect(validateField('password', 'Test1234!')).toBeNull();
      });
    });

    describe('password_confirm validation', () => {
      test('должен вернуть ошибку если пароли не совпадают', () => {
        const formData = { password: 'Password1@' };
        expect(validateField('password_confirm', 'Password2@', formData)).toBe(MESSAGES.password_match);
      });

      test('должен вернуть null если пароли совпадают', () => {
        const formData = { password: 'Password1@' };
        expect(validateField('password_confirm', 'Password1@', formData)).toBeNull();
      });
    });

    describe('cyrillic characters', () => {
      test('должен вернуть ошибку для логина с кириллицей', () => {
        expect(validateField('username', 'алекс123')).toBe(MESSAGES.username);
      });
    });
  });

  describe('validateForm', () => {
    test('должен вернуть ошибки для всех невалидных полей', () => {
      const formData = {
        username: '1alex',
        first_name: '',
        last_name: '',
        email: 'invalid',
        password: 'password123',
        password_confirm: 'Password1@',
      };

      const fields = [
        { name: 'username' },
        { name: 'first_name' },
        { name: 'last_name' },
        { name: 'email' },
        { name: 'password' },
        { name: 'password_confirm' },
      ];

      const { errors, isValid } = validateForm(formData, fields);

      expect(isValid).toBe(false);
      expect(errors.username).toBeDefined();
      expect(errors.first_name).toBeDefined();
      expect(errors.last_name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.password_confirm).toBeDefined();
    });

    test('должен вернуть isValid=true для валидных данных', () => {
      const formData = {
        username: 'alex123',
        first_name: 'Alex',
        last_name: 'Bog',
        email: 'test@example.com',
        password: 'Password1@',
        password_confirm: 'Password1@',
      };

      const fields = [
        { name: 'username' },
        { name: 'first_name' },
        { name: 'last_name' },
        { name: 'email' },
        { name: 'password' },
        { name: 'password_confirm' },
      ];

      const { errors, isValid } = validateForm(formData, fields);

      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    test('должен обрабатывать частичные данные', () => {
      const formData = {
        username: '',
        email: '',
        password: '',
      };

      const fields = [
        { name: 'username' },
        { name: 'email' },
        { name: 'password' },
      ];

      const { errors, isValid } = validateForm(formData, fields);

      expect(isValid).toBe(false);
      expect(errors.username).toBe(MESSAGES.required);
      expect(errors.email).toBe(MESSAGES.required);
      expect(errors.password).toBe(MESSAGES.required);
    });
  });

  describe('edge cases', () => {
    test('должен обрабатывать очень длинные значения', () => {
      const longUsername = 'a'.repeat(100);
      expect(validateField('username', longUsername)).toBe(MESSAGES.username);

      const longEmail = 'a'.repeat(50) + '@example.com';
      expect(validateField('email', longEmail)).toBeNull();
    });

    test('должен обрабатывать специальные символы в пароле', () => {
      expect(validateField('password', 'Pass1!')).toBeNull();
      expect(validateField('password', 'Pass1@')).toBeNull();
      expect(validateField('password', 'Pass1$')).toBeNull();
      expect(validateField('password', 'Pass1%')).toBeNull();
      expect(validateField('password', 'Pass1&')).toBeNull();
      expect(validateField('password', 'Pass1*')).toBeNull();
      expect(validateField('password', 'Pass1?')).toBeNull();
    });
  });
});
