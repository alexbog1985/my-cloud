/**
 * Тесты компонента Button
 * Тестирует универсальную кнопку с поддержкой Link и button
 */

const { render, screen } = require('@testing-library/react');

// Мок react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }) => (
    <a href={to} className={className} {...props}>{children}</a>
  ),
}));

const Button = require('../../src/components/ui/Button').default;

describe('Button', () => {
  const defaultProps = {
    children: 'Кнопка',
  };

  describe('basic rendering', () => {
    test('должен отображать children', () => {
      render(<Button {...defaultProps} />);
      expect(screen.getByText('Кнопка')).toBeInTheDocument();
    });

    test('должен иметь класс btn', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn');
    });

    test('должен иметь класс btn-primary по умолчанию', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    test('должен иметь класс btn-lg по умолчанию', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });
  });

  describe('variant', () => {
    test('должен поддерживать variant secondary', () => {
      render(<Button {...defaultProps} variant='secondary' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary');
    });

    test('должен поддерживать variant success', () => {
      render(<Button {...defaultProps} variant='success' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-success');
    });

    test('должен поддерживать variant danger', () => {
      render(<Button {...defaultProps} variant='danger' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-danger');
    });

    test('должен поддерживать variant warning', () => {
      render(<Button {...defaultProps} variant='warning' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-warning');
    });
  });

  describe('size', () => {
    test('должен поддерживать size sm', () => {
      render(<Button {...defaultProps} size='sm' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-sm');
    });

    test('должен поддерживать size lg', () => {
      render(<Button {...defaultProps} size='lg' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });

    test('должен поддерживать size xl', () => {
      render(<Button {...defaultProps} size='xl' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-xl');
    });
  });

  describe('type', () => {
    test('должен иметь type="button" по умолчанию', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    test('должен поддерживать type="submit"', () => {
      render(<Button {...defaultProps} type='submit' />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('должен поддерживать type="reset"', () => {
      render(<Button {...defaultProps} type='reset' />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('extendClass', () => {
    test('должен добавлять дополнительный класс', () => {
      render(<Button {...defaultProps} extendClass='my-custom-class' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
    });

    test('должен добавлять несколько классов', () => {
      render(<Button {...defaultProps} extendClass='class1 class2' />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('class1');
      expect(button).toHaveClass('class2');
    });
  });

  describe('props spreading', () => {
    test('должен поддерживать disabled', () => {
      render(<Button {...defaultProps} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('должен поддерживать onClick', () => {
      const handleClick = jest.fn();
      render(<Button {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('должен поддерживать data-testid', () => {
      render(<Button {...defaultProps} data-testid='my-button' />);
      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });
  });

  describe('Link mode', () => {
    test('должен использовать Link когда передан to', () => {
      render(<Button {...defaultProps} to='/home' />);
      expect(screen.getByRole('link', { name: 'Кнопка' })).toBeInTheDocument();
    });

    test('должен использовать a тег когда передан to', () => {
      render(<Button {...defaultProps} to='/home' />);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });

    test('должен использовать href когда передан to', () => {
      render(<Button {...defaultProps} to='/home' />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/home');
    });

    test('должен использовать className когда передан to', () => {
      render(<Button {...defaultProps} to='/home' />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('btn');
      expect(link).toHaveClass('btn-primary');
      expect(link).toHaveClass('btn-lg');
    });

    test('должен использовать extendClass когда передан to', () => {
      render(<Button {...defaultProps} to='/home' extendClass='custom-link' />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-link');
    });
  });

  describe('edge cases', () => {
    test('должен работать с пустым children', () => {
      render(<Button />);
      // Кнопка должна существовать даже без текста
      expect(document.querySelector('button')).toBeInTheDocument();
    });

    test('должен работать с React element в children', () => {
      render(<Button>{<span>Custom</span>}</Button>);
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    test('должен работать с null в children', () => {
      render(<Button>{null}</Button>);
      // Кнопка должна существовать
      expect(document.querySelector('button')).toBeInTheDocument();
    });

    test('должен работать с пустым extendClass', () => {
      render(<Button {...defaultProps} extendClass='' />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('должен работать с пустым to', () => {
      render(<Button {...defaultProps} to='' />);
      // Должен быть button, а не Link, т.к. пустая строка - falsy
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
