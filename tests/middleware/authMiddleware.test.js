// tests/middleware/authMiddleware.test.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const protect = require('../../middleware/authMiddleware');
const User = require('../../models/User');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', async () => {
    req.headers.authorization = '';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('should attach user to req and call next if token is valid', async () => {
    const mockUser = { _id: 'userId123', name: 'Test User' };
  
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 'userId123' });
  
    // Mocking findById().select() chain
    const selectMock = jest.fn().mockResolvedValue(mockUser);
    User.findById.mockReturnValue({ select: selectMock });
  
    await protect(req, res, next);
  
    expect(User.findById).toHaveBeenCalledWith('userId123');
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });  
});
