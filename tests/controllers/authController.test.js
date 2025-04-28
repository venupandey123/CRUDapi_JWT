const request = require('supertest');
const app = require('../../app'); // Your Express app
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the User model
jest.mock('../../models/User');

// Mock JWT signing
jest.mock('jsonwebtoken');

// Mock User.findOne and User.create
User.findOne = jest.fn();
User.create = jest.fn();

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test suite for authController
describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a user with valid data', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const createdUser = { _id: '1', username: 'testuser' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue('fakeToken');

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('token', 'fakeToken');
    });

    it('should return error if user already exists', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      User.findOne.mockResolvedValue({});

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should return error if registration fails', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Database error'));

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error registering user');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const user = {
        _id: '1',
        username: 'testuser',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);
      jwt.sign.mockReturnValue('fakeToken');

      const res = await request(app).post('/api/auth/login').send(userData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('token', 'fakeToken');
    });

    it('should return error if credentials are invalid', async () => {
      const userData = { username: 'testuser', password: 'wrongpassword' };
      const user = {
        _id: '1',
        username: 'testuser',
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(user);

      const res = await request(app).post('/api/auth/login').send(userData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return error if user does not exist', async () => {
      const userData = { username: 'nonexistent', password: 'password123' };
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send(userData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return error if login fails', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app).post('/api/auth/login').send(userData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Login failed');
    });
  });
});
