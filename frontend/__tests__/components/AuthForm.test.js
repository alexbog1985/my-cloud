/**
 * Тесты компонента AuthForm
 * Тестирует универсальную форму авторизации/регистрации
 */

const { render, screen, fireEvent } = require('@testing-library/react');

// Моки для компонентов
const mockFormInput = jest.fn(({ name, label, type, value, onChange, error }) => {
  return (
    <div data-testid={`mock-form-input-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

const mockButton = jest.fn(({ type, children, disabled }) => (
  <button type={type} disabled={disabled}>
    {children}
  </button>
));

const mockLink = jest.fn(({ to, children }) => (
  <a href={to}>{children}</a>
));

// Мок react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => mockLink({ to, children }),
}));

// Мок компонентов
jest.mock('../../src/components/ui/FormInput', () => ({
  __esModule: true,
  default: (...props) => mockFormInput(...props),
}));

jest.mock('../../src/components/ui/Button', () => ({
  __esModule: true,
  default: (...props) => mockButton(...props),
}));

const AuthForm = require('../../src/components/ui/AuthForm').default;

describe('AuthForm', () => {
  const defaultProps = {
    title: 'Вход в аккаунт',
    submitText: 'Войти',
    fields: [
      { name: 'username', label: 'Логин', type: 'text' },
      { name: 'password', label: 'Пароль', type: 'password' },
    ],
    formData: { username: '', password: '' },
    errors: {},
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    test('должен отображать заголовок', () => {
      render(<AuthForm {...defaultProps} />);

      expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    });

    test('должен отображать все поля формы', () => {
      render(<AuthForm {...defaultProps} />);

      expect(screen.getByText('Логин')).toBeInTheDocument();
      expect(screen.getByText('Пароль')).toBeInTheDocument();
    });

    test('должен отображать кнопку отправки', () => {
      render(<AuthForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Войти' });
      expect(submitButton).toBeInTheDocument();
    });

    test('должен отображать кнопку с правильным текстом', () => {
      render(<AuthForm {...defaultProps} />);

      expect(screen.getByText('Войти')).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    test('должен создавать поля из массива fields', () => {
      const fields = [
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Пароль', type: 'password' },
      ];

      render(<AuthForm {...defaultProps} fields={fields} />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Пароль')).toBeInTheDocument();
    });

    test('должен передавать value в поля ввода', () => {
      const formData = { username: 'testuser', password: '123456' };

      render(<AuthForm {...defaultProps} formData={formData} />);

      const usernameInput = screen.getByDisplayValue('testuser');
      const passwordInput = screen.getByDisplayValue('123456');

      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test('должен передавать ошибки в поля', () => {
      const errors = { username: 'Неверный логин' };

      render(<AuthForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('Неверный логин')).toBeInTheDocument();
    });
  });

  describe('event handlers', () => {
    test('должен вызывать onChange при изменении поля', () => {
      const handleChange = jest.fn();
      render(<AuthForm {...defaultProps} onChange={handleChange} />);

      const inputs = screen.getAllByDisplayValue('');
      const usernameInput = inputs.find(input => input.name === 'username');
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('должен вызывать onSubmit при отправке формы', () => {
      const handleSubmit = jest.fn();
      render(<AuthForm {...defaultProps} onSubmit={handleSubmit} />);

      const formElement = document.querySelector('form');
      fireEvent.submit(formElement);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('должен блокировать кнопку при загрузке', () => {
      render(<AuthForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    test('должен разблокировать кнопку когда нет загрузки', () => {
      render(<AuthForm {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('footer link', () => {
    test('должен отображать footer link если передан', () => {
      const footerLink = {
        text: 'Нет учетной записи?',
        to: '/register',
        linkText: 'Создать',
      };

      render(<AuthForm {...defaultProps} footerLink={footerLink} />);

      expect(screen.getByText('Нет учетной записи?')).toBeInTheDocument();
      expect(screen.getByText('Создать')).toBeInTheDocument();
    });

    test('не должен отображать footer link если не передан', () => {
      render(<AuthForm {...defaultProps} footerLink={null} />);

      expect(screen.queryByText('Нет учетной записи?')).not.toBeInTheDocument();
    });
  });

  describe('submit button text', () => {
    test('должен отображать submitText', () => {
      render(<AuthForm {...defaultProps} submitText='Войти' />);

      expect(screen.getByText('Войти')).toBeInTheDocument();
    });

    test('должен отображать "Загрузка..." при isLoading', () => {
      render(<AuthForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });
  });

  describe('form attributes', () => {
    test('должен иметь атрибут noValidate', () => {
      render(<AuthForm {...defaultProps} />);

      const formElement = document.querySelector('form');
      expect(formElement).toHaveAttribute('novalidate');
    });
  });

  describe('edge cases', () => {
    test('должен работать с пустыми fields', () => {
      render(<AuthForm {...defaultProps} fields={[]} />);

      expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('должен работать с пустым formData', () => {
      render(<AuthForm {...defaultProps} formData={{}} />);

      expect(screen.getByText('Логин')).toBeInTheDocument();
      expect(screen.getByText('Пароль')).toBeInTheDocument();
    });

    test('должен работать с пустыми errors', () => {
      render(<AuthForm {...defaultProps} errors={{}} />);

      expect(screen.queryByText(/^(Неверный|Пожалуйста|Введите)$/)).not.toBeInTheDocument();
    });
  });
});
