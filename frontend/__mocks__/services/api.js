const mockRequest = jest.fn();

const api = {
  get: mockRequest,
  post: mockRequest,
  put: mockRequest,
  delete: mockRequest,
  patch: mockRequest,
};

api.interceptors = {
  request: {
    use: jest.fn(),
    eject: jest.fn(),
  },
  response: {
    use: jest.fn(),
    eject: jest.fn(),
  },
};

module.exports = api;
