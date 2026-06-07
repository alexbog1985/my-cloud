/**
 * Файл для создания кастомных matchers
 * Расширение возможностей Jest для более читаемых тестов
 */

// Пример кастомного matcher для проверки вызовов с определённым контекстом
expect.extend({
  toHaveBeenCalledWithContext(received, context) {
    const matcherName = 'toHaveBeenCalledWithContext';
    const pass = received.mock.calls.some(call => 
      call[1] === context && typeof call[0] === 'string'
    );
    
    const message = pass 
      ? () => `expected mock function ${matcherName} to not have been called with context "${context}", but it was`
      : () => `expected mock function ${matcherName} to have been called with context "${context}"`;

    return { pass, message };
  },
});

// Кастомный matcher для проверки FormData
expect.extend({
  toHaveFormDataProperty(received, key, expectedValue) {
    const matcherName = 'toHaveFormDataProperty';
    const pass = received.has(key) && received.get(key) === expectedValue;
    
    const message = pass
      ? () => `expected FormData ${matcherName} to not have property "${key}", but it does`
      : () => `expected FormData ${matcherName} to have property "${key}" with value "${expectedValue}"`;

    return { pass, message };
  },
});
