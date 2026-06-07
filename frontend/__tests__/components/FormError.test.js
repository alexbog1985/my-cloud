const { render, screen } = require('@testing-library/react');
const FormError = require('../../src/components/ui/FormError').default;

describe('FormError', () => {
  test('renders null when error is not provided', () => {
    const { container } = render(<FormError />);
    expect(container.firstChild).toBeNull();
  });

  test('renders null when error is null', () => {
    const { container } = render(<FormError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders null when error is empty string', () => {
    const { container } = render(<FormError error="" />);
    expect(container.firstChild).toBeNull();
  });

  test('renders string error message', () => {
    render(<FormError error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  test('renders first element of array error', () => {
    render(<FormError error={['First error', 'Second error']} />);
    expect(screen.getByText('First error')).toBeInTheDocument();
  });

  test('renders first value of object error with array value', () => {
    render(<FormError error={{ field: ['Array error 1', 'Array error 2'] }} />);
    expect(screen.getByText('Array error 1')).toBeInTheDocument();
  });

  test('renders first value of object error with string value', () => {
    render(<FormError error={{ field: 'String error' }} />);
    expect(screen.getByText('String error')).toBeInTheDocument();
  });

  test('handles object error with empty keys', () => {
    const { container } = render(<FormError error={{}} />);
    expect(container.firstChild).toBeNull();
  });

  test('handles null object error', () => {
    const { container } = render(<FormError error={{ field: null }} />);
    expect(container.firstChild).toBeNull();
  });

  test('handles empty array error', () => {
    const { container } = render(<FormError error={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders message from nested object error', () => {
    render(<FormError error={{ field: { nested: 'Nested error' } }} />);
    expect(screen.getByText('Nested error')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    render(<FormError error="Error message" />);
    const element = screen.getByText('Error message');
    expect(element).toHaveClass('invalid-feedback');
    expect(element).toHaveClass('d-block');
  });

  test('clears message when error is set to null after having value', () => {
    const { container, rerender } = render(<FormError error="Initial error" />);
    expect(container.firstChild).not.toBeNull();

    rerender(<FormError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('handles object with multiple keys - uses first key', () => {
    render(<FormError error={{ field1: 'Error 1', field2: 'Error 2' }} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
  });

  test('handles complex nested object error', () => {
    render(<FormError error={{ field: { nested: { deep: 'Deep error' } } }} />);
    expect(screen.getByText('Deep error')).toBeInTheDocument();
  });
});
