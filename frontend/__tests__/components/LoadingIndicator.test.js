/**
 * Тесты компонента LoadingIndicator
 * Тестирует индикатор загрузки с спиннером
 */

const { render, screen } = require('@testing-library/react');

const LoadingIndicator = require('../../src/components/ui/LoadingIndicator').default;

describe('LoadingIndicator', () => {
  describe('basic rendering', () => {
    test('должен отображать спиннер', () => {
      render(<LoadingIndicator />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('должен иметь класс spinner-border', () => {
      render(<LoadingIndicator />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border');
    });

    test('должен иметь класс text-primary', () => {
      render(<LoadingIndicator />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-primary');
    });

    test('должен отображать текст по умолчанию', () => {
      render(<LoadingIndicator />);
      const textSpans = screen.getAllByText('Загрузка...');
      expect(textSpans.length).toBe(2);
      expect(textSpans[0]).toHaveClass('visually-hidden');
      expect(textSpans[1]).toHaveClass('text-primary');
    });
  });

  describe('size', () => {
    test('должен поддерживать size="sm"', () => {
      render(<LoadingIndicator size='sm' />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border-sm');
    });

    test('должен поддерживать size="md" (по умолчанию)', () => {
      render(<LoadingIndicator size='md' />);
      const spinner = screen.getByRole('status');
      expect(spinner).not.toHaveClass('spinner-border-sm');
      expect(spinner).not.toHaveClass('spinner-border-lg');
    });

    test('должен поддерживать size="lg"', () => {
      render(<LoadingIndicator size='lg' />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border-lg');
    });
  });

  describe('text', () => {
    test('должен отображать кастомный текст', () => {
      render(<LoadingIndicator text='Загружаю данные...' />);
      const textSpans = screen.getAllByText('Загружаю данные...');
      expect(textSpans.length).toBe(2);
      expect(textSpans[0]).toHaveClass('visually-hidden');
      expect(textSpans[1]).toHaveClass('text-primary');
    });

    test('должен отображать span с текстом', () => {
      render(<LoadingIndicator text='Загрузка...' />);
      const textSpans = screen.getAllByText('Загрузка...');
      expect(textSpans[1]).toBeInTheDocument();
      expect(textSpans[1]).toHaveClass('text-primary');
    });

    test('не должен отображать текст когда text={null}', () => {
      render(<LoadingIndicator text={null} />);
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });

    test('не должен отображать текст когда text=""', () => {
      render(<LoadingIndicator text='' />);
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
  });

  describe('wrapper', () => {
    test('должен иметь класс d-flex', () => {
      render(<LoadingIndicator />);
      const wrapper = document.querySelector('.d-flex');
      expect(wrapper).toBeInTheDocument();
    });

    test('должен иметь класс align-items-center', () => {
      render(<LoadingIndicator />);
      const wrapper = document.querySelector('.d-flex');
      expect(wrapper).toHaveClass('align-items-center');
    });
  });

  describe('edge cases', () => {
    test('должен работать с пустым текстом', () => {
      render(<LoadingIndicator text='' />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('должен работать с undefined текстом', () => {
      render(<LoadingIndicator text={undefined} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('должен работать с пустым size', () => {
      render(<LoadingIndicator size='' />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('должен работать с null size', () => {
      render(<LoadingIndicator size={null} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });
});
