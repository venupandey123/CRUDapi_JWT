// tests/taskController.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Task = require('../../models/Task');

// Mock the auth middleware to bypass JWT verification
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'dummyUserId' }; // Mocked user
  next();
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Task.deleteMany();
});

describe('Task Controller', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      await Task.create([
        { title: 'Task 1', description: 'Test task', status: 'To Do' },
        { title: 'Task 2', description: 'Another task', status: 'Done' },
      ]);

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    // Added test for sorting based on createdAt field to cover line 10
    it('should return tasks sorted by createdAt', async () => {
      const task1 = await Task.create({ title: 'Task 1', description: 'Test task', status: 'To Do' });
      const task2 = await Task.create({ title: 'Task 2', description: 'Another task', status: 'Done' });

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body[0]._id).toBe(task2._id.toString()); // The most recent task should come first
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'New Task', description: 'Testing', status: 'To Do' };

      const res = await request(app).post('/api/tasks').send(newTask);
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(newTask.title);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/tasks').send({ description: 'No title' });
      expect(res.statusCode).toBe(400);
    });

    // Added test to cover task creation for missing fields to cover line 27
    it('should return 400 if description is missing', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'No description', status: 'To Do' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update the task', async () => {
      const task = await Task.create({ title: 'Old Title', description: '', status: 'To Do' });

      const res = await request(app).put(`/api/tasks/${task._id}`).send({
        title: 'Updated Title',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existing task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/tasks/${fakeId}`).send({ title: 'New' });
      expect(res.statusCode).toBe(404);
    });

    // Added test to validate runValidators option and the new task return value to cover line 46
    it('should update task with validation and return updated task', async () => {
      const task = await Task.create({ title: 'Old Title', description: '', status: 'To Do' });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send({ title: 'Updated Title', description: 'Updated description' });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.description).toBe('Updated description');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete the task', async () => {
      const task = await Task.create({ title: 'To Delete', description: '', status: 'To Do' });

      const res = await request(app).delete(`/api/tasks/${task._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Task deleted');
    });

    it('should return 404 if task does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    // Added test for task deletion to cover line 61
    it('should return 404 when trying to delete a non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
