const mockRequest = jest.fn();

const api = jest.fn().mockImplementation((config) => {
  return mockRequest(config);
});

api.get = mockRequest;
api.post = mockRequest;
api.put = mockRequest;
api.delete = mockRequest;
api.patch = mockRequest;

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
