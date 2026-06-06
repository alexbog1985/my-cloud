import { useFiles } from '../../src/hooks/useFiles';

// Моки для зависимостей
jest.mock('../../src/store/slices/filesSlice');
jest.mock('../../src/hooks/useApi');
jest.mock('../../src/hooks/useNotifications');
jest.mock('../../src/hooks/useApiErrorHandler');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('хук должен быть определен', () => {
    expect(useFiles).toBeDefined();
  });
});