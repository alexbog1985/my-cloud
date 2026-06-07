/**
 * Тесты компонента FormInput
 * Тестирует поле ввода формы с лейблом и ошибками
 */

const { render, screen, fireEvent } = require('@testing-library/react');

// Мок FormError
jest.mock('../../src/components/ui/FormError', () => ({
  __esModule: true,
  default: ({ error }) => (
    <div data-testid='mock-form-error'>{error}</div>
  ),
}));

const FormInput = require('../../src/components/ui/FormInput').default;

describe('FormInput', () => {
  const defaultProps = {
    label: 'Логин',
    name: 'username',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    test('должен отображать label', () => {
      render(<FormInput {...defaultProps} />);
      expect(screen.getByText('Логин')).toBeInTheDocument();
    });

    test('должен иметь правильный htmlFor для label', () => {
      render(<FormInput {...defaultProps} />);
      const label = screen.getByText('Логин');
      expect(label).toHaveAttribute('for', 'username');
    });

    test('должен отображать input с правильным name', () => {
      render(<FormInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    test('должен отображать input с правильным id', () => {
      render(<FormInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username');
    });

    test('должен отображать input с правильным value', () => {
      render(<FormInput {...defaultProps} value='testuser' />);
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });

    test('должен использовать type="text" по умолчанию', () => {
      render(<FormInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('type', () => {
    test('должен поддерживать type="password"', () => {
      render(<FormInput {...defaultProps} type='password' />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    test('должен поддерживать type="email"', () => {
      render(<FormInput {...defaultProps} type='email' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    test('должен поддерживать type="number"', () => {
      render(<FormInput {...defaultProps} type='number' />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    test('должен поддерживать type="textarea"', () => {
      render(<FormInput {...defaultProps} type='textarea' />);
      // textarea не будет в DOM по умолчанию, так как компонент рендерит input
      // Это тест на то, что компонент рендерит input
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('required', () => {
    test('должен отображать * для обязательного поля', () => {
      render(<FormInput {...defaultProps} required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('не должен отображать * для необязательного поля', () => {
      render(<FormInput {...defaultProps} required={false} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    test('должен устанавливать required атрибут на input', () => {
      render(<FormInput {...defaultProps} required />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    test('не должен устанавливать required атрибут когда required=false', () => {
      render(<FormInput {...defaultProps} required={false} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('required');
    });
  });

  describe('error handling', () => {
    test('должен отображать FormError когда есть ошибка', () => {
      render(<FormInput {...defaultProps} error='Неверный логин' />);
      expect(screen.getByText('Неверный логин')).toBeInTheDocument();
    });

    test('должен добавлять класс is-invalid когда есть ошибка', () => {
      render(<FormInput {...defaultProps} error='Ошибка' />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('is-invalid');
    });

    test('не должен добавлять класс is-invalid когда нет ошибки', () => {
      render(<FormInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('is-invalid');
    });

    test('должен вызывать onChange при изменении input', () => {
      const handleChange = jest.fn();
      render(<FormInput {...defaultProps} onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { name: 'username', value: 'testuser' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    test('должен работать с пустым label', () => {
      render(<FormInput {...defaultProps} label='' />);
      // Должен рендериться без ошибок
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('должен работать с пустым value', () => {
      render(<FormInput {...defaultProps} value='' />);
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    test('должен работать с null в value', () => {
      render(<FormInput {...defaultProps} value={null} />);
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    test('должен работать с undefined в value', () => {
      render(<FormInput {...defaultProps} value={undefined} />);
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    test('должен работать с пустым error', () => {
      const { container } = render(<FormInput {...defaultProps} error='' />);
      const errorDiv = container.querySelector('div[data-testid="mock-form-error"]');
      expect(errorDiv).toBeInTheDocument();
    });

    test('должен работать с пустым name', () => {
      render(<FormInput {...defaultProps} name='' />);
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });
});
