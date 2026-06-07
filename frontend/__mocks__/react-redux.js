// Мок для useDispatch
export const useDispatch = jest.fn();

// Мок для useSelector
export const useSelector = jest.fn();

// Мок для Provider (если нужен в тестах компонентов)
export const Provider = ({ store, children }) => children;