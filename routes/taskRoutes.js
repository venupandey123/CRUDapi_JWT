const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const taskController = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');


// GET all tasks
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (Protected)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', protect, taskController.getAllTasks);

// POST a new task
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (Protected)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', protect, body('title').notEmpty().withMessage('Title is required'), taskController.createTask);

// PUT update a task
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by ID (Protected)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put('/:id', protect, taskController.updateTask);

// DELETE a task
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID (Protected)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete('/:id', protect, taskController.deleteTask);

module.exports = router;

